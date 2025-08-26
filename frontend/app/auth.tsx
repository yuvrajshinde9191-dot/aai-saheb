import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';

export default function AuthScreen() {
  const { language, t } = useLanguage();
  const { login, verifyOTP, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('voter');

  const translations = {
    en: {
      login: 'Login',
      register: 'Register',
      phone: 'Phone Number',
      email: 'Email Address',
      otp: 'Enter OTP',
      sendOTP: 'Send OTP',
      verifyOTP: 'Verify OTP',
      switchToEmail: 'Use Email Instead',
      switchToPhone: 'Use Phone Instead',
      switchToRegister: "Don't have an account? Register",
      switchToLogin: 'Already have an account? Login',
      selectRole: 'Select Your Role',
      phonePlaceholder: '+91 98765 43210',
      emailPlaceholder: 'your@email.com',
      otpPlaceholder: '6-digit OTP',
      roles: {
        voter: 'Voter',
        job_seeker: 'Job Seeker',
        student: 'Student',
        volunteer: 'Volunteer',
        candidate: 'Candidate',
        ngo: 'NGO Partner',
      },
    },
    hi: {
      login: 'लॉगिन',
      register: 'पंजीकरण',
      phone: 'फ़ोन नंबर',
      email: 'ईमेल पता',
      otp: 'ओटीपी दर्ज करें',
      sendOTP: 'ओटीपी भेजें',
      verifyOTP: 'ओटीपी सत्यापित करें',
      switchToEmail: 'ईमेल का उपयोग करें',
      switchToPhone: 'फ़ोन का उपयोग करें',
      switchToRegister: 'खाता नहीं है? पंजीकरण करें',
      switchToLogin: 'पहले से खाता है? लॉगिन करें',
      selectRole: 'अपनी भूमिका चुनें',
      phonePlaceholder: '+91 98765 43210',
      emailPlaceholder: 'your@email.com',
      otpPlaceholder: '6-अंकों का ओटीपी',
      roles: {
        voter: 'मतदाता',
        job_seeker: 'नौकरी तलाशने वाला',
        student: 'छात्र',
        volunteer: 'स्वयंसेवक',
        candidate: 'उम्मीदवार',
        ngo: 'एनजीओ पार्टनर',
      },
    },
    mr: {
      login: 'लॉगिन',
      register: 'नोंदणी',
      phone: 'फोन नंबर',
      email: 'ईमेल पत्ता',
      otp: 'ओटीपी टाका',
      sendOTP: 'ओटीपी पाठवा',
      verifyOTP: 'ओटीपी सत्यापित करा',
      switchToEmail: 'ईमेल वापरा',
      switchToPhone: 'फोन वापरा',
      switchToRegister: 'खाते नाही? नोंदणी करा',
      switchToLogin: 'आधीच खाते आहे? लॉगिन करा',
      selectRole: 'तुमची भूमिका निवडा',
      phonePlaceholder: '+91 98765 43210',
      emailPlaceholder: 'your@email.com',
      otpPlaceholder: '6-अंकी ओटीपी',
      roles: {
        voter: 'मतदार',
        job_seeker: 'नोकरी शोधक',
        student: 'विद्यार्थी',
        volunteer: 'स्वयंसेवक',
        candidate: 'उमेदवार',
        ngo: 'एनजीओ भागीदार',
      },
    },
  };

  const tr = translations[language as keyof typeof translations];

  const handleSendOTP = async () => {
    if (authMethod === 'phone' && !phone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (authMethod === 'email' && !email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await login(
          authMethod === 'phone' ? phone : '',
          authMethod === 'email' ? email : ''
        );
      } else {
        result = await register(
          authMethod === 'phone' ? phone : '',
          authMethod === 'email' ? email : '',
          selectedRole,
          language
        );
      }

      if (result.success) {
        setOtpSent(true);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(
        authMethod === 'phone' ? phone : '',
        authMethod === 'email' ? email : '',
        otp
      );

      if (result.success) {
        Alert.alert('Success', 'Login successful!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelector = () => {
    if (isLogin) return null;

    const roles = Object.entries(tr.roles);

    return (
      <View style={styles.roleContainer}>
        <Text style={styles.roleTitle}>{tr.selectRole}</Text>
        <View style={styles.rolesGrid}>
          {roles.map(([key, name]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.roleButton,
                selectedRole === key && styles.roleButtonSelected,
              ]}
              onPress={() => setSelectedRole(key)}
            >
              <Text style={[
                styles.roleButtonText,
                selectedRole === key && styles.roleButtonTextSelected,
              ]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {isLogin ? tr.login : tr.register}
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Auth Method Toggle */}
              <View style={styles.methodToggle}>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    authMethod === 'phone' && styles.methodButtonActive,
                  ]}
                  onPress={() => setAuthMethod('phone')}
                >
                  <Ionicons name="call" size={20} color={authMethod === 'phone' ? '#FFFFFF' : '#FF6B35'} />
                  <Text style={[
                    styles.methodButtonText,
                    authMethod === 'phone' && styles.methodButtonTextActive,
                  ]}>
                    {tr.phone}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    authMethod === 'email' && styles.methodButtonActive,
                  ]}
                  onPress={() => setAuthMethod('email')}
                >
                  <Ionicons name="mail" size={20} color={authMethod === 'email' ? '#FFFFFF' : '#FF6B35'} />
                  <Text style={[
                    styles.methodButtonText,
                    authMethod === 'email' && styles.methodButtonTextActive,
                  ]}>
                    {tr.email}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Fields */}
              {!otpSent ? (
                <>
                  {authMethod === 'phone' ? (
                    <View style={styles.inputContainer}>
                      <Ionicons name="call" size={20} color="#FF6B35" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={tr.phonePlaceholder}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        maxLength={15}
                      />
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail" size={20} color="#FF6B35" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={tr.emailPlaceholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  )}

                  {renderRoleSelector()}

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Sending...' : tr.sendOTP}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>
                      {tr.otp} ({authMethod === 'phone' ? phone : email})
                    </Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed" size={20} color="#FF6B35" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={tr.otpPlaceholder}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={6}
                        autoFocus
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Verifying...' : tr.verifyOTP}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setOtpSent(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Toggle between Login/Register */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                <Text style={styles.toggleButtonText}>
                  {isLogin ? tr.switchToRegister : tr.switchToLogin}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  methodButtonActive: {
    backgroundColor: '#FF6B35',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  methodButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleButtonSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});