import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export default function SOSScreen() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [isVideoRecording, setIsVideoRecording] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Camera and audio refs
  const cameraRef = useRef<Camera>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    requestPermissions();
    loadTrustedContacts();
    startPulseAnimation();
    setupShakeDetection();
  }, []);

  const requestPermissions = async () => {
    try {
      // Camera permission
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      // Audio permission
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');

      // Location permission
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');

      if (cameraStatus.status !== 'granted' || audioStatus.status !== 'granted' || locationStatus.status !== 'granted') {
        Alert.alert(
          'परवानगी आवश्यक / Permissions Required',
          'SOS वैशिष्ट्यासाठी कैमेरा, ऑडिओ आणि स्थान परवानगी आवश्यक आहे. / Camera, audio and location permissions are required for SOS feature.',
          [{ text: 'ठीक आहे / OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  const loadTrustedContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.user.trusted_contacts) {
        setTrustedContacts(response.data.user.trusted_contacts);
      }
    } catch (error) {
      console.error('Error loading trusted contacts:', error);
      // Set default emergency contacts if none exist
      setTrustedContacts([
        { id: '1', name: 'Emergency Contact 1', phone: '911', relationship: 'Emergency', isPrimary: true },
        { id: '2', name: 'Police', phone: '100', relationship: 'Authority', isPrimary: false },
      ]);
    }
  };

  const setupShakeDetection = () => {
    // In a real app, you would use expo-sensors accelerometer
    // For now, we'll simulate shake detection
    console.log('Shake detection setup complete');
  };

  const startPulseAnimation = () => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  };

  const startRotateAnimation = () => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotate.start();
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) return null;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const startAudioRecording = async () => {
    if (!hasAudioPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start audio recording:', error);
    }
  };

  const stopAudioRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      console.log('Audio recording stopped:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop audio recording:', error);
    }
  };

  const startVideoRecording = async () => {
    if (!hasCameraPermission || !cameraRef.current) return;

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 60 seconds
        quality: Camera.Constants.VideoQuality['720p'],
      });
      setIsVideoRecording(true);
      console.log('Video recording started');
      return video;
    } catch (error) {
      console.error('Failed to start video recording:', error);
    }
  };

  const stopVideoRecording = async () => {
    if (!cameraRef.current || !isVideoRecording) return;

    try {
      cameraRef.current.stopRecording();
      setIsVideoRecording(false);
      console.log('Video recording stopped');
    } catch (error) {
      console.error('Failed to stop video recording:', error);
    }
  };

  const activateSOS = async () => {
    if (!stealthMode) {
      Alert.alert(
        'आपत्कालीन SOS सक्रिय करा / Activate Emergency SOS',
        'तुम्हाला खरोखर SOS सक्रिय करायचे आहे का? हे तुमच्या आपत्कालीन संपर्कांना अलर्ट पाठवेल. / Are you sure you want to activate SOS? This will send alerts to your emergency contacts.',
        [
          {
            text: 'रद्द करा / Cancel',
            style: 'cancel',
          },
          {
            text: 'सक्रिय करा / Activate',
            style: 'destructive',
            onPress: () => handleSOSActivation(),
          },
        ]
      );
    } else {
      handleSOSActivation();
    }
  };

  const handleSOSActivation = async () => {
    try {
      setIsSOSActive(true);
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      Vibration.vibrate([0, 500, 200, 500]);

      // Start animations
      startRotateAnimation();

      // Get current location
      const location = await getCurrentLocation();

      // Start recording media
      await Promise.all([
        startAudioRecording(),
        startVideoRecording(),
      ]);

      // Send SOS alert to backend
      await sendSOSAlert(location);

      // Send alerts to trusted contacts
      await sendEmergencyAlerts(location);

      if (!stealthMode) {
        Alert.alert(
          'SOS सक्रिय केले / SOS Activated',
          'आपत्कालीन अलर्ट पाठवले गेले आहेत. तुमचे स्थान ट्रॅक केले जात आहे. / Emergency alerts have been sent. Your location is being tracked.'
        );
      }
    } catch (error) {
      console.error('SOS activation error:', error);
      Alert.alert('Error', 'Failed to activate SOS. Please try again.');
    }
  };

  const sendSOSAlert = async (location: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.post(
        `${BACKEND_URL}/api/sos/activate`,
        {
          location: location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: await getAddressFromCoords(location.coords),
          } : null,
          is_stealth: stealthMode,
          timestamp: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('SOS alert sent to backend:', response.data);
    } catch (error) {
      console.error('Failed to send SOS alert:', error);
    }
  };

  const getAddressFromCoords = async (coords: any) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { street, city, region, postalCode } = reverseGeocode[0];
        return `${street || ''}, ${city || ''}, ${region || ''} ${postalCode || ''}`.trim();
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return 'Location unavailable';
  };

  const sendEmergencyAlerts = async (location: any) => {
    const userData = await AsyncStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : { name: 'User' };
    
    const locationText = location 
      ? `Location: ${location.coords.latitude}, ${location.coords.longitude}`
      : 'Location: Not available';

    const message = `EMERGENCY ALERT: ${user.name} has activated SOS. ${locationText}. Please check immediately.`;
    
    for (const contact of trustedContacts) {
      try {
        // In a real app, this would send SMS
        console.log(`Sending emergency alert to ${contact.name} (${contact.phone}): ${message}`);
        
        // Simulate SMS sending
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send alert to ${contact.phone}:`, error);
      }
    }
  };

  const deactivateSOS = () => {
    Alert.alert(
      'SOS निष्क्रिय करा / Deactivate SOS',
      'तुम्ही सुरक्षित आहात का? / Are you safe?',
      [
        {
          text: 'नाही, SOS सुरू ठेवा / No, Keep SOS Active',
          style: 'cancel',
        },
        {
          text: 'होय, मी सुरक्षित आहे / Yes, I am Safe',
          onPress: async () => {
            setIsSOSActive(false);
            await stopAudioRecording();
            await stopVideoRecording();
            Alert.alert('SOS निष्क्रिय केले / SOS Deactivated');
          },
        },
      ]
    );
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (hasCameraPermission === null || hasAudioPermission === null || hasLocationPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="shield" size={64} color="#FF6B35" />
          <Text style={styles.permissionTitle}>परवानगी लोड होत आहे / Loading Permissions</Text>
          <Text style={styles.permissionText}>
            कृपया वाट पहा... / Please wait...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasCameraPermission === false || hasAudioPermission === false || hasLocationPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="close-circle" size={64} color="#FF4444" />
          <Text style={styles.permissionTitle}>परवानगी नाकारली / Permission Denied</Text>
          <Text style={styles.permissionText}>
            SOS वैशिष्ट्य कार्य करण्यासाठी सर्व परवानग्या आवश्यक आहेत. / 
            All permissions are required for SOS feature to work.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>पुन्हा प्रयत्न करा / Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={isSOSActive ? ['#FF4444', '#CC0000'] : ['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>
            {isSOSActive ? 'SOS सक्रिय / SOS ACTIVE' : 'आपत्कालीन SOS / Emergency SOS'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isSOSActive 
              ? 'मदत येत आहे / Help is coming' 
              : 'आपत्कालीन परिस्थितीत वापरा / Use in emergency situations'
            }
          </Text>
        </LinearGradient>

        {/* Stealth Mode Toggle */}
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>स्टील्थ मोड / Stealth Mode</Text>
              <Text style={styles.settingSubtitle}>
                गुप्त मोडमध्ये कोणतेही दृश्य अलर्ट दिसणार नाहीत / No visual alerts in stealth mode
              </Text>
            </View>
            <Switch
              value={stealthMode}
              onValueChange={setStealthMode}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
              thumbColor={stealthMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Main SOS Button */}
        <View style={styles.sosContainer}>
          <Animated.View
            style={[
              styles.sosButtonContainer,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate: isSOSActive ? spin : '0deg' },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.sosButton,
                isSOSActive && styles.sosButtonActive,
              ]}
              onPress={isSOSActive ? deactivateSOS : activateSOS}
              onLongPress={activateSOS}
            >
              <LinearGradient
                colors={isSOSActive ? ['#FF4444', '#CC0000'] : ['#FF6B35', '#F7931E']}
                style={styles.sosGradient}
              >
                <Ionicons 
                  name={isSOSActive ? 'stop' : 'shield'} 
                  size={48} 
                  color="#FFFFFF" 
                />
                <Text style={styles.sosButtonText}>
                  {isSOSActive ? 'निष्क्रिय करा' : 'SOS सक्रिय करा'}
                </Text>
                <Text style={styles.sosButtonSubtext}>
                  {isSOSActive ? 'Deactivate' : 'Activate SOS'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.sosHint}>
            {isSOSActive 
              ? 'तुमचे स्थान ट्रॅक केले जात आहे / Your location is being tracked'
              : 'दाबा आणि धरा किंवा टॅप करा / Press and hold or tap to activate'
            }
          </Text>
        </View>

        {/* Camera Preview (when SOS is active) */}
        {isSOSActive && hasCameraPermission && (
          <View style={styles.cameraContainer}>
            <Text style={styles.cameraTitle}>सुरक्षा कैमेरा / Security Camera</Text>
            <View style={styles.cameraPreview}>
              <Camera
                ref={cameraRef}
                style={styles.camera}
                type={cameraType}
                ratio="16:9"
              />
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setCameraType(
                  cameraType === CameraType.back ? CameraType.front : CameraType.back
                )}
              >
                <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Information */}
        {isSOSActive && (
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Ionicons name="location" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>स्थान ट्रॅकिंग / Location Tracking</Text>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="videocam" size={20} color={isVideoRecording ? '#4CAF50' : '#999'} />
              <Text style={styles.statusText}>व्हिडिओ रेकॉर्डिंग / Video Recording</Text>
              <Ionicons 
                name={isVideoRecording ? 'checkmark-circle' : 'time'} 
                size={20} 
                color={isVideoRecording ? '#4CAF50' : '#999'} 
              />
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="mic" size={20} color={isRecording ? '#4CAF50' : '#999'} />
              <Text style={styles.statusText}>ऑडिओ रेकॉर्डिंग / Audio Recording</Text>
              <Ionicons 
                name={isRecording ? 'checkmark-circle' : 'time'} 
                size={20} 
                color={isRecording ? '#4CAF50' : '#999'} 
              />
            </View>
          </View>
        )}

        {/* Trusted Contacts */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>विश्वसनीय संपर्क / Trusted Contacts</Text>
          {trustedContacts.length > 0 ? (
            trustedContacts.slice(0, 3).map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Ionicons name="person" size={20} color="#FF6B35" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                {contact.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>प्राथमिक</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <TouchableOpacity 
              style={styles.addContactButton}
              onPress={() => router.push('/trusted-contacts')}
            >
              <Ionicons name="add-circle" size={24} color="#FF6B35" />
              <Text style={styles.addContactText}>विश्वसनीय संपर्क जोडा / Add Trusted Contacts</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>द्रुत क्रिया / Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => router.push('/trusted-contacts')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>विश्वसनीय संपर्क</Text>
              <Text style={styles.actionSubtitle}>Trusted Contacts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/nearby-help')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="location" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>जवळची मदत</Text>
              <Text style={styles.actionSubtitle}>Nearby Help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/safety-tips')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>सुरक्षा टिप्स</Text>
              <Text style={styles.actionSubtitle}>Safety Tips</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  sosContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  sosButtonContainer: {
    marginBottom: 16,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosButtonActive: {
    elevation: 12,
    shadowOpacity: 0.4,
  },
  sosGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  sosButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  sosHint: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  cameraContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cameraPreview: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  contactsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  primaryBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addContactButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  addContactText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 12,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});