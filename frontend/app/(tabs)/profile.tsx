import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

const languages = [
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const roles = [
  { id: 'voter', name: 'मतदार / Voter', icon: 'person-circle' },
  { id: 'jobSeeker', name: 'नोकरी शोधणारे / Job Seeker', icon: 'briefcase' },
  { id: 'student', name: 'विद्यार्थी / Student', icon: 'school' },
  { id: 'volunteer', name: 'स्वयंसेवक / Volunteer', icon: 'hand-left' },
  { id: 'candidate', name: 'उमेदवार / Candidate', icon: 'podium' },
  { id: 'ngoPartner', name: 'NGO भागीदार / NGO Partner', icon: 'heart' },
  { id: 'admin', name: 'प्रशासक / Admin', icon: 'settings' },
];

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sosEnabled, setSosEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        setUserData(JSON.parse(stored));
      }

      // Fetch updated profile from server
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await axios.get(`${BACKEND_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUserData(response.data.user);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'लॉग आउट / Logout',
      'तुम्हाला खरोखर लॉग आउट व्हायचे आहे का? / Are you sure you want to logout?',
      [
        { text: 'रद्द करा / Cancel', style: 'cancel' },
        { 
          text: 'लॉग आउट / Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            router.replace('/auth');
          }
        },
      ]
    );
  };

  const getCurrentRole = () => {
    return roles.find(role => role.id === userData?.role) || roles[0];
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === userData?.language) || languages[0];
  };

  const profileSections = [
    {
      title: 'खाते माहिती / Account Info',
      items: [
        {
          icon: 'person',
          title: 'प्रोफाइल संपादित करा',
          subtitle: 'Edit Profile',
          onPress: () => router.push('/edit-profile'),
        },
        {
          icon: 'language',
          title: 'भाषा / Language',
          subtitle: getCurrentLanguage().name,
          onPress: () => router.push('/language-settings'),
        },
        {
          icon: 'briefcase',
          title: 'भूमिका / Role',
          subtitle: getCurrentRole().name,
          onPress: () => router.push('/role-settings'),
        },
      ],
    },
    {
      title: 'सुरक्षा आणि गोपनीयता / Security & Privacy',
      items: [
        {
          icon: 'shield',
          title: 'SOS सेटिंग्ज',
          subtitle: 'SOS Settings',
          onPress: () => router.push('/sos-settings'),
        },
        {
          icon: 'people',
          title: 'विश्वसनीय संपर्क',
          subtitle: 'Trusted Contacts',
          onPress: () => router.push('/trusted-contacts'),
        },
        {
          icon: 'lock-closed',
          title: 'गोपनीयता सेटिंग्ज',
          subtitle: 'Privacy Settings',
          onPress: () => router.push('/privacy-settings'),
        },
      ],
    },
    {
      title: 'मदत आणि सहाय्य / Help & Support',
      items: [
        {
          icon: 'help-circle',
          title: 'मदत केंद्र',
          subtitle: 'Help Center',
          onPress: () => router.push('/help-center'),
        },
        {
          icon: 'chatbubble',
          title: 'संपर्क साधा',
          subtitle: 'Contact Us',
          onPress: () => router.push('/contact-us'),
        },
        {
          icon: 'information-circle',
          title: 'अॅपबद्दल',
          subtitle: 'About App',
          onPress: () => router.push('/about'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <Text style={styles.userRole}>{getCurrentRole().name}</Text>
              <Text style={styles.userContact}>
                {userData?.phone || userData?.email || 'No contact info'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
              <Ionicons name="create" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>पोस्ट्स / Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>कनेक्शन्स / Connections</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>कोर्सेस / Courses</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Settings */}
        <View style={styles.quickSettings}>
          <Text style={styles.sectionTitle}>द्रुत सेटिंग्ज / Quick Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#FF6B35" />
              <Text style={styles.settingText}>सूचना / Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield" size={20} color="#FF6B35" />
              <Text style={styles.settingText}>SOS सक्रिय / SOS Active</Text>
            </View>
            <Switch
              value={sosEnabled}
              onValueChange={setSosEnabled}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={20} color="#FF6B35" />
              <Text style={styles.settingText}>स्थान शेअरिंग / Location Sharing</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
            />
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity key={itemIndex} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon as any} size={20} color="#FF6B35" />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>उपलब्धी / Achievements</Text>
          
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name="ribbon" size={24} color="#FFD700" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>समुदाय योगदानकर्ता</Text>
              <Text style={styles.achievementSubtitle}>Community Contributor</Text>
              <Text style={styles.achievementDesc}>10+ पोस्ट्स आणि मदत केली</Text>
            </View>
          </View>

          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name="school" size={24} color="#4CAF50" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>कौशल्य शिकणारे</Text>
              <Text style={styles.achievementSubtitle}>Skill Learner</Text>
              <Text style={styles.achievementDesc}>3 कोर्सेस पूर्ण केले</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>अॅप माहिती / App Info</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>आवृत्ती / Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>अंतिम अपडेट / Last Updated</Text>
            <Text style={styles.infoValue}>January 2025</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>लॉग आउट / Logout</Text>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userContact: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  quickSettings: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#999',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 32,
  },
});