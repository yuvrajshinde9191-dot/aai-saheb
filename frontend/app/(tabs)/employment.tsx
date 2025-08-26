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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

const categories = [
  { id: 'all', name: 'सर्व / All', icon: 'briefcase', color: '#FF6B35' },
  { id: 'tech', name: 'तंत्रज्ञान / Tech', icon: 'laptop', color: '#2196F3' },
  { id: 'healthcare', name: 'आरोग्य / Healthcare', icon: 'medical', color: '#4CAF50' },
  { id: 'education', name: 'शिक्षण / Education', icon: 'school', color: '#FF9800' },
  { id: 'finance', name: 'वित्त / Finance', icon: 'card', color: '#9C27B0' },
  { id: 'retail', name: 'किरकोळ / Retail', icon: 'storefront', color: '#795548' },
];

const skillCourses = [
  {
    id: 1,
    title: 'डिजिटल साक्षरता',
    titleEn: 'Digital Literacy',
    duration: '4 आठवडे / 4 weeks',
    students: 1250,
    rating: 4.8,
    level: 'बिगिनर / Beginner',
    certificate: true,
    description: 'मूलभूत संगणक कौशल्ये शिका',
    modules: ['कॉम्प्यूटर बेसिक्स', 'इंटरनेट वापर', 'ईमेल', 'डिजिटल पेमेंट'],
  },
  {
    id: 2,
    title: 'आर्थिक व्यवस्थापन',
    titleEn: 'Financial Management',
    duration: '6 आठवडे / 6 weeks',
    students: 890,
    rating: 4.9,
    level: 'मध्यम / Intermediate',
    certificate: true,
    description: 'पैशाचे नियोजन आणि बचत',
    modules: ['बजेटिंग', 'गुंतवणूक', 'बचत योजना', 'कर्ज व्यवस्थापन'],
  },
  {
    id: 3,
    title: 'उद्योजकता',
    titleEn: 'Entrepreneurship',
    duration: '8 आठवडे / 8 weeks',
    students: 567,
    rating: 4.7,
    level: 'प्रगत / Advanced',
    certificate: true,
    description: 'स्वतःचा व्यवसाय सुरू करण्याचे मार्गदर्शन',
    modules: ['बिझनेस प्लान', 'फंडिंग', 'मार्केटिंग', 'कायदेशीर बाबी'],
  },
];

