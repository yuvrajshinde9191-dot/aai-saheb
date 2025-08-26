import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl || 'https://empower-her-2.preview.emergentagent.com';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
}

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<string>('Maharashtra, India');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [safetyTips, setSafetyTips] = useState<SafetyTip[]>([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Load cached location
      const cachedLocation = await AsyncStorage.getItem('userLocation');
      if (cachedLocation) {
        setLocation(cachedLocation);
      }

      // Load mock news and safety tips (in production, these would come from APIs)
      setNews([
        {
          id: '1',
          title: language === 'mr' ? 'महिला सुरक्षा योजना' : (language === 'hi' ? 'महिला सुरक्षा योजना' : 'Women Safety Scheme'),
          summary: language === 'mr' ? 'नवीन सुरक्षा उपाययोजना राज्यात सुरू' : (language === 'hi' ? 'राज्य में नई सुरक्षा योजना शुरू' : 'New safety scheme launched in the state'),
          category: 'Safety',
          timestamp: '2 hours ago',
        },
        {
          id: '2',
          title: language === 'mr' ? 'रोजगार मेळावा' : (language === 'hi' ? 'रोजगार मेला' : 'Employment Fair'),
          summary: language === 'mr' ? 'महिलांसाठी विशेष रोजगार मेळावा आयोजित' : (language === 'hi' ? 'महिलाओं के लिए विशेष रोजगार मेला आयोजित' : 'Special employment fair organized for women'),
          category: 'Employment',
          timestamp: '5 hours ago',
        }
      ]);

      setSafetyTips([
        {
          id: '1',
          title: language === 'mr' ? 'आपत्कालीन संपर्क' : (language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'),
          description: language === 'mr' ? 'आपले विश्वसनीय संपर्क अद्ययावत ठेवा' : (language === 'hi' ? 'अपने विश्वसनीय संपर्क अपडेट रखें' : 'Keep your trusted contacts updated'),
          category: 'Safety',
        },
        {
          id: '2',
          title: language === 'mr' ? 'स्थान सामायिकरण' : (language === 'hi' ? 'स्थान साझाकरण' : 'Location Sharing'),
          description: language === 'mr' ? 'आपत्कालीन परिस्थितीत स्थान सामायिक करा' : (language === 'hi' ? 'आपातकाल में स्थान साझा करें' : 'Share location during emergencies'),
          category: 'Safety',
        }
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'sos',
      title: language === 'mr' ? 'तातडीची मदत' : (language === 'hi' ? 'तत्काल सहायता' : 'Emergency Help'),
      icon: 'shield-checkmark',
      color: '#FF4444',
      onPress: () => router.push('/(tabs)/sos'),
    },
    {
      id: 'jobs',
      title: language === 'mr' ? 'नोकर्‍या' : (language === 'hi' ? 'नौकरियां' : 'Jobs'),
      icon: 'briefcase',
      color: '#4CAF50',
      onPress: () => router.push('/(tabs)/employment'),
    },
    {
      id: 'welfare',
      title: language === 'mr' ? 'कल्याण योजना' : (language === 'hi' ? 'कल्याण योजना' : 'Welfare Schemes'),
      icon: 'heart',
      color: '#2196F3',
      onPress: () => router.push('/welfare-schemes'),
    },
    {
      id: 'community',
      title: language === 'mr' ? 'समुदाय' : (language === 'hi' ? 'समुदाय' : 'Community'),
      icon: 'people',
      color: '#FF9800',
      onPress: () => router.push('/(tabs)/community'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {language === 'mr' ? 'नमस्कार' : (language === 'hi' ? 'नमस्ते' : 'Hello')}, {user?.role || 'User'}
            </Text>
            <Text style={styles.location}>📍 {location}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'त्वरित कृती' : (language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions')}
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <Ionicons name={action.icon as any} size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* News Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'ताज्या बातम्या' : (language === 'hi' ? 'ताजा समाचार' : 'Latest News')}
          </Text>
          {news.map((item) => (
            <TouchableOpacity key={item.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSummary}>{item.summary}</Text>
              <View style={styles.newsFooter}>
                <Text style={styles.newsCategory}>{item.category}</Text>
                <Text style={styles.newsTime}>{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'सुरक्षा टिप्स' : (language === 'hi' ? 'सुरक्षा टिप्स' : 'Safety Tips')}
          </Text>
          {safetyTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <Ionicons name="bulb" size={24} color="#FF6B35" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newsTime: {
    fontSize: 12,
    color: '#999999',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});