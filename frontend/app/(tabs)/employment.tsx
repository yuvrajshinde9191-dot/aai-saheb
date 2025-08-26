import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl || 'https://maharashtra-empower.preview.emergentagent.com';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isWomenFriendly: boolean;
  category: string;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  lessons: number;
  certificate: boolean;
  price: number;
  rating: number;
  thumbnail: string;
}

export default function EmploymentScreen() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'skills' | 'resume'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setCourse] = useState<Course | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const categories = [
    { id: 'all', name: language === 'mr' ? 'सर्व' : (language === 'hi' ? 'सभी' : 'All') },
    { id: 'technology', name: language === 'mr' ? 'तंत्रज्ञान' : (language === 'hi' ? 'प्रौद्योगिकी' : 'Technology') },
    { id: 'healthcare', name: language === 'mr' ? 'आरोग्यसेवा' : (language === 'hi' ? 'स्वास्थ्य सेवा' : 'Healthcare') },
    { id: 'education', name: language === 'mr' ? 'शिक्षण' : (language === 'hi' ? 'शिक्षा' : 'Education') },
    { id: 'finance', name: language === 'mr' ? 'वित्त' : (language === 'hi' ? 'वित्त' : 'Finance') },
    { id: 'retail', name: language === 'mr' ? 'किरकोळ' : (language === 'hi' ? 'खुदरा' : 'Retail') },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, coursesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/employment/jobs`),
        axios.get(`${API_BASE_URL}/api/employment/courses`),
      ]);
      
      setJobs(jobsResponse.data.jobs || []);
      setCourses(coursesResponse.data.courses || []);
    } catch (error) {
      console.error('Error loading employment data:', error);
      // Load mock data for demonstration
      setJobs(getMockJobs());
      setCourses(getMockCourses());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMockJobs = (): Job[] => [
    {
      _id: '1',
      title: language === 'mr' ? 'सॉफ्टवेअर डेव्हलपर' : (language === 'hi' ? 'सॉफ्टवेयर डेवलपर' : 'Software Developer'),
      company: 'TechCorp Maharashtra',
      location: language === 'mr' ? 'मुंबई, महाराष्ट्र' : (language === 'hi' ? 'मुंबई, महाराष्ट्र' : 'Mumbai, Maharashtra'),
      salary: '₹8-12 LPA',
      type: language === 'mr' ? 'पूर्णवेळ' : (language === 'hi' ? 'पूर्णकालिक' : 'Full-time'),
      description: language === 'mr' ? 'महिला-अनुकूल कार्यक्षेत्र असलेल्या तंत्रज्ञान कंपनीत सॉफ्टवेअर डेव्हलपर पदासाठी संधी' : (language === 'hi' ? 'महिला-अनुकूल कार्यक्षेत्र वाली तकनीकी कंपनी में सॉफ्टवेयर डेवलपर पद के लिए अवसर' : 'Opportunity for software developer position in tech company with women-friendly workplace'),
      requirements: ['React Native', 'JavaScript', 'Node.js'],
      benefits: [language === 'mr' ? 'मातृत्व रजा' : (language === 'hi' ? 'मातृत्व अवकाश' : 'Maternity Leave'), language === 'mr' ? 'लवचिक वेळा' : (language === 'hi' ? 'लचीला समय' : 'Flexible Hours')],
      isWomenFriendly: true,
      category: 'technology',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: language === 'mr' ? 'नर्स' : (language === 'hi' ? 'नर्स' : 'Nurse'),
      company: 'Apollo Hospital',
      location: language === 'mr' ? 'पुणे, महाराष्ट्र' : (language === 'hi' ? 'पुणे, महाराष्ट्र' : 'Pune, Maharashtra'),
      salary: '₹4-6 LPA',
      type: language === 'mr' ? 'पूर्णवेळ' : (language === 'hi' ? 'पूर्णकालिक' : 'Full-time'),
      description: language === 'mr' ? 'प्रतिष्ठित रुग्णालयात नर्सिंग पदासाठी संधी' : (language === 'hi' ? 'प्रतिष्ठित अस्पताल में नर्सिंग पद के लिए अवसर' : 'Nursing position opportunity at prestigious hospital'),
      requirements: ['B.Sc Nursing', 'Registration', '2+ years experience'],
      benefits: ['Health Insurance', 'Night Shift Allowance'],
      isWomenFriendly: true,
      category: 'healthcare',
      createdAt: new Date().toISOString(),
    },
  ];

  const getMockCourses = (): Course[] => [
    {
      _id: '1',
      title: language === 'mr' ? 'डिजिटल साक्षरता कोर्स' : (language === 'hi' ? 'डिजिटल साक्षरता कोर्स' : 'Digital Literacy Course'),
      description: language === 'mr' ? 'संगणक आणि इंटरनेटचा वापर शिका' : (language === 'hi' ? 'कंप्यूटर और इंटरनेट का उपयोग सीखें' : 'Learn computer and internet usage'),
      instructor: 'Dr. Priya Sharma',
      duration: '6 weeks',
      level: language === 'mr' ? 'सुरुवाती' : (language === 'hi' ? 'शुरुआती' : 'Beginner'),
      category: 'technology',
      lessons: 24,
      certificate: true,
      price: 0,
      rating: 4.8,
      thumbnail: '',
    },
    {
      _id: '2',
      title: language === 'mr' ? 'आर्थिक साक्षरता' : (language === 'hi' ? 'वित्तीय साक्षरता' : 'Financial Literacy'),
      description: language === 'mr' ? 'पैसे व्यवस्थापन आणि गुंतवणूक शिका' : (language === 'hi' ? 'पैसे का प्रबंधन और निवेश सीखें' : 'Learn money management and investment'),
      instructor: 'CA Sunita Patil',
      duration: '4 weeks',
      level: language === 'mr' ? 'सुरुवाती' : (language === 'hi' ? 'शुरुआती' : 'Beginner'),
      category: 'finance',
      lessons: 16,
      certificate: true,
      price: 999,
      rating: 4.9,
      thumbnail: '',
    },
  ];

  const filterJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filterCourses = () => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const applyForJob = async (jobId: string) => {
    try {
      const token = await getStoredToken();
      await axios.post(`${API_BASE_URL}/api/employment/apply`, {
        jobId,
        userId: user?._id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'नोकरीसाठी अर्ज यशस्वीरीत्या पाठवला गेला' : (language === 'hi' ? 'नौकरी के लिए आवेदन सफलतापूर्वक भेजा गया' : 'Job application sent successfully')
      );
      setShowJobModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to apply for job. Please try again.');
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const token = await getStoredToken();
      await axios.post(`${API_BASE_URL}/api/employment/enroll`, {
        courseId,
        userId: user?._id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'कोर्समध्ये नोंदणी यशस्वी' : (language === 'hi' ? 'कोर्स में नामांकन सफल' : 'Successfully enrolled in course')
      );
      setShowCourseModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll in course. Please try again.');
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessages = [...chatMessages, { text: chatInput, isUser: true }];
    setChatMessages(newMessages);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = language === 'mr' ? 
        'मी तुम्हाला नोकरी शोधण्यात मदत करू शकतो. तुमची कौशल्ये काय आहेत?' :
        (language === 'hi' ? 
          'मैं आपको नौकरी खोजने में मदद कर सकता हूं। आपके कौशल क्या हैं?' :
          'I can help you find jobs. What are your skills?');
      
      setChatMessages([...newMessages, { text: aiResponse, isUser: false }]);
    }, 1000);
  };

  const getStoredToken = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('userToken');
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => {
        setSelectedJob(item);
        setShowJobModal(true);
      }}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobCompany}>{item.company}</Text>
          <Text style={styles.jobLocation}>📍 {item.location}</Text>
        </View>
        {item.isWomenFriendly && (
          <View style={styles.womenFriendlyBadge}>
            <Text style={styles.badgeText}>♀ Friendly</Text>
          </View>
        )}
      </View>
      
      <View style={styles.jobDetails}>
        <Text style={styles.jobSalary}>💰 {item.salary}</Text>
        <Text style={styles.jobType}>⏰ {item.type}</Text>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => {
        setCourse(item);
        setShowCourseModal(true);
      }}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <View style={styles.courseRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.courseInstructor}>👨‍🏫 {item.instructor}</Text>
      <Text style={styles.courseDuration}>⏱️ {item.duration} • {item.lessons} lessons</Text>
      
      <Text style={styles.courseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.courseFooter}>
        <Text style={styles.coursePrice}>
          {item.price === 0 ? 
            (language === 'mr' ? 'मोफत' : (language === 'hi' ? 'मुफ्त' : 'Free')) : 
            `₹${item.price}`
          }
        </Text>
        {item.certificate && (
          <View style={styles.certificateBadge}>
            <Ionicons name="ribbon" size={14} color="#4CAF50" />
            <Text style={styles.certificateText}>Certificate</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'mr' ? 'शोधा...' : (language === 'hi' ? 'खोजें...' : 'Search...')}
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
  );

  const renderJobsTab = () => (
    <View style={styles.tabContent}>
      {renderSearchAndFilters()}
      <FlatList
        data={filterJobs()}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {language === 'mr' ? 'नोकऱ्या उपलब्ध नाहीत' : (language === 'hi' ? 'कोई नौकरी उपलब्ध नहीं' : 'No jobs available')}
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      {renderSearchAndFilters()}
      <FlatList
        data={filterCourses()}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {language === 'mr' ? 'कोर्स उपलब्ध नाहीत' : (language === 'hi' ? 'कोई कोर्स उपलब्ध नहीं' : 'No courses available')}
            </Text>
          </View>
        }
      />
      
      {/* AI Chat Button */}
      <TouchableOpacity style={styles.aiChatButton} onPress={() => setShowAIChat(true)}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
        <Text style={styles.aiChatButtonText}>AI Career Coach</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResumeTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.resumeContainer}>
        <Text style={styles.resumeTitle}>
          {language === 'mr' ? 'तुमचा बायो डेटा तयार करा' : (language === 'hi' ? 'अपना रिज्यूमे बनाएं' : 'Build Your Resume')}
        </Text>
        
        <TouchableOpacity style={styles.resumeButton}>
          <Ionicons name="document-text" size={24} color="#FF6B35" />
          <Text style={styles.resumeButtonText}>
            {language === 'mr' ? 'नवीन बायो डेटा' : (language === 'hi' ? 'नया रिज्यूमे' : 'New Resume')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resumeButton}>
          <Ionicons name="cloud-upload" size={24} color="#FF6B35" />
          <Text style={styles.resumeButtonText}>
            {language === 'mr' ? 'बायो डेटा अपलोड करा' : (language === 'hi' ? 'रिज्यूमे अपलोड करें' : 'Upload Resume')}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.resumeTips}>
          <Text style={styles.resumeTipsTitle}>
            {language === 'mr' ? 'बायो डेटा टिप्स' : (language === 'hi' ? 'रिज्यूमे टिप्स' : 'Resume Tips')}
          </Text>
          <Text style={styles.resumeTip}>
            • {language === 'mr' ? 'स्पष्ट आणि संक्षिप्त लिहा' : (language === 'hi' ? 'स्पष्ट और संक्षिप्त लिखें' : 'Keep it clear and concise')}
          </Text>
          <Text style={styles.resumeTip}>
            • {language === 'mr' ? 'कौशल्ये हायलाइट करा' : (language === 'hi' ? 'कौशल हाइलाइट करें' : 'Highlight your skills')}
          </Text>
          <Text style={styles.resumeTip}>
            • {language === 'mr' ? 'संपर्क तपशील वगळू नका' : (language === 'hi' ? 'संपर्क विवरण न भूलें' : "Don't forget contact details")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'mr' ? 'रोजगार आणि कौशल्ये' : (language === 'hi' ? 'रोजगार और कौशल' : 'Employment & Skills')}
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'jobs' && styles.tabButtonActive]}
          onPress={() => setActiveTab('jobs')}
        >
          <Ionicons name="briefcase" size={20} color={activeTab === 'jobs' ? '#FFFFFF' : '#FF6B35'} />
          <Text style={[styles.tabButtonText, activeTab === 'jobs' && styles.tabButtonTextActive]}>
            {language === 'mr' ? 'नोकऱ्या' : (language === 'hi' ? 'नौकरियां' : 'Jobs')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'skills' && styles.tabButtonActive]}
          onPress={() => setActiveTab('skills')}
        >
          <Ionicons name="school" size={20} color={activeTab === 'skills' ? '#FFFFFF' : '#FF6B35'} />
          <Text style={[styles.tabButtonText, activeTab === 'skills' && styles.tabButtonTextActive]}>
            {language === 'mr' ? 'कौशल्ये' : (language === 'hi' ? 'कौशल' : 'Skills')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'resume' && styles.tabButtonActive]}
          onPress={() => setActiveTab('resume')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'resume' ? '#FFFFFF' : '#FF6B35'} />
          <Text style={[styles.tabButtonText, activeTab === 'resume' && styles.tabButtonTextActive]}>
            {language === 'mr' ? 'बायो डेटा' : (language === 'hi' ? 'रिज्यूमे' : 'Resume')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'jobs' && renderJobsTab()}
      {activeTab === 'skills' && renderSkillsTab()}
      {activeTab === 'resume' && renderResumeTab()}

      {/* Job Details Modal */}
      <Modal visible={showJobModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedJob?.title}</Text>
              <TouchableOpacity onPress={() => setShowJobModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.jobDetailCompany}>{selectedJob?.company}</Text>
              <Text style={styles.jobDetailLocation}>📍 {selectedJob?.location}</Text>
              <Text style={styles.jobDetailSalary}>💰 {selectedJob?.salary}</Text>
              
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'वर्णन' : (language === 'hi' ? 'विवरण' : 'Description')}
              </Text>
              <Text style={styles.sectionContent}>{selectedJob?.description}</Text>
              
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'आवश्यकता' : (language === 'hi' ? 'आवश्यकताएं' : 'Requirements')}
              </Text>
              {selectedJob?.requirements.map((req, index) => (
                <Text key={index} style={styles.listItem}>• {req}</Text>
              ))}
              
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'फायदे' : (language === 'hi' ? 'लाभ' : 'Benefits')}
              </Text>
              {selectedJob?.benefits.map((benefit, index) => (
                <Text key={index} style={styles.listItem}>• {benefit}</Text>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => selectedJob && applyForJob(selectedJob._id)}
            >
              <Text style={styles.applyButtonText}>
                {language === 'mr' ? 'अर्ज करा' : (language === 'hi' ? 'आवेदन करें' : 'Apply Now')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Course Details Modal */}
      <Modal visible={showCourseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCourse?.title}</Text>
              <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.courseDetailInstructor}>👨‍🏫 {selectedCourse?.instructor}</Text>
              <Text style={styles.courseDetailDuration}>⏱️ {selectedCourse?.duration}</Text>
              <Text style={styles.courseDetailLevel}>📊 {selectedCourse?.level}</Text>
              
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'वर्णन' : (language === 'hi' ? 'विवरण' : 'Description')}
              </Text>
              <Text style={styles.sectionContent}>{selectedCourse?.description}</Text>
              
              <View style={styles.courseStats}>
                <Text style={styles.courseStat}>{selectedCourse?.lessons} lessons</Text>
                <Text style={styles.courseStat}>
                  ⭐ {selectedCourse?.rating}/5
                </Text>
                {selectedCourse?.certificate && (
                  <Text style={styles.courseStat}>🏆 Certificate</Text>
                )}
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={() => selectedCourse && enrollInCourse(selectedCourse._id)}
            >
              <Text style={styles.enrollButtonText}>
                {selectedCourse?.price === 0 ? 
                  (language === 'mr' ? 'मोफत नोंदणी' : (language === 'hi' ? 'मुफ्त नामांकन' : 'Enroll Free')) :
                  `₹${selectedCourse?.price} - ${language === 'mr' ? 'नोंदणी' : (language === 'hi' ? 'नामांकन' : 'Enroll')}`
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Chat Modal */}
      <Modal visible={showAIChat} animationType="slide">
        <SafeAreaView style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>AI Career Coach</Text>
            <TouchableOpacity onPress={() => setShowAIChat(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.chatMessages}>
            {chatMessages.map((message, index) => (
              <View key={index} style={[
                styles.chatMessage,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.chatMessageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatTextInput}
              placeholder={language === 'mr' ? 'तुमचा प्रश्न टाका...' : (language === 'hi' ? 'अपना प्रश्न लिखें...' : 'Type your question...')}
              value={chatInput}
              onChangeText={setChatInput}
              multiline
            />
            <TouchableOpacity style={styles.chatSendButton} onPress={sendChatMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FF6B35',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 4,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
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
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: '#888',
  },
  womenFriendlyBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobSalary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  jobType: {
    fontSize: 14,
    color: '#666',
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseDuration: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  certificateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certificateText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  aiChatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiChatButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  resumeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    margin: 4,
  },
  resumeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  resumeButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 12,
  },
  resumeTips: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  resumeTipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resumeTip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  jobDetailCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  jobDetailLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  jobDetailSalary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  courseDetailInstructor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  courseDetailDuration: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  courseDetailLevel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  courseStat: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  enrollButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chatMessages: {
    flex: 1,
    padding: 20,
  },
  chatMessage: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#FF6B35',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  chatMessageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  chatSendButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: 'center',
  },
});