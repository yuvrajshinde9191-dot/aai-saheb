import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WelfareSchemesScreen() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BACKEND_URL}/api/welfare-schemes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSchemes(response.data.schemes || []);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      Alert.alert('Error', 'Failed to fetch welfare schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleSchemePress = (scheme: any) => {
    setSelectedScheme(scheme);
    setShowDetails(true);
  };

  const handleApplyScheme = (scheme: any) => {
    Alert.alert(
      'योजनेसाठी अर्ज / Apply for Scheme',
      `तुम्हाला ${scheme.name} या योजनेसाठी अर्ज करायचा आहे का? / Do you want to apply for ${scheme.name_en}?`,
      [
        { text: 'रद्द करा / Cancel', style: 'cancel' },
        { 
          text: 'अर्ज करा / Apply', 
          onPress: () => {
            setShowDetails(false);
            Alert.alert(
              'अर्ज यशस्वी / Application Successful',
              'तुमचा अर्ज यशस्वीरित्या सबमिट झाला आहे. तुम्हाला लवकरच अपडेट मिळेल. / Your application has been successfully submitted. You will receive updates soon.'
            );
          }
        },
      ]
    );
  };

  const renderSchemeCard = (scheme: any) => (
    <TouchableOpacity
      key={scheme.id}
      style={styles.schemeCard}
      onPress={() => handleSchemePress(scheme)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.schemeIcon}>
          <Ionicons name="document" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.schemeInfo}>
          <Text style={styles.schemeName}>{scheme.name}</Text>
          <Text style={styles.schemeNameEn}>{scheme.name_en}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
      </View>

      <Text style={styles.schemeDescription}>{scheme.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.benefitTag}>
          <Ionicons name="gift" size={14} color="#4CAF50" />
          <Text style={styles.benefitText}>
            {scheme.benefits ? scheme.benefits[0] : 'मुख्य लाभ'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.quickApplyButton}
          onPress={() => handleApplyScheme(scheme)}
        >
          <Text style={styles.quickApplyText}>द्रुत अर्ज</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSchemeDetails = () => {
    if (!selectedScheme) return null;

    return (
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>योजना तपशील / Scheme Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.detailsHeader}
            >
              <Text style={styles.detailsTitle}>{selectedScheme.name}</Text>
              <Text style={styles.detailsTitleEn}>{selectedScheme.name_en}</Text>
            </LinearGradient>

            <View style={styles.detailsContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  वर्णन / Description
                </Text>
                <Text style={styles.detailText}>{selectedScheme.description}</Text>
                <Text style={styles.detailTextEn}>{selectedScheme.description_en}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  पात्रता निकष / Eligibility Criteria
                </Text>
                {selectedScheme.eligibility?.map((criteria: string, index: number) => (
                  <View key={index} style={styles.criteriaItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.criteriaText}>{criteria}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  लाभ / Benefits
                </Text>
                {selectedScheme.benefits?.map((benefit: string, index: number) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="gift" size={16} color="#FF6B35" />
                    <Text style={styles.benefitItemText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  आवश्यक कागदपत्रे / Required Documents
                </Text>
                {selectedScheme.documents_required?.map((doc: string, index: number) => (
                  <View key={index} style={styles.documentItem}>
                    <Ionicons name="document" size={16} color="#2196F3" />
                    <Text style={styles.documentText}>{doc}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  अर्ज प्रक्रिया / Application Process
                </Text>
                <View style={styles.processItem}>
                  <Ionicons name="information-circle" size={16} color="#FF9800" />
                  <Text style={styles.processText}>{selectedScheme.application_process}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => handleApplyScheme(selectedScheme)}
            >
              <Ionicons name="document" size={20} color="#FFFFFF" />
              <Text style={styles.applyButtonText}>
                योजनेसाठी अर्ज करा / Apply for Scheme
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              कल्याणकारी योजना / Welfare Schemes
            </Text>
            <Text style={styles.headerSubtitle}>
              सरकारी योजना आणि लाभ / Government schemes and benefits
            </Text>
          </View>
        </LinearGradient>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoBannerText}>
            महाराष्ट्र सरकारच्या महिलांसाठी विशेष योजना / 
            Special schemes for women by Maharashtra Government
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>द्रुत क्रिया / Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="calculator" size={20} color="#FF6B35" />
              <Text style={styles.quickActionText}>पात्रता तपासा</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="document-text" size={20} color="#FF6B35" />
              <Text style={styles.quickActionText}>माझे अर्ज</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="help-circle" size={20} color="#FF6B35" />
              <Text style={styles.quickActionText}>मदत</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schemes List */}
        <View style={styles.schemesContainer}>
          <Text style={styles.sectionTitle}>
            उपलब्ध योजना / Available Schemes ({schemes.length})
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>योजना लोड होत आहेत... / Loading schemes...</Text>
            </View>
          ) : (
            schemes.map((scheme) => renderSchemeCard(scheme))
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>मदत आणि सहाय्य / Help & Support</Text>
          
          <TouchableOpacity style={styles.helpItem}>
            <Ionicons name="call" size={20} color="#4CAF50" />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>हेल्पलाइन / Helpline</Text>
              <Text style={styles.helpSubtitle}>1800-123-4567 (टोल फ्री)</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpItem}>
            <Ionicons name="globe" size={20} color="#2196F3" />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>अधिकृत वेबसाइट / Official Website</Text>
              <Text style={styles.helpSubtitle}>mahawomen.gov.in</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderSchemeDetails()}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 20,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  schemesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  schemeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  schemeNameEn: {
    fontSize: 14,
    color: '#666',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  benefitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  quickApplyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickApplyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  helpText: {
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  bottomPadding: {
    height: 32,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
  },
  detailsHeader: {
    padding: 24,
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  detailsTitleEn: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  detailsContent: {
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  detailTextEn: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  criteriaText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  processItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  processText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});