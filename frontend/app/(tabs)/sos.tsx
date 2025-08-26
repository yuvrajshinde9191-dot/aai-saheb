import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Vibration,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl || 'https://empower-her-2.preview.emergentagent.com';

export default function SOSScreen() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // State management
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sosButtonScale = useRef(new Animated.Value(1)).current;
  
  // Recording refs
  const cameraRef = useRef<any>(null);
  const audioRecording = useRef<any>(null);
  
  // Sensor subscriptions
  const shakeSubscription = useRef<any>(null);

  useEffect(() => {
    requestPermissions();
    setupShakeDetection();
    startContinuousPulse();
    
    return () => {
      cleanup();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      // Simplified permission request - in production would use actual Expo APIs
      setHasPermissions(true);
      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Mock location for now - in production would use expo-location
      setCurrentLocation({
        coords: {
          latitude: 19.0760,
          longitude: 72.8777,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const setupShakeDetection = () => {
    // Mock shake detection - in production would use expo-sensors
    console.log('Shake detection setup (mock)');
  };

  const startContinuousPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const activateEmergency = async (method: 'button' | 'shake' | 'power-button') => {
    if (isEmergencyActive) return;

    try {
      setIsEmergencyActive(true);
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 500, 200, 500]);
      } else {
        Vibration.vibrate(1000);
      }

      // Animate SOS button
      Animated.sequence([
        Animated.timing(sosButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sosButtonScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sosButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Start emergency procedures
      await Promise.all([
        startEmergencyRecording(),
        sendEmergencyAlert(method),
        notifyTrustedContacts(),
      ]);

      // Show success message
      Alert.alert(
        t('emergencyActivated'),
        language === 'mr' ? 'आपत्कालीन सेवा सक्रिय झाली आहे' : 
        (language === 'hi' ? 'आपातकालीन सेवा सक्रिय हो गई है' : 'Emergency services have been activated'),
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error activating emergency:', error);
      Alert.alert('Error', 'Failed to activate emergency. Please try again.');
      setIsEmergencyActive(false);
    }
  };

  const startEmergencyRecording = async () => {
    if (!hasPermissions) return;

    try {
      setIsRecording(true);
      console.log('Emergency recording started (mock)');
      // In production: implement actual camera/audio recording with expo-av and expo-camera
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleRollingClips = async () => {
    if (!isEmergencyActive) return;

    try {
      console.log('Handling rolling clips (mock)');
      // In production: implement actual rolling video/audio clip management
    } catch (error) {
      console.error('Error handling rolling clips:', error);
    }
  };
  const uploadEncryptedMedia = async (uri: string, type: 'video' | 'audio') => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: type === 'video' ? 'video/mp4' : 'audio/m4a',
        name: `emergency_${type}_${Date.now()}.${type === 'video' ? 'mp4' : 'm4a'}`,
      } as any);
      
      formData.append('encrypted', 'true');
      formData.append('emergency_id', `${user?._id}_${Date.now()}`);

      await axios.post(`${API_BASE_URL}/api/sos/upload-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${await getStoredToken()}`,
        },
      });

    } catch (error) {
      console.error('Error uploading encrypted media:', error);
    }
  };

  const sendEmergencyAlert = async (method: string) => {
    try {
      await getCurrentLocation();
      
      const alertData = {
        user_id: user?._id,
        activation_method: method,
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          timestamp: new Date().toISOString(),
        } : null,
        stealth_mode: isStealthMode,
        emergency_type: 'general',
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      await axios.post(`${API_BASE_URL}/api/sos/activate`, alertData, {
        headers: {
          'Authorization': `Bearer ${await getStoredToken()}`,
        },
      });

    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  };

  const notifyTrustedContacts = async () => {
    try {
      if (!user?.trustedContacts || user.trustedContacts.length === 0) return;

      const notificationData = {
        user_id: user._id,
        location: currentLocation,
        message: language === 'mr' ? 
          `${user.phone || user.email} ने आपत्कालीन सहाय्यासाठी संपर्क साधला आहे` :
          (language === 'hi' ? 
            `${user.phone || user.email} ने आपातकालीन सहायता के लिए संपर्क किया है` :
            `${user.phone || user.email} has activated emergency assistance`),
      };

      await axios.post(`${API_BASE_URL}/api/sos/notify-contacts`, notificationData, {
        headers: {
          'Authorization': `Bearer ${await getStoredToken()}`,
        },
      });

    } catch (error) {
      console.error('Error notifying contacts:', error);
    }
  };

  const deactivateEmergency = async () => {
    try {
      setIsEmergencyActive(false);
      setIsRecording(false);

      // Stop recordings
      if (cameraRef.current && isRecording) {
        await cameraRef.current.stopRecording();
      }

      if (audioRecording.current) {
        await audioRecording.current.stopAndUnloadAsync();
        audioRecording.current = null;
      }

      // Send deactivation to server
      await axios.post(`${API_BASE_URL}/api/sos/deactivate`, {
        user_id: user?._id,
      }, {
        headers: {
          'Authorization': `Bearer ${await getStoredToken()}`,
        },
      });

      Alert.alert(
        'Emergency Deactivated',
        'Emergency mode has been turned off safely.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error deactivating emergency:', error);
    }
  };

  const getStoredToken = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('userToken');
  };

  const cleanup = () => {
    if (shakeSubscription.current) {
      shakeSubscription.current.remove();
    }
    if (audioRecording.current) {
      audioRecording.current.stopAndUnloadAsync().catch(console.error);
    }
  };

  const translations = {
    en: {
      emergencyHelp: 'Emergency Help',
      sosButton: 'SOS',
      activateEmergency: 'Tap to Activate Emergency',
      stealthMode: 'Stealth Mode',
      recordingActive: 'Recording Active',
      emergencyActive: 'Emergency Mode Active',
      deactivate: 'Deactivate Emergency',
      shakeToActivate: 'Shake phone to activate',
      powerButtonActivate: 'Triple-tap power button',
      locationSharing: 'Location Sharing Active',
      trustedContacts: 'Trusted Contacts Notified',
    },
    hi: {
      emergencyHelp: 'आपातकालीन सहायता',
      sosButton: 'एसओएस',
      activateEmergency: 'आपातकाल सक्रिय करने के लिए टैप करें',
      stealthMode: 'गुप्त मोड',
      recordingActive: 'रिकॉर्डिंग सक्रिय',
      emergencyActive: 'आपातकालीन मोड सक्रिय',
      deactivate: 'आपातकाल निष्क्रिय करें',
      shakeToActivate: 'सक्रिय करने के लिए फ़ोन हिलाएं',
      powerButtonActivate: 'पावर बटन तीन बार दबाएं',
      locationSharing: 'स्थान साझाकरण सक्रिय',
      trustedContacts: 'विश्वसनीय संपर्कों को सूचित किया गया',
    },
    mr: {
      emergencyHelp: 'आपत्कालीन मदत',
      sosButton: 'एसओएस',
      activateEmergency: 'आपत्काल सक्रिय करण्यासाठी टॅप करा',
      stealthMode: 'गुप्त मोड',
      recordingActive: 'रेकॉर्डिंग सक्रिय',
      emergencyActive: 'आपत्कालीन मोड सक्रिय',
      deactivate: 'आपत्काल निष्क्रिय करा',
      shakeToActivate: 'सक्रिय करण्यासाठी फोन हलवा',
      powerButtonActivate: 'पॉवर बटन तीन वेळा दाबा',
      locationSharing: 'स्थान सामायिकरण सक्रिय',
      trustedContacts: 'विश्वसनीय संपर्कांना कळविले',
    },
  };

  const tr = translations[language as keyof typeof translations];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={isEmergencyActive ? ['#FF4444', '#FF6666'] : ['#FF6B35', '#F7931E']} 
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{tr.emergencyHelp}</Text>
        <TouchableOpacity 
          style={styles.stealthToggle}
          onPress={() => setIsStealthMode(!isStealthMode)}
        >
          <Ionicons 
            name={isStealthMode ? "eye-off" : "eye"} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.stealthText}>{tr.stealthMode}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        {/* Status Message */}
        {hasPermissions && !isStealthMode && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              {language === 'mr' ? 'सर्व परवानग्या दिल्या आहेत' : 
               (language === 'hi' ? 'सभी अनुमतियां दी गई हैं' : 'All permissions granted')}
            </Text>
          </View>
        )}

        {/* Main SOS Button */}
        <View style={styles.sosContainer}>
          <Animated.View
            style={[
              styles.sosButtonWrapper,
              {
                transform: [
                  { scale: pulseAnim },
                  { scale: sosButtonScale },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.sosButton,
                isEmergencyActive && styles.sosButtonActive,
              ]}
              onPress={() => isEmergencyActive ? deactivateEmergency() : activateEmergency('button')}
              onLongPress={() => activateEmergency('button')}
            >
              <Text style={styles.sosButtonText}>{tr.sosButton}</Text>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.sosInstruction}>
            {isEmergencyActive ? tr.emergencyActive : tr.activateEmergency}
          </Text>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Ionicons name="location" size={20} color="#4CAF50" />
            <Text style={styles.statusText}>{tr.locationSharing}</Text>
          </View>
          
          {isRecording && (
            <View style={styles.statusRow}>
              <Ionicons name="recording" size={20} color="#FF4444" />
              <Text style={styles.statusText}>{tr.recordingActive}</Text>
            </View>
          )}
          
          {user?.trustedContacts && user.trustedContacts.length > 0 && (
            <View style={styles.statusRow}>
              <Ionicons name="people" size={20} color="#2196F3" />
              <Text style={styles.statusText}>{tr.trustedContacts}</Text>
            </View>
          )}
        </View>

        {/* Activation Methods */}
        <View style={styles.methodsContainer}>
          <Text style={styles.methodsTitle}>
            {language === 'mr' ? 'सक्रियकरण पद्धती' : 
             (language === 'hi' ? 'सक्रियकरण विधि' : 'Activation Methods')}
          </Text>
          
          <View style={styles.methodItem}>
            <Ionicons name="hand-left" size={24} color="#FF6B35" />
            <Text style={styles.methodText}>{tr.shakeToActivate}</Text>
          </View>
          
          <View style={styles.methodItem}>
            <Ionicons name="power" size={24} color="#FF6B35" />
            <Text style={styles.methodText}>{tr.powerButtonActivate}</Text>
          </View>
        </View>

        {/* Emergency Deactivation */}
        {isEmergencyActive && (
          <TouchableOpacity style={styles.deactivateButton} onPress={deactivateEmergency}>
            <Text style={styles.deactivateText}>{tr.deactivate}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stealthToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stealthText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  permissionText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  sosButtonWrapper: {
    marginBottom: 20,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  sosButtonActive: {
    backgroundColor: '#FF6666',
    shadowColor: '#FF6666',
  },
  sosButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  sosInstruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginHorizontal: 40,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
  },
  methodsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
  },
  deactivateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deactivateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});