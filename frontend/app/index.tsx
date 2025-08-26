import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const { language } = useLanguage();
  const { user, loading } = useAuth();

  const translations = {
    en: {
      title: 'aai Saheb',
      subtitle: 'Women Empowerment Platform',
      description: 'Empowering women across Maharashtra with safety, employment, and community support',
      getStarted: 'Get Started',
      login: 'Login',
    },
    hi: {
      title: 'आई साहेब',
      subtitle: 'महिला सशक्तीकरण मंच',
      description: 'महाराष्ट्र की महिलाओं को सुरक्षा, रोजगार और समुदायिक सहायता के साथ सशक्त बनाना',
      getStarted: 'शुरू करें',
      login: 'लॉगिन',
    },
    mr: {
      title: 'आई साहेब',
      subtitle: 'महिला सशक्तिकरण व्यासपीठ',
      description: 'महाराष्ट्रातील महिलांना सुरक्षा, रोजगार आणि समुदायिक सहाय्याने सशक्त करणे',
      getStarted: 'सुरुवात करा',
      login: 'लॉगिन',
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    checkInitialRoute();
    startAnimations();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      const token = await AsyncStorage.getItem('userToken');
      
      if (!loading) {
        setTimeout(() => {
          if (user && token) {
            router.replace('/(tabs)');
          } else if (!hasOnboarded) {
            router.replace('/onboarding');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FF6B35', '#F7931E', '#FFD23F']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>आई साहेब</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FF6B35', '#F7931E', '#FFD23F']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
            <Text style={styles.description}>{t.description}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>{t.getStarted}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
              <Text style={styles.secondaryButtonText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.95,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});