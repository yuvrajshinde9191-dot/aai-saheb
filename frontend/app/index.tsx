import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function IndexPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>आई साहेब</Text>
        <Text style={styles.subtitle}>aai Saheb</Text>
        <Text style={styles.description}>महिला सशक्तीकरण मंच</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.button}>
          <Link href="/auth" asChild>
            <Text style={styles.buttonText}>लॉगिन करें / Login</Text>
          </Link>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Link href="/(tabs)" asChild>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>मुख्य मेनू / Main Menu</Text>
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
});