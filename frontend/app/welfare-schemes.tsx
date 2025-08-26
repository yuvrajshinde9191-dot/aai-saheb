import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl || 'https://maharashtra-empower.preview.emergentagent.com';

interface Scheme {
  _id: string;
  name: string;
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applicationProcess: string[];
  category: string;
  department: string;
  isActive: boolean;
  lastUpdated: string;
}

interface NGO {
  _id: string;
  name: string;
  services: string[];
  location: string;
  contact: {
    phone: string;
    email: string;
  };
  rating: number;
  availability: string;
}

export default function WelfareSchemeScreen() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showEligibilityWizard, setShowEligibilityWizard] = useState(false);
  const [showNGOBooking, setShowNGOBooking] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Eligibility wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [userAge, setUserAge] = useState('');
  const [userIncome, setUserIncome] = useState('');
  const [userCategory, setUserCategory] = useState('');
  const [hasDisability, setHasDisability] = useState(false);
  const [isMarried, setIsMarried] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);

  const categories = [
    { id: 'all', name: language === 'mr' ? 'सर्व' : (language === 'hi' ? 'सभी' : 'All') },
    { id: 'health', name: language === 'mr' ? 'आरोग्य' : (language === 'hi' ? 'स्वास्थ्य' : 'Health') },
    { id: 'education', name: language === 'mr' ? 'शिक्षण' : (language === 'hi' ? 'शिक्षा' : 'Education') },
    { id: 'employment', name: language === 'mr' ? 'रोजगार' : (language === 'hi' ? 'रोजगार' : 'Employment') },
    { id: 'housing', name: language === 'mr' ? 'निवास' : (language === 'hi' ? 'आवास' : 'Housing') },
    { id: 'finance', name: language === 'mr' ? 'आर्थिक' : (language === 'hi' ? 'वित्तीय' : 'Financial') },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schemesResponse, ngosResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/welfare/schemes`),
        axios.get(`${API_BASE_URL}/api/welfare/ngos`),
      ]);
      
      setSchemes(schemesResponse.data.schemes || []);
      setNgos(ngosResponse.data.ngos || []);
    } catch (error) {
      console.error('Error loading welfare data:', error);
      // Load mock data for demonstration
      setSchemes(getMockSchemes());
      setNgos(getMockNGOs());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMockSchemes = (): Scheme[] => [
    {
      _id: '1',
      name: language === 'mr' ? 'महात्मा ज्योतिबा फुले जन आरोग्य योजना' : (language === 'hi' ? 'महात्मा ज्योतिबा फुले जन आरोग्य योजना' : 'Mahatma Jyotiba Phule Jan Arogya Yojana'),
      description: language === 'mr' ? 
        'गरीब कुटुंबांसाठी मोफत वैद्यकीय उपचार योजना' :
        (language === 'hi' ? 
          'गरीब परिवारों के लिए मुफ्त चिकित्सा उपचार योजना' :
          'Free medical treatment scheme for poor families'),
      benefits: [
        language === 'mr' ? '₹2,50,000 पर्यंत मोफत उपचार' : (language === 'hi' ? '₹2,50,000 तक मुफ्त इलाज' : 'Free treatment up to ₹2,50,000'),
        language === 'mr' ? 'सर्व प्रकारचे ऑपरेशन' : (language === 'hi' ? 'सभी प्रकार के ऑपरेशन' : 'All types of operations'),
      ],
      eligibility: [
        language === 'mr' ? 'कुटुंबाचे वार्षिक उत्पन्न ₹1,00,000 पेक्षा कमी' : (language === 'hi' ? 'पारिवारिक वार्षिक आय ₹1,00,000 से कम' : 'Family annual income less than ₹1,00,000'),
        language === 'mr' ? 'महाराष्ट्राचे मूळ रहिवासी' : (language === 'hi' ? 'महाराष्ट्र के मूल निवासी' : 'Native of Maharashtra'),
      ],
      documents: [
        language === 'mr' ? 'आधार कार्ड' : (language === 'hi' ? 'आधार कार्ड' : 'Aadhaar Card'),
        language === 'mr' ? 'उत्पन्न प्रमाणपत्र' : (language === 'hi' ? 'आय प्रमाण पत्र' : 'Income Certificate'),
        language === 'mr' ? 'निवास प्रमाणपत्र' : (language === 'hi' ? 'निवास प्रमाण पत्र' : 'Residence Certificate'),
      ],
      applicationProcess: [
        language === 'mr' ? 'जवळच्या सामुदायिक आरोग्य केंद्रात जा' : (language === 'hi' ? 'नजदीकी सामुदायिक स्वास्थ्य केंद्र जाएं' : 'Visit nearest Community Health Center'),
        language === 'mr' ? 'आवश्यक कागदपत्रे घेऊन जा' : (language === 'hi' ? 'आवश्यक दस्तावेज लेकर जाएं' : 'Take required documents'),
        language === 'mr' ? 'फॉर्म भरा आणि जमा करा' : (language === 'hi' ? 'फॉर्म भरकर जमा करें' : 'Fill and submit form'),
      ],
      category: 'health',
      department: language === 'mr' ? 'आरोग्य विभाग' : (language === 'hi' ? 'स्वास्थ्य विभाग' : 'Health Department'),
      isActive: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      _id: '2',
      name: language === 'mr' ? 'लेक लाडकी योजना' : (language === 'hi' ? 'लेक लाडकी योजना' : 'Lek Ladki Yojana'),
      description: language === 'mr' ? 
        'मुलींच्या शिक्षणासाठी आर्थिक मदत योजना' :
        (language === 'hi' ? 
          'लड़कियों की शिक्षा के लिए वित्तीय सहायता योजना' :
          'Financial assistance scheme for girls education'),
      benefits: [
        language === 'mr' ? 'जन्माच्या वेळी ₹5,000' : (language === 'hi' ? 'जन्म के समय ₹5,000' : '₹5,000 at birth'),
        language === 'mr' ? '6वी पास झाल्यावर ₹4,000' : (language === 'hi' ? '6वीं पास करने पर ₹4,000' : '₹4,000 on passing 6th'),
        language === 'mr' ? '11वी पास झाल्यावर ₹6,000' : (language === 'hi' ? '11वीं पास करने पर ₹6,000' : '₹6,000 on passing 11th'),
        language === 'mr' ? '18 वर्षांच्या वयात ₹75,000' : (language === 'hi' ? '18 साल की उम्र में ₹75,000' : '₹75,000 at age 18'),
      ],
      eligibility: [
        language === 'mr' ? 'मुलगी महाराष्ट्रात जन्माला आली असावी' : (language === 'hi' ? 'लड़की का जन्म महाराष्ट्र में हुआ हो' : 'Girl born in Maharashtra'),
        language === 'mr' ? 'कुटुंबाचे वार्षिक उत्पन्न ₹1,00,000 पेक्षा कमी' : (language === 'hi' ? 'पारिवारिक वार्षिक आय ₹1,00,000 से कम' : 'Family annual income less than ₹1,00,000'),
      ],
      documents: [
        language === 'mr' ? 'जन्म प्रमाणपत्र' : (language === 'hi' ? 'जन्म प्रमाण पत्र' : 'Birth Certificate'),
        language === 'mr' ? 'आधार कार्ड' : (language === 'hi' ? 'आधार कार्ड' : 'Aadhaar Card'),
        language === 'mr' ? 'बँक खाते तपशील' : (language === 'hi' ? 'बैंक खाता विवरण' : 'Bank Account Details'),
      ],
      applicationProcess: [
        language === 'mr' ? 'ऑनलाइन आवेदन द्या' : (language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply online'),
        language === 'mr' ? 'जवळच्या आंगणवाडी केंद्रात तपासा' : (language === 'hi' ? 'नजदीकी आंगनवाड़ी केंद्र में जांच कराएं' : 'Verify at nearest Anganwadi center'),
      ],
      category: 'education',
      department: language === 'mr' ? 'महिला आणि बाल विकास विभाग' : (language === 'hi' ? 'महिला एवं बाल विकास विभाग' : 'Women & Child Development Department'),
      isActive: true,
      lastUpdated: new Date().toISOString(),
    },
  ];

  const getMockNGOs = (): NGO[] => [
    {
      _id: '1',
      name: language === 'mr' ? 'महिला सहाय्य संस्था' : (language === 'hi' ? 'महिला सहायता संस्था' : 'Women Support Organization'),
      services: [
        language === 'mr' ? 'कायदेशीर सल्ला' : (language === 'hi' ? 'कानूनी सलाह' : 'Legal Advice'),
        language === 'mr' ? 'मानसिक सल्ला' : (language === 'hi' ? 'मानसिक परामर्श' : 'Counseling'),
        language === 'mr' ? 'आर्थिक मदत' : (language === 'hi' ? 'वित्तीय सहायता' : 'Financial Aid'),
      ],
      location: language === 'mr' ? 'मुंबई, महाराष्ट्र' : (language === 'hi' ? 'मुंबई, महाराष्ट्र' : 'Mumbai, Maharashtra'),
      contact: {
        phone: '+91-22-12345678',
        email: 'help@womensupport.org',
      },
      rating: 4.8,
      availability: language === 'mr' ? 'सोमवार - शुक्रवार, 9 AM - 6 PM' : (language === 'hi' ? 'सोमवार - शुक्रवार, 9 AM - 6 PM' : 'Monday - Friday, 9 AM - 6 PM'),
    },
    {
      _id: '2',
      name: language === 'mr' ? 'महिला कल्याण फाउंडेशन' : (language === 'hi' ? 'महिला कल्याण फाउंडेशन' : 'Women Welfare Foundation'),
      services: [
        language === 'mr' ? 'कौशल्य विकास' : (language === 'hi' ? 'कौशल विकास' : 'Skill Development'),
        language === 'mr' ? 'रोजगार मार्गदर्शन' : (language === 'hi' ? 'रोजगार मार्गदर्शन' : 'Employment Guidance'),
        language === 'mr' ? 'उद्योजकता प्रशिक्षण' : (language === 'hi' ? 'उद्यमिता प्रशिक्षण' : 'Entrepreneurship Training'),
      ],
      location: language === 'mr' ? 'पुणे, महाराष्ट्र' : (language === 'hi' ? 'पुणे, महाराष्ट्र' : 'Pune, Maharashtra'),
      contact: {
        phone: '+91-20-98765432',
        email: 'contact@womenwelfare.org',
      },
      rating: 4.6,
      availability: language === 'mr' ? 'सर्व दिवस, 24/7' : (language === 'hi' ? 'सभी दिन, 24/7' : 'All days, 24/7'),
    },
  ];

  const filterSchemes = () => {
    return schemes.filter(scheme => {
      const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
      return matchesSearch && matchesCategory && scheme.isActive;
    });
  };

  const checkEligibility = () => {
    // Simple eligibility logic based on user inputs
    const eligible = schemes.filter(scheme => {
      if (selectedCategory !== 'all' && scheme.category !== selectedCategory) return false;
      
      // Basic eligibility checks
      if (scheme.category === 'health' && parseInt(userIncome) > 100000) return false;
      if (scheme.category === 'education' && parseInt(userAge) > 25) return false;
      
      return true;
    });
    
    setEligibleSchemes(eligible);
    setWizardStep(4); // Show results
  };

  const bookNGOAppointment = async (ngo: NGO) => {
    try {
      const token = await getStoredToken();
      await axios.post(`${API_BASE_URL}/api/welfare/ngo-appointment`, {
        ngoId: ngo._id,
        userId: user?._id,
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        serviceType: 'consultation',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'भेटीचे वेळापत्रक निश्चित झाले' : (language === 'hi' ? 'अपॉइंटमेंट बुक हो गया' : 'Appointment booked successfully')
      );
      setShowNGOBooking(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    }
  };

  const getStoredToken = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('userToken');
  };

  const renderSchemeCard = (scheme: Scheme) => (
    <TouchableOpacity
      key={scheme._id}
      style={styles.schemeCard}
      onPress={() => {
        setSelectedScheme(scheme);
        setShowSchemeModal(true);
      }}
    >
      <View style={styles.schemeHeader}>
        <Text style={styles.schemeName} numberOfLines={2}>{scheme.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {categories.find(c => c.id === scheme.category)?.name || scheme.category}
          </Text>
        </View>
      </View>
      
      <Text style={styles.schemeDescription} numberOfLines={3}>
        {scheme.description}
      </Text>
      
      <View style={styles.schemeFooter}>
        <Text style={styles.schemeDepartment}>{scheme.department}</Text>
        <Ionicons name="arrow-forward" size={20} color="#FF6B35" />
      </View>
    </TouchableOpacity>
  );

  const renderNGOCard = (ngo: NGO) => (
    <TouchableOpacity
      key={ngo._id}
      style={styles.ngoCard}
      onPress={() => {
        setSelectedNGO(ngo);
        setShowNGOBooking(true);
      }}
    >
      <View style={styles.ngoHeader}>
        <Text style={styles.ngoName}>{ngo.name}</Text>
        <View style={styles.ngoRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{ngo.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.ngoLocation}>📍 {ngo.location}</Text>
      
      <View style={styles.ngoServices}>
        {ngo.services.slice(0, 2).map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
        {ngo.services.length > 2 && (
          <Text style={styles.moreServices}>+{ngo.services.length - 2} more</Text>
        )}
      </View>
      
      <Text style={styles.ngoAvailability}>🕐 {ngo.availability}</Text>
    </TouchableOpacity>
  );

  const renderEligibilityWizard = () => {
    const wizardSteps = [
      {
        title: language === 'mr' ? 'तुमचे वय' : (language === 'hi' ? 'आपकी उम्र' : 'Your Age'),
        content: (
          <View>
            <TextInput
              style={styles.wizardInput}
              placeholder={language === 'mr' ? 'वय (वर्षांत)' : (language === 'hi' ? 'उम्र (वर्षों में)' : 'Age (in years)')}
              value={userAge}
              onChangeText={setUserAge}
              keyboardType="numeric"
            />
          </View>
        ),
      },
      {
        title: language === 'mr' ? 'कुटुंबाचे वार्षिक उत्पन्न' : (language === 'hi' ? 'पारिवारिक वार्षिक आय' : 'Family Annual Income'),
        content: (
          <View>
            <TextInput
              style={styles.wizardInput}
              placeholder={language === 'mr' ? 'वार्षिक उत्पन्न (रुपयात)' : (language === 'hi' ? 'वार्षिक आय (रुपए में)' : 'Annual income (in rupees)')}
              value={userIncome}
              onChangeText={setUserIncome}
              keyboardType="numeric"
            />
          </View>
        ),
      },
      {
        title: language === 'mr' ? 'वर्गवारी' : (language === 'hi' ? 'श्रेणी' : 'Category'),
        content: (
          <View style={styles.optionsContainer}>
            {['General', 'OBC', 'SC', 'ST'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.optionButton,
                  userCategory === category && styles.selectedOption,
                ]}
                onPress={() => setUserCategory(category)}
              >
                <Text style={[
                  styles.optionText,
                  userCategory === category && styles.selectedOptionText,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ),
      },
      {
        title: language === 'mr' ? 'अतिरिक्त माहिती' : (language === 'hi' ? 'अतिरिक्त जानकारी' : 'Additional Information'),
        content: (
          <View>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setHasDisability(!hasDisability)}
            >
              <Ionicons 
                name={hasDisability ? "checkbox" : "square-outline"} 
                size={24} 
                color="#FF6B35" 
              />
              <Text style={styles.checkboxText}>
                {language === 'mr' ? 'अपंगत्व आहे' : (language === 'hi' ? 'विकलांगता है' : 'Has disability')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsMarried(!isMarried)}
            >
              <Ionicons 
                name={isMarried ? "checkbox" : "square-outline"} 
                size={24} 
                color="#FF6B35" 
              />
              <Text style={styles.checkboxText}>
                {language === 'mr' ? 'विवाहित' : (language === 'hi' ? 'विवाहित' : 'Married')}
              </Text>
            </TouchableOpacity>
          </View>
        ),
      },
      {
        title: language === 'mr' ? 'तुमच्यासाठी योग्य योजना' : (language === 'hi' ? 'आपके लिए उपयुक्त योजनाएं' : 'Eligible Schemes for You'),
        content: (
          <ScrollView style={styles.resultsContainer}>
            {eligibleSchemes.length > 0 ? (
              eligibleSchemes.map(renderSchemeCard)
            ) : (
              <Text style={styles.noResults}>
                {language === 'mr' ? 'कोणत्याही योजनेसाठी पात्र नाही' : (language === 'hi' ? 'किसी भी योजना के लिए पात्र नहीं' : 'Not eligible for any schemes')}
              </Text>
            )}
          </ScrollView>
        ),
      },
    ];

    return wizardSteps[wizardStep];
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'mr' ? 'कल्याणकारी योजना' : (language === 'hi' ? 'कल्याणकारी योजनाएं' : 'Welfare Schemes')}
          </Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowEligibilityWizard(true)}
        >
          <Ionicons name="help-circle" size={24} color="#FF6B35" />
          <Text style={styles.actionText}>
            {language === 'mr' ? 'पात्रता तपासा' : (language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowNGOBooking(true)}
        >
          <Ionicons name="calendar" size={24} color="#FF6B35" />
          <Text style={styles.actionText}>
            {language === 'mr' ? 'NGO भेट बुक करा' : (language === 'hi' ? 'NGO अपॉइंटमेंट' : 'Book NGO Meeting')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'mr' ? 'योजना शोधा...' : (language === 'hi' ? 'योजना खोजें...' : 'Search schemes...')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive,
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Schemes List */}
      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>
          {language === 'mr' ? 'उपलब्ध योजना' : (language === 'hi' ? 'उपलब्ध योजनाएं' : 'Available Schemes')}
        </Text>
        
        {filterSchemes().map(renderSchemeCard)}

        <Text style={styles.sectionTitle}>
          {language === 'mr' ? 'सहाय्यक संस्था' : (language === 'hi' ? 'सहायक संस्थाएं' : 'Partner NGOs')}
        </Text>
        
        {ngos.map(renderNGOCard)}
      </ScrollView>

      {/* Scheme Details Modal */}
      <Modal visible={showSchemeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedScheme?.name}</Text>
              <TouchableOpacity onPress={() => setShowSchemeModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.schemeDetailDescription}>
                {selectedScheme?.description}
              </Text>
              
              <Text style={styles.detailSectionTitle}>
                {language === 'mr' ? 'फायदे' : (language === 'hi' ? 'लाभ' : 'Benefits')}
              </Text>
              {selectedScheme?.benefits.map((benefit, index) => (
                <Text key={index} style={styles.listItem}>• {benefit}</Text>
              ))}
              
              <Text style={styles.detailSectionTitle}>
                {language === 'mr' ? 'पात्रता' : (language === 'hi' ? 'पात्रता' : 'Eligibility')}
              </Text>
              {selectedScheme?.eligibility.map((criteria, index) => (
                <Text key={index} style={styles.listItem}>• {criteria}</Text>
              ))}
              
              <Text style={styles.detailSectionTitle}>
                {language === 'mr' ? 'आवश्यक कागदपत्रे' : (language === 'hi' ? 'आवश्यक दस्तावेज' : 'Required Documents')}
              </Text>
              {selectedScheme?.documents.map((doc, index) => (
                <Text key={index} style={styles.listItem}>• {doc}</Text>
              ))}
              
              <Text style={styles.detailSectionTitle}>
                {language === 'mr' ? 'अर्जाची प्रक्रिया' : (language === 'hi' ? 'आवेदन प्रक्रिया' : 'Application Process')}
              </Text>
              {selectedScheme?.applicationProcess.map((step, index) => (
                <Text key={index} style={styles.processStep}>
                  {index + 1}. {step}
                </Text>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>
                {language === 'mr' ? 'अर्ज करा' : (language === 'hi' ? 'आवेदन करें' : 'Apply Now')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Eligibility Wizard Modal */}
      <Modal visible={showEligibilityWizard} animationType="slide">
        <SafeAreaView style={styles.wizardContainer}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => setShowEligibilityWizard(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.wizardTitle}>
              {language === 'mr' ? 'पात्रता तपासा' : (language === 'hi' ? 'पात्रता जांच' : 'Eligibility Check')}
            </Text>
            <View style={styles.wizardProgress}>
              <Text style={styles.progressText}>{wizardStep + 1}/5</Text>
            </View>
          </View>
          
          <View style={styles.wizardContent}>
            <Text style={styles.wizardStepTitle}>
              {renderEligibilityWizard().title}
            </Text>
            {renderEligibilityWizard().content}
          </View>
          
          <View style={styles.wizardButtons}>
            {wizardStep > 0 && wizardStep < 4 && (
              <TouchableOpacity 
                style={styles.wizardBackButton}
                onPress={() => setWizardStep(wizardStep - 1)}
              >
                <Text style={styles.wizardBackButtonText}>
                  {language === 'mr' ? 'मागे' : (language === 'hi' ? 'पीछे' : 'Back')}
                </Text>
              </TouchableOpacity>
            )}
            
            {wizardStep < 3 && (
              <TouchableOpacity 
                style={styles.wizardNextButton}
                onPress={() => setWizardStep(wizardStep + 1)}
              >
                <Text style={styles.wizardNextButtonText}>
                  {language === 'mr' ? 'पुढे' : (language === 'hi' ? 'आगे' : 'Next')}
                </Text>
              </TouchableOpacity>
            )}
            
            {wizardStep === 3 && (
              <TouchableOpacity 
                style={styles.wizardCheckButton}
                onPress={checkEligibility}
              >
                <Text style={styles.wizardCheckButtonText}>
                  {language === 'mr' ? 'तपासा' : (language === 'hi' ? 'जांचें' : 'Check')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* NGO Booking Modal */}
      <Modal visible={showNGOBooking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'mr' ? 'NGO भेट बुक करा' : (language === 'hi' ? 'NGO अपॉइंटमेंट बुक करें' : 'Book NGO Appointment')}
              </Text>
              <TouchableOpacity onPress={() => setShowNGOBooking(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {ngos.map((ngo) => (
                <TouchableOpacity
                  key={ngo._id}
                  style={styles.ngoBookingCard}
                  onPress={() => bookNGOAppointment(ngo)}
                >
                  <Text style={styles.ngoBookingName}>{ngo.name}</Text>
                  <Text style={styles.ngoBookingLocation}>📍 {ngo.location}</Text>
                  <Text style={styles.ngoBookingServices}>
                    Services: {ngo.services.join(', ')}
                  </Text>
                  <Text style={styles.ngoBookingContact}>
                    📞 {ngo.contact.phone}
                  </Text>
                  <View style={styles.ngoBookingFooter}>
                    <View style={styles.ngoBookingRating}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ngoBookingRatingText}>{ngo.rating}</Text>
                    </View>
                    <Text style={styles.bookNowText}>
                      {language === 'mr' ? 'आत्ताच बुक करा' : (language === 'hi' ? 'अभी बुक करें' : 'Book Now')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    marginLeft: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  schemeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schemeDepartment: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  ngoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ngoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ngoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ngoRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ngoLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ngoServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  serviceTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  moreServices: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'center',
  },
  ngoAvailability: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  schemeDetailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  processStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  wizardContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  wizardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  wizardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  wizardProgress: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  wizardContent: {
    flex: 1,
    padding: 20,
  },
  wizardStepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  wizardInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  resultsContainer: {
    maxHeight: 400,
  },
  noResults: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  wizardButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  wizardBackButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
  },
  wizardBackButtonText: {
    fontSize: 16,
    color: '#666',
  },
  wizardNextButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
  },
  wizardNextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wizardCheckButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  wizardCheckButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ngoBookingCard: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ngoBookingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ngoBookingLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ngoBookingServices: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  ngoBookingContact: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  ngoBookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ngoBookingRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ngoBookingRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  bookNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
});