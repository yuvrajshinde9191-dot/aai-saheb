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

export default function SOSScreen() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState([]);

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
  }, []);

  const requestPermissions = async () => {
    // Camera permission
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(cameraStatus.status === 'granted');

    // Audio permission
    const audioStatus = await Audio.requestPermissionsAsync();
    setHasAudioPermission(audioStatus.status === 'granted');

    // Location permission
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermission(locationStatus.status === 'granted');
  };

  const loadTrustedContacts = async () => {
    try {
      const contacts = await AsyncStorage.getItem('trustedContacts');
      if (contacts) {
        setTrustedContacts(JSON.parse(contacts));
      }
    } catch (error) {
      console.error('Error loading trusted contacts:', error);
    }
  };

  const startPulseAnimation = () => {
    const pulse = Animated.loop(
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

  const startRecording = async () => {
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
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const captureVideo = async () => {
    if (!hasCameraPermission || !cameraRef.current) return;

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 30,
        quality: Camera.Constants.VideoQuality['720p'],
      });
      return video;
    } catch (error) {
      console.error('Failed to capture video:', error);
    }
  };

  const activateSOS = async () => {
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
  };

  const handleSOSActivation = async () => {
    setIsSOSActive(true);
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.vibrate([0, 500, 200, 500]);

    // Start animations
    startRotateAnimation();

    // Get location
    const location = await getCurrentLocation();

    // Start recording
    await startRecording();

    // Start video capture (would be implemented with camera)
    // const video = await captureVideo();

    // Send alerts (would integrate with backend)
    sendEmergencyAlerts(location);

    // Show success message
    if (!stealthMode) {
      Alert.alert(
        'SOS सक्रिय केले / SOS Activated',
        'आपत्कालीन अलर्ट पाठवले गेले आहेत. / Emergency alerts have been sent.'
      );
    }
  };

  const sendEmergencyAlerts = async (location: any) => {
    try {
      // This would integrate with your backend API
      console.log('Sending emergency alerts with location:', location);
      
      // Send to trusted contacts
      // Send to authorities
      // Upload encrypted media files
      
    } catch (error) {
      console.error('Failed to send emergency alerts:', error);
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
          onPress: () => {
            setIsSOSActive(false);
            stopRecording();
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

  const quickActions = [
    {
      title: 'विश्वसनीय संपर्क',
      subtitle: 'Trusted Contacts',
      icon: 'people',
      color: '#4CAF50',
      onPress: () => router.push('/trusted-contacts'),
    },
    {
      title: 'जवळची मदत',
      subtitle: 'Nearby Help',
      icon: 'location',
      color: '#2196F3',
      onPress: () => router.push('/nearby-help'),
    },
    {
      title: 'सुरक्षा टिप्स',
      subtitle: 'Safety Tips',
      icon: 'shield-checkmark',
      color: '#FF9800',
      onPress: () => router.push('/safety-tips'),
    },
  ];

  if (hasCameraPermission === null || hasAudioPermission === null || hasLocationPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="shield" size={64} color="#FF6B35" />
          <Text style={styles.permissionTitle}>परवानगी आवश्यक / Permissions Required</Text>
          <Text style={styles.permissionText}>
            SOS वैशिष्ट्यासाठी कैमेरा, ऑडिओ आणि स्थान परवानगी आवश्यक आहे. / 
            Camera, audio and location permissions are required for SOS feature.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>परवानगी द्या / Grant Permissions</Text>
          </TouchableOpacity>
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

        {/* Status Information */}
        {isSOSActive && (
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Ionicons name="location" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>स्थान ट्रॅकिंग / Location Tracking</Text>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="videocam" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>व्हिडिओ रेकॉर्डिंग / Video Recording</Text>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
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

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>द्रुत क्रिया / Quick Actions</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem} onPress={action.onPress}>
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Hidden Camera Views for SOS (would be visible during recording) */}
        {isSOSActive && !stealthMode && (
          <View style={styles.cameraContainer}>
            <Text style={styles.cameraTitle}>सुरक्षा कैमेरा / Security Camera</Text>
            <View style={styles.cameraPreview}>
              <Camera
                ref={cameraRef}
                style={styles.camera}
                type={CameraType.back}
                ratio="16:9"
              />
            </View>
          </View>
        )}
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
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  },
  camera: {
    flex: 1,
  },
});