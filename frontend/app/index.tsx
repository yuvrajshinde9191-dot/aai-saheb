import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import LoadingScreen from '../components/LoadingScreen';

export default function IndexPage() {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const hasCompletedOnboarding = await AsyncStorage.getItem('onboardingCompleted');
      
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/auth');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <LoadingScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
});