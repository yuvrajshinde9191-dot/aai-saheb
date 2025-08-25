import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const quickActions = [
  {
    id: 'sos',
    title: 'आपत्कालीन SOS',
    subtitle: 'Emergency SOS',
    icon: 'shield',
    color: '#FF4444',
    route: '/sos',
  },
  {
    id: 'jobs',
    title: 'नोकरी शोधा',
    subtitle: 'Find Jobs',
    icon: 'briefcase',
    color: '#FF6B35',
    route: '/employment',
  },
  {
    id: 'schemes',
    title: 'सरकारी योजना',
    subtitle: 'Govt Schemes',
    icon: 'document',
    color: '#F7931E',
    route: '/welfare-schemes',
  },
  {
    id: 'education',
    title: 'शिक्षण',
    subtitle: 'Education',
    icon: 'school',
    color: '#FFD23F',
    route: '/education',
  },
  {
    id: 'health',
    title: 'आरोग्य',
    subtitle: 'Health',
    icon: 'medical',
    color: '#4CAF50',
    route: '/health',
  },
  {
    id: 'politics',
    title: 'राजकारण',
    subtitle: 'Politics',
    icon: 'podium',
    color: '#2196F3',
    route: '/political-engagement',
  },
];

const newsUpdates = [
  {
    id: 1,
    title: 'महिला सुरक्षा योजनेत नवीन सुविधा',
    subtitle: 'New features in Women Safety Scheme',
    time: '2 तास पूर्वी / 2 hours ago',
  },
  {
    id: 2,
    title: 'रोजगार मेळावा - मुंबई',
    subtitle: 'Job Fair - Mumbai',
    time: '4 तास पूर्वी / 4 hours ago',
  },
  {
    id: 3,
    title: 'नवीन शिक्षण योजना',
    subtitle: 'New Education Scheme',
    time: '1 दिवस पूर्वी / 1 day ago',
  },
];

export default function HomeScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  useEffect(() => {
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location access denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { city, region } = reverseGeocode[0];
        setCurrentLocation(`${city}, ${region}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentLocation('Mumbai, Maharashtra');
    }
  };

  const handleQuickAction = (action: any) => {
    if (action.id === 'sos') {
      Alert.alert(
        'आपत्कालीन SOS / Emergency SOS',
        'तुम्हाला SOS सक्रिय करायचे आहे का? / Do you want to activate SOS?',
        [
          { text: 'रद्द करा / Cancel', style: 'cancel' },
          { 
            text: 'होय / Yes', 
            style: 'destructive',
            onPress: () => router.push('/sos')
          },
        ]
      );
    } else {
      router.push(action.route as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                नमस्कार / Hello
              </Text>
              <Text style={styles.userName}>
                {userData?.name || 'आई साहेब वापरकर्ता'}
              </Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#FFFFFF" />
                <Text style={styles.location}>{currentLocation}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color="#FFFFFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => handleQuickAction(quickActions[0])}
          >
            <LinearGradient
              colors={['#FF4444', '#CC0000']}
              style={styles.sosGradient}
            >
              <Ionicons name="shield" size={32} color="#FFFFFF" />
              <Text style={styles.sosText}>आपत्कालीन SOS</Text>
              <Text style={styles.sosSubtext}>Emergency Alert</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>द्रुत क्रिया / Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.slice(1).map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleQuickAction(action)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* News & Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>बातम्या आणि अपडेट / News & Updates</Text>
          {newsUpdates.map((news) => (
            <TouchableOpacity key={news.id} style={styles.newsCard}>
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsSubtitle}>{news.subtitle}</Text>
                <Text style={styles.newsTime}>{news.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>सुरक्षा टिप्स / Safety Tips</Text>
          <View style={styles.tipsCard}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>आजचा सुरक्षा टिप / Today's Safety Tip</Text>
              <Text style={styles.tipsText}>
                SOS बटन वापरण्यापूर्वी आपले विश्वसनीय संपर्क अपडेट करा। / 
                Update your trusted contacts before using the SOS button.
              </Text>
            </View>
          </View>
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
    paddingBottom: 24,
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
  },
  sosContainer: {
    paddingHorizontal: 20,
    marginTop: -12,
    marginBottom: 24,
  },
  sosButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sosGradient: {
    padding: 20,
    alignItems: 'center',
  },
  sosText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  sosSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  newsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  newsTime: {
    fontSize: 12,
    color: '#999',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});