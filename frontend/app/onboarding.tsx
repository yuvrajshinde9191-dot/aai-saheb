import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languages = [
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const roles = [
  { id: 'voter', name: 'मतदार / Voter', icon: 'person-circle', color: '#FF6B35' },
  { id: 'jobSeeker', name: 'नोकरी शोधणारे / Job Seeker', icon: 'briefcase', color: '#F7931E' },
  { id: 'student', name: 'विद्यार्थी / Student', icon: 'school', color: '#FFD23F' },
  { id: 'volunteer', name: 'स्वयंसेवक / Volunteer', icon: 'hand-left', color: '#4CAF50' },
  { id: 'candidate', name: 'उमेदवार / Candidate', icon: 'podium', color: '#2196F3' },
  { id: 'ngoPartner', name: 'NGO भागीदार / NGO Partner', icon: 'heart', color: '#9C27B0' },
  { id: 'admin', name: 'प्रशासक / Admin', icon: 'settings', color: '#607D8B' },
];

export default function OnboardingScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('mr');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep === 1 && selectedLanguage) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedRole) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      await AsyncStorage.setItem('userRole', selectedRole);
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  const renderLanguageSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>भाषा निवडा / Choose Language</Text>
      <Text style={styles.stepSubtitle}>आपली पसंतीची भाषा निवडा / Select your preferred language</Text>
      
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.optionButton,
            selectedLanguage === lang.code && styles.selectedOption
          ]}
          onPress={() => setSelectedLanguage(lang.code)}
        >
          <Text style={styles.flag}>{lang.flag}</Text>
          <Text style={[
            styles.optionText,
            selectedLanguage === lang.code && styles.selectedOptionText
          ]}>
            {lang.name}
          </Text>
          {selectedLanguage === lang.code && (
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRoleSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>आपली भूमिका निवडा / Select Your Role</Text>
      <Text style={styles.stepSubtitle}>तुम्ही कोण आहात? / Who are you?</Text>
      
      <ScrollView style={styles.roleContainer} showsVerticalScrollIndicator={false}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleButton,
              selectedRole === role.id && { backgroundColor: role.color }
            ]}
            onPress={() => setSelectedRole(role.id)}
          >
            <Ionicons 
              name={role.icon as any} 
              size={24} 
              color={selectedRole === role.id ? '#FFFFFF' : role.color} 
            />
            <Text style={[
              styles.roleText,
              selectedRole === role.id && styles.selectedRoleText
            ]}>
              {role.name}
            </Text>
            {selectedRole === role.id && (
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderConsent = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>डेटा संमती / Data Consent</Text>
      <ScrollView style={styles.consentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.consentText}>
          आम्ही तुमच्या डेटाची काळजी घेतो. कृपया खालील अटी वाचा आणि स्वीकारा:
        </Text>
        <Text style={styles.consentText}>
          We care about your data. Please read and accept the following terms:
        </Text>
        
        <View style={styles.consentPoint}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.pointText}>
            आपला डेटा एकाधिकरण आणि सुरक्षित ठेवला जाईल / Your data will be encrypted and stored securely
          </Text>
        </View>
        
        <View style={styles.consentPoint}>
          <Ionicons name="eye-off" size={20} color="#4CAF50" />
          <Text style={styles.pointText}>
            आपली माहिती तृतीय पक्षांसह सामायिक केली जाणार नाही / Your information will not be shared with third parties
          </Text>
        </View>
        
        <View style={styles.consentPoint}>
          <Ionicons name="trash" size={20} color="#4CAF50" />
          <Text style={styles.pointText}>
            तुम्ही कधीही तुमचा डेटा हटवू शकता / You can delete your data at any time
          </Text>
        </View>
        
        <View style={styles.consentPoint}>
          <Ionicons name="notifications" size={20} color="#4CAF50" />
          <Text style={styles.pointText}>
            आपत्कालीन परिस्थितीत तुमच्या संपर्कांना सूचना दिली जाईल / Emergency contacts will be notified in crisis situations
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  currentStep >= step && styles.activeProgressDot
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepCounter}>{currentStep} / 3</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && renderLanguageSelection()}
          {currentStep === 2 && renderRoleSelection()}
          {currentStep === 3 && renderConsent()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.backText}>मागे / Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              (currentStep === 1 && !selectedLanguage) || 
              (currentStep === 2 && !selectedRole) ? 
              styles.disabledButton : null
            ]}
            onPress={handleNext}
            disabled={
              (currentStep === 1 && !selectedLanguage) || 
              (currentStep === 2 && !selectedRole)
            }
          >
            <Text style={styles.nextText}>
              {currentStep === 3 ? 'सुरु करा / Start' : 'पुढे / Next'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
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
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeProgressDot: {
    backgroundColor: '#FFFFFF',
  },
  stepCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  roleContainer: {
    maxHeight: 400,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roleText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  selectedRoleText: {
    fontWeight: '600',
  },
  consentContainer: {
    maxHeight: 400,
  },
  consentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  consentPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});