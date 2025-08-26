import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, updateProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTrustedContacts, setShowTrustedContacts] = useState(false);
  const [editName, setEditName] = useState(user?.phone || user?.email || '');
  const [editLocation, setEditLocation] = useState(user?.location?.district || '');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  ];

  const userStats = {
    postsCreated: 12,
    helpProvided: 8,
    coursesCompleted: 3,
    communityPoints: 245,
  };

  const achievements = [
    {
      id: 'first_post',
      title: language === 'mr' ? 'पहिली पोस्ट' : (language === 'hi' ? 'पहली पोस्ट' : 'First Post'),
      description: language === 'mr' ? 'पहिली पोस्ट तयार केली' : (language === 'hi' ? 'पहली पोस्ट बनाई' : 'Created your first post'),
      icon: 'trophy',
      earned: true,
    },
    {
      id: 'course_complete',
      title: language === 'mr' ? 'कोर्स पूर्ण' : (language === 'hi' ? 'कोर्स पूरा' : 'Course Complete'),
      description: language === 'mr' ? 'पहिला कोर्स पूर्ण केला' : (language === 'hi' ? 'पहला कोर्स पूरा किया' : 'Completed your first course'),
      icon: 'school',
      earned: true,
    },
    {
      id: 'helper',
      title: language === 'mr' ? 'सहायक' : (language === 'hi' ? 'सहायक' : 'Helper'),
      description: language === 'mr' ? '10 लोकांना मदत केली' : (language === 'hi' ? '10 लोगों की मदद की' : 'Helped 10 people'),
      icon: 'heart',
      earned: false,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'mr' ? 'लॉगआउट' : (language === 'hi' ? 'लॉगआउट' : 'Logout'),
      language === 'mr' ? 'तुम्ही खरोखर लॉगआउट करू इच्छिता?' : (language === 'hi' ? 'क्या आप वास्तव में लॉगआउट करना चाहते हैं?' : 'Are you sure you want to logout?'),
      [
        { text: language === 'mr' ? 'रद्द करा' : (language === 'hi' ? 'रद्द करें' : 'Cancel'), style: 'cancel' },
        { 
          text: language === 'mr' ? 'लॉगआउट' : (language === 'hi' ? 'लॉगआउट' : 'Logout'), 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const saveProfile = async () => {
    try {
      await updateProfile({
        location: {
          ...user?.location,
          district: editLocation,
        }
      });
      setShowEditProfile(false);
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'प्रोफाइल अपडेट झाले' : (language === 'hi' ? 'प्रोफाइल अपडेट हो गया' : 'Profile updated successfully')
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const menuItems = [
    {
      id: 'edit_profile',
      title: language === 'mr' ? 'प्रोफाइल संपादित करा' : (language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'),
      icon: 'person-outline',
      onPress: () => setShowEditProfile(true),
    },
    {
      id: 'trusted_contacts',
      title: language === 'mr' ? 'विश्वसनीय संपर्क' : (language === 'hi' ? 'विश्वसनीय संपर्क' : 'Trusted Contacts'),
      icon: 'people-outline',
      onPress: () => setShowTrustedContacts(true),
    },
    {
      id: 'language',
      title: language === 'mr' ? 'भाषा' : (language === 'hi' ? 'भाषा' : 'Language'),
      icon: 'language-outline',
      onPress: () => setShowLanguageModal(true),
    },
    {
      id: 'privacy',
      title: language === 'mr' ? 'गोपनीयता आणि सुरक्षा' : (language === 'hi' ? 'गोपनीयता और सुरक्षा' : 'Privacy & Security'),
      icon: 'shield-outline',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
    },
    {
      id: 'help',
      title: language === 'mr' ? 'मदत आणि सहाय्य' : (language === 'hi' ? 'सहायता और समर्थन' : 'Help & Support'),
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Contact support at help@aaisaheb.com'),
    },
    {
      id: 'about',
      title: language === 'mr' ? 'ऐपबद्दल' : (language === 'hi' ? 'ऐप के बारे में' : 'About App'),
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('aai Saheb v1.0', 'Empowering women across Maharashtra'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.phone?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.phone || user?.email || 'User'}
            </Text>
            <Text style={styles.profileRole}>
              {user?.role || 'Member'}
            </Text>
            <Text style={styles.profileLocation}>
              📍 {user?.location?.district || 'Maharashtra'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* User Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'तुमची आकडेवारी' : (language === 'hi' ? 'आपकी गतिविधि' : 'Your Activity')}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.postsCreated}</Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'पोस्ट' : (language === 'hi' ? 'पोस्ट' : 'Posts')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.helpProvided}</Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'मदत' : (language === 'hi' ? 'सहायता' : 'Helped')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.coursesCompleted}</Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'कोर्स' : (language === 'hi' ? 'कोर्स' : 'Courses')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.communityPoints}</Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'गुण' : (language === 'hi' ? 'अंक' : 'Points')}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.quickSettingsContainer}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'द्रुत सेटिंग्ज' : (language === 'hi' ? 'त्वरित सेटिंग्स' : 'Quick Settings')}
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#FF6B35" />
              <Text style={styles.settingTitle}>
                {language === 'mr' ? 'सूचना' : (language === 'hi' ? 'अधिसूचना' : 'Notifications')}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#CCC', true: '#FF6B35' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={24} color="#FF6B35" />
              <Text style={styles.settingTitle}>
                {language === 'mr' ? 'स्थान सामायिकरण' : (language === 'hi' ? 'स्थान साझाकरण' : 'Location Sharing')}
              </Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#CCC', true: '#FF6B35' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color="#FF6B35" />
              <Text style={styles.settingTitle}>
                {language === 'mr' ? 'गडद मोड' : (language === 'hi' ? 'डार्क मोड' : 'Dark Mode')}
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#CCC', true: '#FF6B35' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'उपलब्धी' : (language === 'hi' ? 'उपलब्धियां' : 'Achievements')}
          </Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementCardLocked
              ]}>
                <Ionicons 
                  name={achievement.icon as any} 
                  size={32} 
                  color={achievement.earned ? '#FFD700' : '#CCC'} 
                />
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemContent}>
                <Ionicons name={item.icon as any} size={24} color="#FF6B35" />
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
          <Text style={styles.logoutButtonText}>
            {language === 'mr' ? 'लॉगआउट' : (language === 'hi' ? 'लॉगआउट' : 'Logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? 'प्रोफाइल संपादित करा' : (language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile')}
              </Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                {language === 'mr' ? 'स्थान' : (language === 'hi' ? 'स्थान' : 'Location')}
              </Text>
              <TextInput
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder={language === 'mr' ? 'तुमचे जिल्हा' : (language === 'hi' ? 'आपका जिला' : 'Your district')}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {language === 'mr' ? 'रद्द करा' : (language === 'hi' ? 'रद्द करें' : 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>
                  {language === 'mr' ? 'जतन करा' : (language === 'hi' ? 'सेव करें' : 'Save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? 'भाषा निवडा' : (language === 'hi' ? 'भाषा चुनें' : 'Select Language')}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.selectedLanguageOption,
                  ]}
                  onPress={async () => {
                    await setLanguage(lang.code as any);
                    setShowLanguageModal(false);
                  }}
                >
                  <View>
                    <Text style={[
                      styles.languageNativeName,
                      language === lang.code && styles.selectedLanguageText,
                    ]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={[
                      styles.languageEnglishName,
                      language === lang.code && styles.selectedLanguageText,
                    ]}>
                      {lang.name}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Trusted Contacts Modal */}
      <Modal visible={showTrustedContacts} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? 'विश्वसनीय संपर्क' : (language === 'hi' ? 'विश्वसनीय संपर्क' : 'Trusted Contacts')}
              </Text>
              <TouchableOpacity onPress={() => setShowTrustedContacts(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.contactsInfo}>
                {language === 'mr' ? 
                  'आपत्कालीन परिस्थितीत आपल्या विश्वसनीय संपर्कांना सूचना पाठवली जाईl' :
                  (language === 'hi' ? 
                    'आपातकाल की स्थिति में आपके विश्वसनीय संपर्कों को सूचना भेजी जाएगी।' :
                    'Your trusted contacts will be notified during emergencies.')}
              </Text>
              
              {user?.trustedContacts && user.trustedContacts.length > 0 ? (
                user.trustedContacts.map((contact, index) => (
                  <View key={index} style={styles.contactItem}>
                    <View>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                      <Text style={styles.contactRelation}>{contact.relationship}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noContacts}>
                  {language === 'mr' ? 
                    'कोणते विश्वसनीय संपर्क जोडले नाहीत' :
                    (language === 'hi' ? 
                      'कोई विश्वसनीय संपर्क नहीं जोड़े गए' :
                      'No trusted contacts added')}
                </Text>
              )}
              
              <TouchableOpacity style={styles.addContactButton}>
                <Ionicons name="add" size={20} color="#FF6B35" />
                <Text style={styles.addContactText}>
                  {language === 'mr' ? 'संपर्क जोडा' : (language === 'hi' ? 'संपर्क जोड़ें' : 'Add Contact')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: -15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickSettingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  achievementsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  achievementCardLocked: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E0E0E0',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: '#999',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescriptionLocked: {
    color: '#BBB',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedLanguageOption: {
    backgroundColor: '#FF6B35',
  },
  languageNativeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
  contactsInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#888',
  },
  noContacts: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0ED',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  addContactText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 8,
  },
});