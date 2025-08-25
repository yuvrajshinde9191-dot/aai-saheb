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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  },
];

export default function EmploymentScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'jobs' | 'skills'>('jobs');

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BACKEND_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        },
      });

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to fetch jobs');
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
    Alert.alert(
      job.title,
      `${job.company}\n\n${job.description}`,
      [
        { text: 'रद्द करा / Cancel', style: 'cancel' },
        { text: 'अर्ज करा / Apply', onPress: () => handleApply(job) },
      ]
    );
  };

  const handleApply = (job: any) => {
    Alert.alert(
      'अर्ज यशस्वी / Application Successful',
      `तुमचा अर्ज ${job.title} पदासाठी पाठवला गेला आहे. / Your application for ${job.title} has been submitted.`
    );
  };

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.jobCard} onPress={() => handleJobPress(item)}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
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
        <Text style={styles.salaryText}>{item.salary_range || 'वेतन चर्चेसाध्य'}</Text>
        <TouchableOpacity style={styles.applyButton} onPress={() => handleApply(item)}>
          <Text style={styles.applyButtonText}>अर्ज करा / Apply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSkillCourse = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.courseCard}>
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
      
      <TouchableOpacity style={styles.enrollButton}>
        <Text style={styles.enrollButtonText}>नोंदणी करा / Enroll</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderJobsTab = () => (
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
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>श्रेणी / Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
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
                size={20}
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
      </View>

      {/* Jobs List */}
      <View style={styles.jobsContainer}>
        <Text style={styles.sectionTitle}>
          नोकरी संधी / Job Opportunities ({jobs.length})
        </Text>
        {jobs.length > 0 ? (
          <FlashList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            estimatedItemSize={150}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>कोणत्या नोकरी सापडल्या नाहीत / No jobs found</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderSkillsTab = () => (
    <>
      {/* Skills Header */}
      <View style={styles.skillsHeader}>
        <Text style={styles.sectionTitle}>कौशल्य विकास / Skill Development</Text>
        <Text style={styles.skillsSubtitle}>
          नवीन कौशल्ये शिका आणि करिअर वाढवा / Learn new skills and advance your career
        </Text>
      </View>

      {/* Featured Courses */}
      <View style={styles.coursesContainer}>
        <Text style={styles.sectionTitle}>
          वैशिष्ट्यीकृत अभ्यासक्रम / Featured Courses
        </Text>
        <FlashList
          data={skillCourses}
          renderItem={renderSkillCourse}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={200}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
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
          <Ionicons 
            name="briefcase" 
            size={20} 
            color={activeTab === 'jobs' ? '#FF6B35' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>
            नोकरी / Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'skills' && styles.activeTab]}
          onPress={() => setActiveTab('skills')}
        >
          <Ionicons 
            name="school" 
            size={20} 
            color={activeTab === 'skills' ? '#FF6B35' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>
            कौशल्य / Skills
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'jobs' ? renderJobsTab() : renderSkillsTab()}
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
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCategoryButton: {
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  jobsContainer: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
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
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  skillsHeader: {
    marginVertical: 16,
  },
  skillsSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  coursesContainer: {
    flex: 1,
    marginBottom: 32,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseTitleEn: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  courseDuration: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    marginLeft: 4,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  enrollButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});