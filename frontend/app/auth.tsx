import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (loginMethod === 'phone' && (!phoneNumber || phoneNumber.length < 10)) {
      Alert.alert('त्रुटी / Error', 'कृपया वैध मोबाइल नंबर प्रविष्ट करा / Please enter a valid phone number');
      return;
    }
    if (loginMethod === 'email' && (!email || !email.includes('@'))) {
      Alert.alert('त्रुटी / Error', 'कृपया वैध ईमेल पत्ता प्रविष्ट करा / Please enter a valid email address');
      return;
    }
    if (authMode === 'signup' && !name.trim()) {
      Alert.alert('त्रुटी / Error', 'कृपया आपले नाव प्रविष्ट करा / Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = {
        method: loginMethod,
        ...(loginMethod === 'phone' ? { phone: phoneNumber } : { email }),
        ...(authMode === 'signup' && { name: name.trim() }),
      };

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload);
      
      if (response.data.success) {
        setIsOtpSent(true);
        Alert.alert(
          'OTP पाठवले / OTP Sent',
          `OTP तुमच्या ${loginMethod === 'phone' ? 'मोबाइल नंबरवर' : 'ईमेल पत्त्यावर'} पाठवले आहे / OTP has been sent to your ${loginMethod === 'phone' ? 'phone number' : 'email address'}`
        );
      } else {
        Alert.alert('त्रुटी / Error', response.data.message || 'OTP पाठवण्यात अयशस्वी / Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('त्रुटी / Error', error.response?.data?.message || 'OTP पाठवण्यात अयशस्वी / Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('त्रुटी / Error', 'कृपया वैध OTP प्रविष्ट करा / Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: loginMethod,
        ...(loginMethod === 'phone' ? { phone: phoneNumber } : { email }),
        otp,
      });

      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        Alert.alert(
          'यशस्वी / Success',
          'तुम्ही यशस्वीरित्या लॉग इन झाला आहात / You have successfully logged in',
          [{ text: 'ठीक आहे / OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('त्रुटी / Error', response.data.message || 'अवैध OTP / Invalid OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert('त्रुटी / Error', error.response?.data?.message || 'अवैध OTP / Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setEmail('');
    setOtp('');
    setName('');
    setIsOtpSent(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.gradient}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.appName}>आई साहेब</Text>
              <Text style={styles.subtitle}>
                {authMode === 'login' ? 'स्वागत आहे / Welcome Back' : 'नोंदणी करा / Sign Up'}
              </Text>
            </View>

            <View style={styles.authContainer}>
              <View style={styles.authModeSelector}>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === 'login' && styles.activeAuthMode
                  ]}
                  onPress={() => {
                    setAuthMode('login');
                    resetForm();
                  }}
                >
                  <Text style={[
                    styles.authModeText,
                    authMode === 'login' && styles.activeAuthModeText
                  ]}>
                    प्रवेश / Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === 'signup' && styles.activeAuthMode
                  ]}
                  onPress={() => {
                    setAuthMode('signup');
                    resetForm();
                  }}
                >
                  <Text style={[
                    styles.authModeText,
                    authMode === 'signup' && styles.activeAuthModeText
                  ]}>
                    नोंदणी / Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {!isOtpSent && (
                <>
                  <View style={styles.methodSelector}>
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        loginMethod === 'phone' && styles.activeMethod
                      ]}
                      onPress={() => setLoginMethod('phone')}
                    >
                      <Ionicons 
                        name="call" 
                        size={20} 
                        color={loginMethod === 'phone' ? '#FF6B35' : '#666'} 
                      />
                      <Text style={[
                        styles.methodText,
                        loginMethod === 'phone' && styles.activeMethodText
                      ]}>
                        फोन / Phone
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        loginMethod === 'email' && styles.activeMethod
                      ]}
                      onPress={() => setLoginMethod('email')}
                    >
                      <Ionicons 
                        name="mail" 
                        size={20} 
                        color={loginMethod === 'email' ? '#FF6B35' : '#666'} 
                      />
                      <Text style={[
                        styles.methodText,
                        loginMethod === 'email' && styles.activeMethodText
                      ]}>
                        ईमेल / Email
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {authMode === 'signup' && (
                    <View style={styles.inputContainer}>
                      <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="आपले नाव / Your Name"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name={loginMethod === 'phone' ? 'call' : 'mail'} 
                      size={20} 
                      color="#666" 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={
                        loginMethod === 'phone' 
                          ? 'मोबाइल नंबर / Phone Number' 
                          : 'ईमेल पत्ता / Email Address'
                      }
                      placeholderTextColor="#999"
                      value={loginMethod === 'phone' ? phoneNumber : email}
                      onChangeText={loginMethod === 'phone' ? setPhoneNumber : setEmail}
                      keyboardType={loginMethod === 'phone' ? 'phone-pad' : 'email-address'}
                      autoCapitalize="none"
                    />
                  </View>
                </>
              )}

              {isOtpSent && (
                <View style={styles.inputContainer}>
                  <Ionicons name="key" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="OTP टाका / Enter OTP"
                    placeholderTextColor="#999"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading 
                    ? 'कृपया वाट पहा / Please Wait...' 
                    : isOtpSent 
                      ? 'OTP पडताळा / Verify OTP' 
                      : `${authMode === 'login' ? 'प्रवेश करा' : 'नोंदणी करा'} / ${authMode === 'login' ? 'Login' : 'Sign Up'}`
                  }
                </Text>
              </TouchableOpacity>

              {isOtpSent && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={resetForm}
                >
                  <Text style={styles.secondaryButtonText}>
                    परत / Back
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.sosHint}>
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.sosHintText}>
                  आपत्कालीन SOS सुविधा उपलब्ध / Emergency SOS feature available
                </Text>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  authContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  authModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  authModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeAuthMode: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authModeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeAuthModeText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  methodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeMethod: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF6B35',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  activeMethodText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '500',
  },
  sosHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  sosHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    textAlign: 'center',
  },
});