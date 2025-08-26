import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from './contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const roles = [
  { id: 'voter', icon: 'ballot', nameEn: 'Voter', nameHi: 'मतदाता', nameMr: 'मतदार' },
  { id: 'job_seeker', icon: 'briefcase', nameEn: 'Job Seeker', nameHi: 'नौकरी तलाशने वाला', nameMr: 'नोकरी शोधक' },
  { id: 'student', icon: 'school', nameEn: 'Student', nameHi: 'छात्र', nameMr: 'विद्यार्थी' },
  { id: 'volunteer', icon: 'heart', nameEn: 'Volunteer', nameHi: 'स्वयंसेवक', nameMr: 'स्वयंसेवक' },
  { id: 'candidate', icon: 'person-add', nameEn: 'Candidate', nameHi: 'उम्मीदवार', nameMr: 'उमेदवार' },
  { id: 'ngo', icon: 'people', nameEn: 'NGO Partner', nameHi: 'एनजीओ पार्टनर', nameMr: 'एनजीओ भागीदार' },
];

const languages = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { id: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export default function OnboardingScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [consentGiven, setConsentGiven] = useState(false);

  const steps = [
    'language',
    'role',
    'consent',
    'complete'
  ];

  const translations = {
    en: {
      welcome: 'Welcome to aai Saheb',
      languageSelection: 'Choose Your Language',
      roleSelection: 'Select Your Role',
      dataConsent: 'Privacy & Data Consent',
      getStarted: "Let's Get Started",
      next: 'Next',
      back: 'Back',
      finish: 'Complete Setup',
      consentText: 'I agree to the data processing as per DPDP Act 2023. Your data will be used solely for women empowerment services.',
      consentRequired: 'Please accept the consent to continue',
      roleRequired: 'Please select your role to continue',
    },
    hi: {
      welcome: 'आई साहेब में आपका स्वागत है',
      languageSelection: 'अपनी भाषा चुनें',
      roleSelection: 'अपनी भूमिका चुनें',
      dataConsent: 'गोपनीयता और डेटा सहमति',
      getStarted: 'चलिए शुरू करते हैं',
      next: 'आगे',
      back: 'वापस',
      finish: 'सेटअप पूरा करें',
      consentText: 'मैं DPDP अधिनियम 2023 के अनुसार डेटा प्रसंस्करण से सहमत हूं। आपका डेटा केवल महिला सशक्तिकरण सेवाओं के लिए उपयोग किया जाएगा।',
      consentRequired: 'कृपया जारी रखने के लिए सहमति स्वीकार करें',
      roleRequired: 'कृपया जारी रखने के लिए अपनी भूमिका चुनें',
    },
    mr: {
      welcome: 'आई साहेबमध्ये आपले स्वागत आहे',
      languageSelection: 'आपली भाषा निवडा',
      roleSelection: 'आपली भूमिका निवडा',
      dataConsent: 'गोपनीयता आणि डेटा संमती',
      getStarted: 'चला सुरुवात करूया',
      next: 'पुढे',
      back: 'मागे',
      finish: 'सेटअप पूर्ण करा',
      consentText: 'मी DPDP कायदा 2023 नुसार डेटा प्रक्रियेस सहमती देतो. तुमचा डेटा केवळ महिला सशक्तिकरणाच्या सेवांसाठी वापरला जाईल.',
      consentRequired: 'कॉन्टिन्यू करण्यासाठी कृपया संमती स्वीकारा',
      roleRequired: 'कॉन्टिन्यू करण्यासाठी कृपया तुमची भूमिका निवडा',
    },
  };

  const tr = translations[selectedLanguage as keyof typeof translations];

  const handleNext = async () => {
    if (currentStep === 0) {
      // Language selection
      await setLanguage(selectedLanguage as any);
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Role selection
      if (!selectedRole) {
        Alert.alert('Required', tr.roleRequired);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Consent
      if (!consentGiven) {
        Alert.alert('Required', tr.consentRequired);
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      await AsyncStorage.setItem('selectedRole', selectedRole);
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      await AsyncStorage.setItem('consentGiven', 'true');
      
      router.replace('/auth');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderLanguageSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{tr.languageSelection}</Text>
      <View style={styles.optionsContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageOption,
              selectedLanguage === lang.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedLanguage(lang.id as any)}
          >
            <Text style={[
              styles.languageText,
              selectedLanguage === lang.id && styles.selectedText,
            ]}>
              {lang.nativeName}
            </Text>
            <Text style={[
              styles.languageSubtext,
              selectedLanguage === lang.id && styles.selectedText,
            ]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{tr.roleSelection}</Text>
      <View style={styles.rolesGrid}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleOption,
              selectedRole === role.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedRole(role.id)}
          >
            <Ionicons
              name={role.icon as any}
              size={32}
              color={selectedRole === role.id ? '#FFFFFF' : '#FF6B35'}
            />
            <Text style={[
              styles.roleText,
              selectedRole === role.id && styles.selectedText,
            ]}>
              {selectedLanguage === 'mr' ? role.nameMr : 
               selectedLanguage === 'hi' ? role.nameHi : role.nameEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderConsent = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{tr.dataConsent}</Text>
      <View style={styles.consentContainer}>
        <ScrollView style={styles.consentTextContainer}>
          <Text style={styles.consentText}>
            {tr.consentText}
          </Text>
          <Text style={styles.consentDetails}>
            {selectedLanguage === 'mr' ? 
              '• तुमची वैयक्तिक माहिती सुरक्षित ठेवली जाईल\n• तुम्ही कधीही तुमची संमती मागे घेऊ शकता\n• आमच्या गोपनीयता धोरणाबद्दल अधिक माहिती ऐपमध्ये उपलब्ध आहे' :
              selectedLanguage === 'hi' ? 
              '• आपकी व्यक्तिगत जानकारी सुरक्षित रखी जाएगी\n• आप कभी भी अपनी सहमति वापस ले सकते हैं\n• हमारी गोपनीयता नीति के बारे में अधिक जानकारी ऐप में उपलब्ध है' :
              '• Your personal information will be kept secure\n• You can withdraw your consent at any time\n• More details about our privacy policy are available in the app'
            }
          </Text>
        </ScrollView>
        
        <TouchableOpacity
          style={styles.consentCheckbox}
          onPress={() => setConsentGiven(!consentGiven)}
        >
          <Ionicons
            name={consentGiven ? "checkbox" : "square-outline"}
            size={24}
            color="#FF6B35"
          />
          <Text style={styles.consentCheckboxText}>
            {selectedLanguage === 'mr' ? 'मी सहमत आहे' : 
             selectedLanguage === 'hi' ? 'मैं सहमत हूँ' : 'I agree'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={[styles.stepContainer, styles.completeContainer]}>
      <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
      <Text style={styles.completeTitle}>
        {selectedLanguage === 'mr' ? 'स्वागत आहे!' : 
         selectedLanguage === 'hi' ? 'स्वागत है!' : 'Welcome!'}
      </Text>
      <Text style={styles.completeText}>
        {selectedLanguage === 'mr' ? 'तुमचे सेटअप पूर्ण झाले आहे' : 
         selectedLanguage === 'hi' ? 'आपका सेटअप पूरा हो गया है' : 'Your setup is complete'}
      </Text>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderLanguageSelection();
      case 1:
        return renderRoleSelection();
      case 2:
        return renderConsent();
      case 3:
        return renderComplete();
      default:
        return renderLanguageSelection();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E', '#FFD23F']} style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{tr.welcome}</Text>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.contentContainer}>
          {renderStep()}
        </View>

        <View style={styles.buttonsContainer}>
          {currentStep > 0 && currentStep < 3 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>{tr.back}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? tr.finish : 
               currentStep === 0 ? tr.getStarted : tr.next}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  languageOption: {
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  languageSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  rolesGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleOption: {
    width: (width - 80) / 2,
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginTop: 8,
  },
  consentContainer: {
    flex: 1,
  },
  consentTextContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  consentText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  consentDetails: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  consentCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  consentCheckboxText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    fontWeight: '600',
  },
  completeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 8,
  },
  completeText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
});