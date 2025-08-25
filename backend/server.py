from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import List, Optional
import os
import logging
import asyncio
import json
from pathlib import Path
from dotenv import load_dotenv
import jwt
import bcrypt
from pydantic import BaseModel, Field, EmailStr
import uuid
import random
import string
import requests
from geopy.distance import geodesic
from cryptography.fernet import Fernet

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'aai-saheb-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# FastAPI app
app = FastAPI(title="aai Saheb - Women Empowerment Platform", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Encryption key for sensitive data
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# Pydantic Models
class UserRegister(BaseModel):
    name: str
    method: str  # 'phone' or 'email'
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class UserLogin(BaseModel):
    method: str  # 'phone' or 'email'
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class OTPVerify(BaseModel):
    method: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    otp: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = 'voter'
    language: str = 'mr'
    location: Optional[dict] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    trusted_contacts: List[dict] = []
    sos_settings: dict = {}

class SOSAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    location: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = 'active'  # active, resolved, false_alarm
    media_files: List[str] = []
    contacts_notified: List[str] = []
    is_stealth: bool = False

class TrustedContact(BaseModel):
    name: str
    phone: str
    relationship: str
    is_primary: bool = False

class JobPosting(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = None
    is_women_friendly: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    application_deadline: Optional[datetime] = None

class CommunityPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    media_files: List[str] = []
    tags: List[str] = []
    likes_count: int = 0
    comments_count: int = 0
    is_anonymous: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Utility Functions
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def send_otp_sms(phone: str, otp: str):
    """Send OTP via SMS using the provided API key"""
    api_key = "Ec1gfIE4OQT5jCBwQHGv5KcdV1fGJE3K"
    
    # This is a placeholder for SMS integration
    # You would integrate with a real SMS service like Twilio
    logger.info(f"Sending OTP {otp} to phone {phone} using API key {api_key}")
    
    # Simulate SMS sending
    await asyncio.sleep(1)
    return True

async def send_otp_email(email: str, otp: str):
    """Send OTP via email"""
    # This is a placeholder for email integration
    logger.info(f"Sending OTP {otp} to email {email}")
    
    # Simulate email sending
    await asyncio.sleep(1)
    return True

async def send_emergency_alert(user: dict, location: dict, contacts: List[dict]):
    """Send emergency alerts to trusted contacts and authorities"""
    message = f"EMERGENCY ALERT: {user['name']} has activated SOS. Location: {location.get('address', 'Unknown')}. Please check immediately."
    
    for contact in contacts:
        try:
            # Send SMS to contact
            await send_otp_sms(contact['phone'], f"SOS ALERT from {user['name']}: {message}")
            logger.info(f"Emergency alert sent to {contact['name']} at {contact['phone']}")
        except Exception as e:
            logger.error(f"Failed to send alert to {contact['phone']}: {str(e)}")

# Authentication Routes
@api_router.post("/auth/register")
async def register_user(user_data: UserRegister):
    try:
        # Check if user already exists
        query = {}
        if user_data.method == 'phone':
            query = {"phone": user_data.phone}
        else:
            query = {"email": user_data.email}
            
        existing_user = await db.users.find_one(query)
        if existing_user:
            return {"success": False, "message": "User already exists"}
        
        # Generate and store OTP
        otp = generate_otp()
        otp_data = {
            "otp": otp,
            "method": user_data.method,
            "phone": user_data.phone,
            "email": user_data.email,
            "name": user_data.name,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        }
        
        await db.otps.insert_one(otp_data)
        
        # Send OTP
        if user_data.method == 'phone':
            await send_otp_sms(user_data.phone, otp)
        else:
            await send_otp_email(user_data.email, otp)
            
        return {"success": True, "message": "OTP sent successfully"}
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.post("/auth/login")
async def login_user(user_data: UserLogin):
    try:
        # Check if user exists
        query = {}
        if user_data.method == 'phone':
            query = {"phone": user_data.phone}
        else:
            query = {"email": user_data.email}
            
        user = await db.users.find_one(query)
        if not user:
            return {"success": False, "message": "User not found"}
        
        # Generate and store OTP
        otp = generate_otp()
        otp_data = {
            "otp": otp,
            "method": user_data.method,
            "phone": user_data.phone,
            "email": user_data.email,
            "user_id": user["id"],
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        }
        
        await db.otps.insert_one(otp_data)
        
        # Send OTP
        if user_data.method == 'phone':
            await send_otp_sms(user_data.phone, otp)
        else:
            await send_otp_email(user_data.email, otp)
            
        return {"success": True, "message": "OTP sent successfully"}
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.post("/auth/verify-otp")
async def verify_otp(otp_data: OTPVerify):
    try:
        # Find OTP record
        query = {
            "otp": otp_data.otp,
            "method": otp_data.method,
            "expires_at": {"$gt": datetime.utcnow()}
        }
        
        if otp_data.method == 'phone':
            query["phone"] = otp_data.phone
        else:
            query["email"] = otp_data.email
            
        otp_record = await db.otps.find_one(query)
        if not otp_record:
            return {"success": False, "message": "Invalid or expired OTP"}
        
        # Check if this is registration or login
        if "user_id" in otp_record:
            # Login - user exists
            user = await db.users.find_one({"id": otp_record["user_id"]})
            
            # Update last login
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        else:
            # Registration - create new user
            user_data = User(
                name=otp_record["name"],
                phone=otp_record.get("phone"),
                email=otp_record.get("email"),
                is_verified=True
            )
            
            await db.users.insert_one(user_data.dict())
            user = user_data.dict()
        
        # Delete used OTP
        await db.otps.delete_one({"_id": otp_record["_id"]})
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})
        
        # Remove sensitive data from response
        user_response = {
            "id": user["id"],
            "name": user["name"],
            "phone": user.get("phone"),
            "email": user.get("email"),
            "role": user.get("role", "voter"),
            "language": user.get("language", "mr")
        }
        
        return {
            "success": True,
            "message": "Login successful",
            "token": access_token,
            "user": user_response
        }
        
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="OTP verification failed")

