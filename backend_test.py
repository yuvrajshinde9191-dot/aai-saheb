#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for aai Saheb - Women Empowerment Platform
Tests all authentication, SOS, profile, employment, community, and welfare endpoints
"""

import requests
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

class AaiSahebAPITester:
    def __init__(self):
        # Use the production URL from frontend/.env
        self.base_url = "https://wompower-mh.preview.emergentagent.com/api"
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "name": "प्रिया शर्मा",  # Priya Sharma in Marathi
            "phone": "+919876543210",
            "email": "priya.sharma@example.com"
        }
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if self.auth_token:
            default_headers["Authorization"] = f"Bearer {self.auth_token}"
            
        if headers:
            default_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            raise
    
    def test_health_endpoints(self):
        """Test basic health check endpoints"""
        print("\n=== Testing Health Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.make_request("GET", "/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "aai Saheb" in data["message"]:
                    self.log_test("Root Health Check", True, "API root endpoint responding correctly", data)
                else:
                    self.log_test("Root Health Check", False, f"Unexpected response format: {data}")
            else:
                self.log_test("Root Health Check", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Root Health Check", False, f"Exception: {str(e)}")
            
        # Test health endpoint
        try:
            response = self.make_request("GET", "/health")
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check Endpoint", True, "Health endpoint responding correctly", data)
                else:
                    self.log_test("Health Check Endpoint", False, f"Unexpected health status: {data}")
            else:
                self.log_test("Health Check Endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Health Check Endpoint", False, f"Exception: {str(e)}")
    
    def test_authentication_flow(self):
        """Test complete authentication flow: register -> verify OTP -> login -> verify OTP"""
        print("\n=== Testing Authentication Flow ===")
        
        # Test user registration with phone
        try:
            register_data = {
                "name": self.test_user_data["name"],
                "method": "phone",
                "phone": self.test_user_data["phone"]
            }
            
            response = self.make_request("POST", "/auth/register", register_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("User Registration (Phone)", True, "Registration successful, OTP sent", data)
                else:
                    self.log_test("User Registration (Phone)", False, f"Registration failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("User Registration (Phone)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("User Registration (Phone)", False, f"Exception: {str(e)}")
        
        # Test OTP verification for registration (using actual OTP from logs)
        try:
            # In a real test environment, we would get the OTP from logs or use a test OTP
            # For now, let's try a few common test OTPs and also check the actual generated one
            test_otps = ["123456", "000000", "111111"]  # Common test OTPs
            
            # Try to get the actual OTP from recent logs
            try:
                import subprocess
                result = subprocess.run(['tail', '-n', '10', '/var/log/supervisor/backend.err.log'], 
                                      capture_output=True, text=True)
                log_content = result.stdout
                
                # Extract OTP from log line like "INFO:server:Sending OTP 788015 to phone +919876543210"
                import re
                otp_match = re.search(r'Sending OTP (\d{6}) to phone \+919876543210', log_content)
                if otp_match:
                    actual_otp = otp_match.group(1)
                    test_otps.insert(0, actual_otp)  # Try actual OTP first
                    print(f"Found actual OTP in logs: {actual_otp}")
            except Exception as e:
                print(f"Could not extract OTP from logs: {e}")
            
            success = False
            for otp in test_otps:
                otp_data = {
                    "method": "phone",
                    "phone": self.test_user_data["phone"],
                    "otp": otp
                }
            
            response = self.make_request("POST", "/auth/verify-otp", otp_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "token" in data:
                    self.auth_token = data["token"]
                    self.log_test("OTP Verification (Registration)", True, "OTP verified, user created, token received", data)
                else:
                    self.log_test("OTP Verification (Registration)", False, f"OTP verification failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("OTP Verification (Registration)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("OTP Verification (Registration)", False, f"Exception: {str(e)}")
        
        # Test user login
        try:
            login_data = {
                "method": "phone",
                "phone": self.test_user_data["phone"]
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("User Login", True, "Login successful, OTP sent", data)
                else:
                    self.log_test("User Login", False, f"Login failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("User Login", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
        
        # Test email registration
        try:
            register_data = {
                "name": "सुनीता पाटील",  # Sunita Patil in Marathi
                "method": "email",
                "email": "sunita.patil@example.com"
            }
            
            response = self.make_request("POST", "/auth/register", register_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("User Registration (Email)", True, "Email registration successful, OTP sent", data)
                else:
                    self.log_test("User Registration (Email)", False, f"Registration failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("User Registration (Email)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("User Registration (Email)", False, f"Exception: {str(e)}")
    
    def test_profile_management(self):
        """Test user profile management endpoints"""
        print("\n=== Testing Profile Management ===")
        
        if not self.auth_token:
            self.log_test("Profile Management", False, "No auth token available - skipping profile tests")
            return
        
        # Test get profile
        try:
            response = self.make_request("GET", "/profile")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "user" in data:
                    self.log_test("Get User Profile", True, "Profile retrieved successfully", data)
                else:
                    self.log_test("Get User Profile", False, f"Profile retrieval failed: {data}")
            else:
                self.log_test("Get User Profile", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get User Profile", False, f"Exception: {str(e)}")
        
        # Test update profile
        try:
            update_data = {
                "role": "candidate",
                "language": "mr",
                "location": {
                    "city": "पुणे",  # Pune in Marathi
                    "state": "महाराष्ट्र",  # Maharashtra in Marathi
                    "coordinates": {"lat": 18.5204, "lng": 73.8567}
                }
            }
            
            response = self.make_request("PUT", "/profile", update_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Update User Profile", True, "Profile updated successfully", data)
                else:
                    self.log_test("Update User Profile", False, f"Profile update failed: {data}")
            else:
                self.log_test("Update User Profile", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Update User Profile", False, f"Exception: {str(e)}")
        
        # Test add trusted contact
        try:
            contact_data = {
                "name": "राज शर्मा",  # Raj Sharma in Marathi
                "phone": "+919876543211",
                "relationship": "पती",  # Husband in Marathi
                "is_primary": True
            }
            
            response = self.make_request("POST", "/profile/trusted-contacts", contact_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Add Trusted Contact", True, "Trusted contact added successfully", data)
                else:
                    self.log_test("Add Trusted Contact", False, f"Failed to add trusted contact: {data}")
            else:
                self.log_test("Add Trusted Contact", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Add Trusted Contact", False, f"Exception: {str(e)}")
    
    def test_sos_system(self):
        """Test SOS alert system"""
        print("\n=== Testing SOS Alert System ===")
        
        if not self.auth_token:
            self.log_test("SOS System", False, "No auth token available - skipping SOS tests")
            return
        
        alert_id = None
        
        # Test SOS activation
        try:
            sos_data = {
                "location": {
                    "latitude": 18.5204,
                    "longitude": 73.8567,
                    "address": "पुणे, महाराष्ट्र",  # Pune, Maharashtra in Marathi
                    "accuracy": 10
                },
                "is_stealth": False
            }
            
            response = self.make_request("POST", "/sos/activate", sos_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "alert_id" in data:
                    alert_id = data["alert_id"]
                    self.log_test("SOS Activation", True, f"SOS activated successfully, Alert ID: {alert_id}", data)
                else:
                    self.log_test("SOS Activation", False, f"SOS activation failed: {data}")
            else:
                self.log_test("SOS Activation", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("SOS Activation", False, f"Exception: {str(e)}")
        
        # Test get SOS alerts
        try:
            response = self.make_request("GET", "/sos/alerts")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "alerts" in data:
                    self.log_test("Get SOS Alerts", True, f"Retrieved {len(data['alerts'])} SOS alerts", data)
                else:
                    self.log_test("Get SOS Alerts", False, f"Failed to get SOS alerts: {data}")
            else:
                self.log_test("Get SOS Alerts", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get SOS Alerts", False, f"Exception: {str(e)}")
        
        # Test SOS deactivation
        if alert_id:
            try:
                response = self.make_request("POST", f"/sos/deactivate/{alert_id}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_test("SOS Deactivation", True, "SOS deactivated successfully", data)
                    else:
                        self.log_test("SOS Deactivation", False, f"SOS deactivation failed: {data}")
                else:
                    self.log_test("SOS Deactivation", False, f"Status code: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test("SOS Deactivation", False, f"Exception: {str(e)}")
    
    def test_employment_module(self):
        """Test employment and jobs module"""
        print("\n=== Testing Employment Module ===")
        
        if not self.auth_token:
            self.log_test("Employment Module", False, "No auth token available - skipping employment tests")
            return
        
        # Test get jobs
        try:
            response = self.make_request("GET", "/jobs?limit=10")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "jobs" in data:
                    self.log_test("Get Jobs Listing", True, f"Retrieved {len(data['jobs'])} job listings", data)
                else:
                    self.log_test("Get Jobs Listing", False, f"Failed to get jobs: {data}")
            else:
                self.log_test("Get Jobs Listing", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get Jobs Listing", False, f"Exception: {str(e)}")
        
        # Test get jobs with location filter
        try:
            response = self.make_request("GET", "/jobs?location=पुणे&limit=5")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Get Jobs with Location Filter", True, f"Retrieved filtered jobs for Pune", data)
                else:
                    self.log_test("Get Jobs with Location Filter", False, f"Failed to get filtered jobs: {data}")
            else:
                self.log_test("Get Jobs with Location Filter", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get Jobs with Location Filter", False, f"Exception: {str(e)}")
        
        # Test create job posting (should fail for regular user, pass for admin/ngo/candidate)
        try:
            job_data = {
                "title": "महिला सहायक",  # Women Assistant in Marathi
                "company": "महिला विकास संस्था",  # Women Development Organization in Marathi
                "location": "पुणे, महाराष्ट्र",
                "description": "महिलांसाठी विशेष नोकरी संधी. लवचिक वेळापत्रक आणि सुरक्षित कार्य वातावरण.",
                "requirements": ["१२वी पास", "मराठी भाषेचे ज्ञान", "संगणक मूलभूत ज्ञान"],
                "salary_range": "₹15,000 - ₹25,000",
                "is_women_friendly": True
            }
            
            response = self.make_request("POST", "/jobs", job_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Create Job Posting", True, "Job posting created successfully", data)
                else:
                    self.log_test("Create Job Posting", False, f"Job creation failed: {data}")
            elif response.status_code == 403:
                self.log_test("Create Job Posting (Authorization)", True, "Correctly blocked unauthorized job creation", {"status_code": 403})
            else:
                self.log_test("Create Job Posting", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Job Posting", False, f"Exception: {str(e)}")
    
    def test_community_features(self):
        """Test community forum features"""
        print("\n=== Testing Community Features ===")
        
        if not self.auth_token:
            self.log_test("Community Features", False, "No auth token available - skipping community tests")
            return
        
        # Test get community posts
        try:
            response = self.make_request("GET", "/community/posts?limit=10")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "posts" in data:
                    self.log_test("Get Community Posts", True, f"Retrieved {len(data['posts'])} community posts", data)
                else:
                    self.log_test("Get Community Posts", False, f"Failed to get community posts: {data}")
            else:
                self.log_test("Get Community Posts", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get Community Posts", False, f"Exception: {str(e)}")
        
        # Test create community post
        try:
            post_data = {
                "content": "नमस्कार बहिणींनो! मी नुकतीच एक नवीन व्यवसाय सुरू केला आहे. कोणाला काही सल्ला द्यायचा असेल तर कृपया सांगा. 💪👩‍💼",
                "tags": ["व्यवसाय", "महिला_उद्योजक", "सल्ला"],
                "is_anonymous": False
            }
            
            response = self.make_request("POST", "/community/posts", post_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Create Community Post", True, "Community post created successfully", data)
                else:
                    self.log_test("Create Community Post", False, f"Post creation failed: {data}")
            else:
                self.log_test("Create Community Post", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Community Post", False, f"Exception: {str(e)}")
        
        # Test create anonymous post
        try:
            post_data = {
                "content": "मला घरगुती हिंसाचाराची समस्या आहे. कोणी मदत करू शकेल का? कृपया गुप्ततेने.",
                "tags": ["मदत", "सुरक्षा", "गुप्त"],
                "is_anonymous": True
            }
            
            response = self.make_request("POST", "/community/posts", post_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Create Anonymous Post", True, "Anonymous post created successfully", data)
                else:
                    self.log_test("Create Anonymous Post", False, f"Anonymous post creation failed: {data}")
            else:
                self.log_test("Create Anonymous Post", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Anonymous Post", False, f"Exception: {str(e)}")
    
    def test_welfare_schemes(self):
        """Test welfare schemes module"""
        print("\n=== Testing Welfare Schemes ===")
        
        if not self.auth_token:
            self.log_test("Welfare Schemes", False, "No auth token available - skipping welfare schemes tests")
            return
        
        # Test get welfare schemes
        try:
            response = self.make_request("GET", "/welfare-schemes")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "schemes" in data:
                    schemes = data["schemes"]
                    self.log_test("Get Welfare Schemes", True, f"Retrieved {len(schemes)} welfare schemes", data)
                    
                    # Validate scheme structure
                    if schemes:
                        scheme = schemes[0]
                        required_fields = ["id", "name", "name_en", "description", "eligibility", "benefits"]
                        missing_fields = [field for field in required_fields if field not in scheme]
                        if not missing_fields:
                            self.log_test("Welfare Scheme Structure", True, "Scheme data structure is valid")
                        else:
                            self.log_test("Welfare Scheme Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Get Welfare Schemes", False, f"Failed to get welfare schemes: {data}")
            else:
                self.log_test("Get Welfare Schemes", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get Welfare Schemes", False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid endpoint
        try:
            response = self.make_request("GET", "/invalid-endpoint")
            if response.status_code == 404:
                self.log_test("Invalid Endpoint Handling", True, "404 returned for invalid endpoint")
            else:
                self.log_test("Invalid Endpoint Handling", False, f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Endpoint Handling", False, f"Exception: {str(e)}")
        
        # Test unauthorized access
        try:
            # Temporarily remove auth token
            temp_token = self.auth_token
            self.auth_token = None
            
            response = self.make_request("GET", "/profile")
            if response.status_code == 401:
                self.log_test("Unauthorized Access Handling", True, "401 returned for unauthorized access")
            else:
                self.log_test("Unauthorized Access Handling", False, f"Unexpected status code: {response.status_code}")
            
            # Restore auth token
            self.auth_token = temp_token
        except Exception as e:
            self.log_test("Unauthorized Access Handling", False, f"Exception: {str(e)}")
        
        # Test invalid token
        try:
            temp_token = self.auth_token
            self.auth_token = "invalid-token-12345"
            
            response = self.make_request("GET", "/profile")
            if response.status_code == 401:
                self.log_test("Invalid Token Handling", True, "401 returned for invalid token")
            else:
                self.log_test("Invalid Token Handling", False, f"Unexpected status code: {response.status_code}")
            
            self.auth_token = temp_token
        except Exception as e:
            self.log_test("Invalid Token Handling", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Comprehensive aai Saheb Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_authentication_flow()
        self.test_profile_management()
        self.test_sos_system()
        self.test_employment_module()
        self.test_community_features()
        self.test_welfare_schemes()
        self.test_error_handling()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Generate summary
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"⏱️  Total Duration: {duration:.2f} seconds")
        print(f"📈 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"   • {test['test']}: {test['details']}")
        
        print("\n🎯 CRITICAL ISSUES FOUND:")
        critical_issues = []
        for test in self.test_results:
            if not test["success"] and any(keyword in test["test"].lower() for keyword in ["health", "auth", "sos"]):
                critical_issues.append(f"   • {test['test']}: {test['details']}")
        
        if critical_issues:
            for issue in critical_issues:
                print(issue)
        else:
            print("   None - All critical systems are functional")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "duration": duration,
            "critical_issues": len(critical_issues),
            "results": self.test_results
        }

def main():
    """Main test execution function"""
    tester = AaiSahebAPITester()
    results = tester.run_all_tests()
    
    # Save detailed results to file
    with open("/app/test_results_detailed.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n💾 Detailed results saved to: /app/test_results_detailed.json")
    
    return results

if __name__ == "__main__":
    main()