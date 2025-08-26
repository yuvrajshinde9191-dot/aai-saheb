import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Comprehensive translations for the entire app
const translations = {
  en: {
    // Common
    appName: 'aai Saheb',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    
    // Auth
    login: 'Login',
    register: 'Register',
    phone: 'Phone Number',
    email: 'Email Address',
    otp: 'OTP',
    verifyOTP: 'Verify OTP',
    sendOTP: 'Send OTP',
    
    // Navigation
    home: 'Home',
    sos: 'SOS',
    employment: 'Employment',
    community: 'Community',
    profile: 'Profile',
    
    // SOS
    emergencyActivated: 'Emergency Activated',
    sosActivated: 'SOS Alert Activated',
    recordingStarted: 'Emergency Recording Started',
    contactsNotified: 'Trusted contacts have been notified',
    
    // Employment
    jobs: 'Jobs',
    skills: 'Skills',
    searchJobs: 'Search Jobs',
    applyNow: 'Apply Now',
    
    // Community
    posts: 'Posts',
    groups: 'Groups',
    createPost: 'Create Post',
    joinGroup: 'Join Group',
    
    // Profile
    settings: 'Settings',
    logout: 'Logout',
    editProfile: 'Edit Profile',
    achievements: 'Achievements',
  },
  hi: {
    // Common
    appName: 'आई साहेब',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफल',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सेव करें',
    continue: 'जारी रखें',
    back: 'वापस',
    next: 'अगला',
    finish: 'समाप्त',
    
    // Auth
    login: 'लॉगिन',
    register: 'पंजीकरण',
    phone: 'फ़ोन नंबर',
    email: 'ईमेल पता',
    otp: 'ओटीपी',
    verifyOTP: 'ओटीपी सत्यापित करें',
    sendOTP: 'ओटीपी भेजें',
    
    // Navigation
    home: 'होम',
    sos: 'एसओएस',
    employment: 'रोजगार',
    community: 'समुदाय',
    profile: 'प्रोफाइल',
    
    // SOS
    emergencyActivated: 'आपातकाल सक्रिय',
    sosActivated: 'एसओएस अलर्ट सक्रिय',
    recordingStarted: 'आपातकालीन रिकॉर्डिंग शुरू',
    contactsNotified: 'विश्वसनीय संपर्कों को सूचित किया गया',
    
    // Employment
    jobs: 'नौकरियां',
    skills: 'कौशल',
    searchJobs: 'नौकरी खोजें',
    applyNow: 'अभी आवेदन करें',
    
    // Community
    posts: 'पोस्ट',
    groups: 'समूह',
    createPost: 'पोस्ट बनाएं',
    joinGroup: 'समूह में शामिल हों',
    
    // Profile
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    editProfile: 'प्रोफाइल संपादित करें',
    achievements: 'उपलब्धियां',
  },
  mr: {
    // Common
    appName: 'आई साहेब',
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यशस्वी',
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    save: 'जतन करा',
    continue: 'सुरू ठेवा',
    back: 'मागे',
    next: 'पुढे',
    finish: 'समाप्त',
    
    // Auth
    login: 'लॉगिन',
    register: 'नोंदणी',
    phone: 'फोन नंबर',
    email: 'ईमेल पत्ता',
    otp: 'ओटीपी',
    verifyOTP: 'ओटीपी सत्यापित करा',
    sendOTP: 'ओटीपी पाठवा',
    
    // Navigation
    home: 'होम',
    sos: 'एसओएस',
    employment: 'रोजगार',
    community: 'समुदाय',
    profile: 'प्रोफाइल',
    
    // SOS
    emergencyActivated: 'आणीबाणी सक्रिय',
    sosActivated: 'एसओएस अलर्ट सक्रिय',
    recordingStarted: 'आणीबाणी रेकॉर्डिंग सुरू',
    contactsNotified: 'विश्वसनीय संपर्कांना सूचित केले',
    
    // Employment
    jobs: 'नोकर्‍या',
    skills: 'कौशल्ये',
    searchJobs: 'नोकरी शोधा',
    applyNow: 'आता अर्ज करा',
    
    // Community
    posts: 'पोस्ट',
    groups: 'गट',
    createPost: 'पोस्ट तयार करा',
    joinGroup: 'गटात सामील व्हा',
    
    // Profile
    settings: 'सेटिंग्ज',
    logout: 'लॉगआउट',
    editProfile: 'प्रोफाइल संपादित करा',
    achievements: 'उपलब्धी',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (storedLanguage && ['en', 'hi', 'mr'].includes(storedLanguage)) {
        setLanguageState(storedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading stored language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};