# SOS Routes
@api_router.post("/sos/activate")
async def activate_sos(
    sos_data: dict,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Create SOS alert record
        alert = SOSAlert(
            user_id=current_user["id"],
            location=sos_data.get("location", {}),
            is_stealth=sos_data.get("is_stealth", False)
        )
        
        await db.sos_alerts.insert_one(alert.dict())
        
        # Get user's trusted contacts
        contacts = current_user.get("trusted_contacts", [])
        
        # Send emergency alerts in background
        background_tasks.add_task(
            send_emergency_alert,
            current_user,
            sos_data.get("location", {}),
            contacts
        )
        
        return {
            "success": True,
            "message": "SOS activated successfully",
            "alert_id": alert.id
        }
        
    except Exception as e:
        logger.error(f"SOS activation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to activate SOS")

@api_router.post("/sos/deactivate/{alert_id}")
async def deactivate_sos(
    alert_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Update SOS alert status
        result = await db.sos_alerts.update_one(
            {"id": alert_id, "user_id": current_user["id"]},
            {"$set": {"status": "resolved", "resolved_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="SOS alert not found")
            
        return {"success": True, "message": "SOS deactivated successfully"}
        
    except Exception as e:
        logger.error(f"SOS deactivation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to deactivate SOS")

@api_router.get("/sos/alerts")
async def get_sos_alerts(current_user: dict = Depends(get_current_user)):
    try:
        alerts = await db.sos_alerts.find(
            {"user_id": current_user["id"]}
        ).sort("timestamp", -1).limit(50).to_list(50)
        
        # Convert ObjectId to string for JSON serialization
        for alert in alerts:
            if "_id" in alert:
                alert["_id"] = str(alert["_id"])
        
        return {"success": True, "alerts": alerts}
        
    except Exception as e:
        logger.error(f"Get SOS alerts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch SOS alerts")

# User Profile Routes
@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    try:
        user_data = {
            "id": current_user["id"],
            "name": current_user["name"],
            "phone": current_user.get("phone"),
            "email": current_user.get("email"),
            "role": current_user.get("role", "voter"),
            "language": current_user.get("language", "mr"),
            "location": current_user.get("location"),
            "trusted_contacts": current_user.get("trusted_contacts", [])
        }
        
        return {"success": True, "user": user_data}
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@api_router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Update user profile
        update_data = {
            "role": profile_data.get("role", current_user.get("role")),
            "language": profile_data.get("language", current_user.get("language")),
            "location": profile_data.get("location"),
            "updated_at": datetime.utcnow()
        }
        
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Profile updated successfully"}
        
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@api_router.post("/profile/trusted-contacts")
async def add_trusted_contact(
    contact_data: TrustedContact,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Add trusted contact
        contact = contact_data.dict()
        contact["id"] = str(uuid.uuid4())
        contact["added_at"] = datetime.utcnow()
        
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$push": {"trusted_contacts": contact}}
        )
        
        return {"success": True, "message": "Trusted contact added successfully"}
        
    except Exception as e:
        logger.error(f"Add trusted contact error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add trusted contact")

# Employment Routes
@api_router.get("/jobs")
async def get_jobs(
    skip: int = 0,
    limit: int = 20,
    location: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = {"is_women_friendly": True}
        if location:
            query["location"] = {"$regex": location, "$options": "i"}
            
        jobs = await db.job_postings.find(query).skip(skip).limit(limit).to_list(limit)
        
        return {"success": True, "jobs": jobs}
        
    except Exception as e:
        logger.error(f"Get jobs error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")

@api_router.post("/jobs")
async def create_job(
    job_data: JobPosting,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Only allow certain roles to create job postings
        allowed_roles = ['admin', 'ngoPartner', 'candidate']
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not authorized to create job postings")
            
        job = job_data.dict()
        job["created_by"] = current_user["id"]
        
        await db.job_postings.insert_one(job)
        
        return {"success": True, "message": "Job posting created successfully"}
        
    except Exception as e:
        logger.error(f"Create job error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create job posting")

# Community Routes
@api_router.get("/community/posts")
async def get_community_posts(
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    try:
        posts = await db.community_posts.find({}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
        
        # Convert ObjectId to string for JSON serialization
        for post in posts:
            if "_id" in post:
                post["_id"] = str(post["_id"])
        
        return {"success": True, "posts": posts}
        
    except Exception as e:
        logger.error(f"Get community posts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch community posts")

@api_router.post("/community/posts")
async def create_community_post(
    post_data: dict,
    current_user: dict = Depends(get_current_user)
):
    try:
        post = CommunityPost(
            user_id=current_user["id"],
            content=post_data["content"],
            media_files=post_data.get("media_files", []),
            tags=post_data.get("tags", []),
            is_anonymous=post_data.get("is_anonymous", False)
        )
        
        await db.community_posts.insert_one(post.dict())
        
        return {"success": True, "message": "Post created successfully"}
        
    except Exception as e:
        logger.error(f"Create community post error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create post")

# Welfare Schemes Routes
@api_router.get("/welfare-schemes")
async def get_welfare_schemes(current_user: dict = Depends(get_current_user)):
    try:
        schemes = [
            {
                "id": "1",
                "name": "महिला सशक्तीकरण योजना",
                "name_en": "Women Empowerment Scheme",
                "description": "महिलांसाठी विशेष आर्थिक सहाय्य योजना",
                "description_en": "Special financial assistance scheme for women",
                "eligibility": ["महिला असणे आवश्यक", "वय 18-60 वर्षे", "कुटुंबाचे उत्पन्न ₹3 लाखापेक्षा कमी"],
                "benefits": ["₹50,000 आर्थिक सहाय्य", "कौशल्य विकास प्रशिक्षण", "रोजगार सहाय्य"],
                "application_process": "ऑनलाइन अर्ज करा",
                "documents_required": ["आधार कार्ड", "उत्पन्न प्रमाणपत्र", "बँक पासबुक"]
            },
            {
                "id": "2", 
                "name": "बेटी बचाओ बेटी पढाओ",
                "name_en": "Beti Bachao Beti Padhao",
                "description": "मुलींच्या शिक्षणासाठी विशेष योजना",
                "description_en": "Special scheme for girls' education",
                "eligibility": ["मुलगी असणे आवश्यक", "शैक्षणिक संस्थेत प्रवेश", "कुटुंबाचे उत्पन्न मर्यादेत"],
                "benefits": ["शिक्षण शुल्क माफी", "पुस्तके आणि गणवेश", "मासिक शिष्यवृत्ती"],
                "application_process": "शाळा/महाविद्यालयात अर्ज करा",
                "documents_required": ["जन्म प्रमाणपत्र", "शैक्षणिक प्रमाणपत्रे", "उत्पन्न प्रमाणपत्र"]
            }
        ]
        
        return {"success": True, "schemes": schemes}
        
    except Exception as e:
        logger.error(f"Get welfare schemes error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch welfare schemes")

# General routes
@api_router.get("/")
async def root():
    return {"message": "aai Saheb API - Women Empowerment Platform"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router
app.include_router(api_router)

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return {"error": "Internal server error", "detail": str(exc)}

# Startup/shutdown events
@app.on_event("startup")
async def startup_event():
    logger.info("aai Saheb API starting up...")
    
    # Create indexes for better performance
    await db.users.create_index("phone", unique=True, sparse=True)
    await db.users.create_index("email", unique=True, sparse=True)
    await db.sos_alerts.create_index([("user_id", 1), ("timestamp", -1)])
    await db.otps.create_index("expires_at", expireAfterSeconds=0)
    
    logger.info("Database indexes created successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("aai Saheb API shutting down...")
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)