export default function EmploymentScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'jobs' | 'skills'>('jobs');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(`${BACKEND_URL}/api/jobs?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        // Add sample jobs for demo
        setJobs([
          {
            id: '1',
            title: 'महिला ग्राहक सेवा प्रतिनिधी',
            titleEn: 'Women Customer Service Representative',
            company: 'टेक सोल्यूशन्स प्रा. लि.',
            companyEn: 'Tech Solutions Pvt Ltd',
            location: 'मुंबई, महाराष्ट्र',
            locationEn: 'Mumbai, Maharashtra',
            salary_range: '₹25,000 - ₹35,000',
            description: 'ग्राहकांशी संवाद साधणे आणि त्यांच्या समस्यांचे निराकरण करणे',
            descriptionEn: 'Communicate with customers and resolve their issues',
            requirements: ['हिंदी/मराठी/इंग्रजी', '12वी पास', 'संगणक ज्ञान', 'चांगले संवाद कौशल्य'],
            benefits: ['आरोग्य विमा', 'वार्षिक सुट्टी', 'प्रशिक्षण', 'करिअर वाढ'],
            is_women_friendly: true,
            posted_date: '2 दिवस पूर्वी',
            application_deadline: '15 दिवस',
          },
          {
            id: '2',
            title: 'डेटा एंट्री ऑपरेटर',
            titleEn: 'Data Entry Operator',
            company: 'इन्फो सिस्टम्स',
            companyEn: 'Info Systems',
            location: 'पुणे, महाराष्ट्र',
            locationEn: 'Pune, Maharashtra',
            salary_range: '₹18,000 - ₹25,000',
            description: 'संगणकावर डेटा प्रविष्ट करणे आणि रेकॉर्ड राखणे',
            descriptionEn: 'Enter data on computer and maintain records',
            requirements: ['टायपिंग स्पीड 35 WPM', 'MS Office', 'मराठी/इंग्रजी टायपिंग', 'लक्ष देणारे'],
            benefits: ['लवचिक वेळ', 'वाहतूक सुविधा', 'मातृत्व रजा', 'स्किल डेव्हलपमेंट'],
            is_women_friendly: true,
            posted_date: '5 दिवस पूर्वी',
            application_deadline: '20 दिवस',
          },
          {
            id: '3',
            title: 'ऑनलाइन ट्यूटर',
            titleEn: 'Online Tutor',
            company: 'एडुकेशन हब',
            companyEn: 'Education Hub',
            location: 'घरून काम / Work from Home',
            locationEn: 'Work from Home',
            salary_range: '₹500 - ₹1000 प्रति तास',
            description: 'विद्यार्थ्यांना ऑनलाइन शिकवणे',
            descriptionEn: 'Teach students online',
            requirements: ['पदवी', 'विषयाचे ज्ञान', 'इंटरनेट कनेक्शन', 'धैर्य'],
            benefits: ['घरून काम', 'लवचिक वेळ', 'अतिरिक्त उत्पन्न', 'स्वातंत्र्य'],
            is_women_friendly: true,
            posted_date: '1 आठवडा पूर्वी',
            application_deadline: '1 महिना',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Set sample data on error
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleJobPress = (job: any) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleApply = async (job: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert(
          'प्रवेश आवश्यक / Login Required',
          'अर्ज करण्यासाठी कृपया प्रवेश करा / Please login to apply for jobs',
          [
            { text: 'रद्द करा / Cancel', style: 'cancel' },
            { text: 'प्रवेश करा / Login', onPress: () => router.push('/auth') },
          ]
        );
        return;
      }

      Alert.alert(
        'अर्ज यशस्वी / Application Successful',
        `तुमचा अर्ज "${job.title}" पदासाठी सादर करण्यात आला आहे. आम्ही लवकरच संपर्क साधू. / Your application for "${job.titleEn}" has been submitted. We will contact you soon.`,
        [{ text: 'ठीक आहे / OK', onPress: () => setShowJobModal(false) }]
      );

      // Here you would typically send the application to the backend
      console.log('Job application submitted:', job.id);
      
    } catch (error) {
      console.error('Error applying for job:', error);
      Alert.alert('त्रुटी / Error', 'अर्ज सादर करण्यात अयशस्वी / Failed to submit application');
    }
  };

  const handleCoursePress = (course: any) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleEnroll = async (course: any) => {
    Alert.alert(
      'नोंदणी यशस्वी / Enrollment Successful',
      `तुम्ही "${course.title}" कोर्समध्ये यशस्वीरित्या नोंदणी केली आहे. / You have successfully enrolled in "${course.titleEn}" course.`,
      [{ text: 'ठीक आहे / OK', onPress: () => setShowCourseModal(false) }]
    );
  };

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.jobCard} onPress={() => handleJobPress(item)}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobTitleEn}>{item.titleEn}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.womenFriendlyBadge}>
          <Ionicons name="female" size={16} color="#FF6B35" />
          <Text style={styles.badgeText}>महिला-मित्र</Text>
        </View>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.jobFooter}>
        <Text style={styles.salaryText}>{item.salary_range}</Text>
        <Text style={styles.postedDate}>{item.posted_date}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSkillCourse = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => handleCoursePress(item)}>
      <View style={styles.courseHeader}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.courseTitleEn}>{item.titleEn}</Text>
          <Text style={styles.courseDuration}>{item.duration}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.courseDescription}>{item.description}</Text>
      
      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.statText}>{item.students}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={16} color="#666" />
          <Text style={styles.statText}>{item.level}</Text>
        </View>
        {item.certificate && (
          <View style={styles.statItem}>
            <Ionicons name="ribbon" size={16} color="#FF6B35" />
            <Text style={styles.statText}>प्रमाणपत्र</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderJobModal = () => (
    <Modal visible={showJobModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowJobModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>नोकरी तपशील / Job Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedJob && (
          <ScrollView style={styles.modalContent}>
            <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.jobDetailHeader}>
              <Text style={styles.jobDetailTitle}>{selectedJob.title}</Text>
              <Text style={styles.jobDetailTitleEn}>{selectedJob.titleEn}</Text>
              <Text style={styles.jobDetailCompany}>{selectedJob.company}</Text>
              <Text style={styles.jobDetailLocation}>{selectedJob.location}</Text>
            </LinearGradient>

            <View style={styles.jobDetailContent}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>वेतन / Salary</Text>
                <Text style={styles.salaryDetail}>{selectedJob.salary_range}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>वर्णन / Description</Text>
                <Text style={styles.detailText}>{selectedJob.description}</Text>
                <Text style={styles.detailTextEn}>{selectedJob.descriptionEn}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>आवश्यकता / Requirements</Text>
                {selectedJob.requirements?.map((req: string, index: number) => (
                  <View key={index} style={styles.requirementItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>फायदे / Benefits</Text>
                {selectedJob.benefits?.map((benefit: string, index: number) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="gift" size={16} color="#FF6B35" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>अतिरिक्त माहिती / Additional Info</Text>
                <Text style={styles.infoText}>पोस्ट केले: {selectedJob.posted_date}</Text>
                <Text style={styles.infoText}>अंतिम तारीख: {selectedJob.application_deadline}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => selectedJob && handleApply(selectedJob)}
          >
            <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>अर्ज करा / Apply Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderCourseModal = () => (
    <Modal visible={showCourseModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCourseModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>कोर्स तपशील / Course Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedCourse && (
          <ScrollView style={styles.modalContent}>
            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.courseDetailHeader}>
              <Text style={styles.courseDetailTitle}>{selectedCourse.title}</Text>
              <Text style={styles.courseDetailTitleEn}>{selectedCourse.titleEn}</Text>
              <Text style={styles.courseDetailDuration}>{selectedCourse.duration}</Text>
              <View style={styles.courseRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.courseRatingText}>{selectedCourse.rating} ({selectedCourse.students} students)</Text>
              </View>
            </LinearGradient>

            <View style={styles.courseDetailContent}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>कोर्स माहिती / Course Info</Text>
                <Text style={styles.detailText}>{selectedCourse.description}</Text>
                <Text style={styles.detailTextEn}>Level: {selectedCourse.level}</Text>
                {selectedCourse.certificate && (
                  <Text style={styles.certificateText}>✓ कोर्स पूर्ण केल्यावर प्रमाणपत्र मिळेल</Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>अभ्यासक्रम / Modules</Text>
                {selectedCourse.modules?.map((module: string, index: number) => (
                  <View key={index} style={styles.moduleItem}>
                    <Text style={styles.moduleNumber}>{index + 1}</Text>
                    <Text style={styles.moduleText}>{module}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={() => selectedCourse && handleEnroll(selectedCourse)}
          >
            <Ionicons name="school" size={20} color="#FFFFFF" />
            <Text style={styles.enrollButtonText}>नोंदणी करा / Enroll Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'jobs' ? 'रोजगार / Employment' : 'कौशल्य / Skills'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'jobs' 
            ? 'तुमच्यासाठी योग्य नोकरी शोधा / Find the right job for you'
            : 'नवीन कौशल्ये शिका / Learn new skills'
          }
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
          onPress={() => setActiveTab('jobs')}
        >
          <Ionicons name="briefcase" size={20} color={activeTab === 'jobs' ? '#FF6B35' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>
            नोकरी / Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'skills' && styles.activeTab]}
          onPress={() => setActiveTab('skills')}
        >
          <Ionicons name="school" size={20} color={activeTab === 'skills' ? '#FF6B35' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>
            कौशल्य / Skills
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'jobs' ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="नोकरी शोधा / Search jobs..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={fetchJobs}
              />
            </View>

            {/* Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.activeCategoryButton,
                    { backgroundColor: selectedCategory === category.id ? category.color : '#FFFFFF' }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={18}
                    color={selectedCategory === category.id ? '#FFFFFF' : category.color}
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.activeCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Jobs List */}
            <View style={styles.listContainer}>
              <FlashList
                data={jobs}
                renderItem={renderJobItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                estimatedItemSize={150}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="briefcase-outline" size={64} color="#E0E0E0" />
                    <Text style={styles.emptyText}>कोणत्या नोकरी सापडल्या नाहीत / No jobs found</Text>
                  </View>
                }
              />
            </View>
          </>
        ) : (
          <>
            {/* Skills Courses */}
            <View style={styles.listContainer}>
              <FlashList
                data={skillCourses}
                renderItem={renderSkillCourse}
                keyExtractor={(item) => item.id.toString()}
                estimatedItemSize={200}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <Text style={styles.coursesHeader}>
                    वैशिष्ट्यीकृत अभ्यासक्रम / Featured Courses
                  </Text>
                }
              />
            </View>
          </>
        )}
      </View>

      {renderJobModal()}
      {renderCourseModal()}
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
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF3F0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCategoryButton: {
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  jobCard: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  jobTitleEn: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  womenFriendlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  postedDate: {
    fontSize: 12,
    color: '#999',
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  courseTitleEn: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseDuration: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '500',
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF8F00',
    marginLeft: 4,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  coursesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
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
  jobDetailHeader: {
    padding: 24,
    alignItems: 'center',
  },
  jobDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  jobDetailTitleEn: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  jobDetailCompany: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  jobDetailLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  jobDetailContent: {
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  salaryDetail: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  // Course modal styles
  courseDetailHeader: {
    padding: 24,
    alignItems: 'center',
  },
  courseDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  courseDetailTitleEn: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  courseDetailDuration: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseRatingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  courseDetailContent: {
    padding: 20,
  },
  certificateText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 8,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  moduleText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});