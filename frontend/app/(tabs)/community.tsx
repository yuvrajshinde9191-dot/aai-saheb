import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
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

const communityGroups = [
  {
    id: 1,
    name: 'महिला उद्योजक',
    nameEn: 'Women Entrepreneurs',
    members: 1250,
    icon: 'business',
    color: '#FF6B35',
    description: 'व्यवसाय सुरू करणाऱ्या महिलांसाठी',
    category: 'business',
  },
  {
    id: 2,
    name: 'माता समूह',
    nameEn: 'Mothers Group',
    members: 2100,
    icon: 'heart',
    color: '#E91E63',
    description: 'माता आणि बालपणीच्या काळजी',
    category: 'family',
  },
  {
    id: 3,
    name: 'करिअर मार्गदर्शन',
    nameEn: 'Career Guidance',
    members: 980,
    icon: 'school',
    color: '#2196F3',
    description: 'करिअर आणि शिक्षणाचे मार्गदर्शन',
    category: 'career',
  },
  {
    id: 4,
    name: 'सुरक्षा जागरूकता',
    nameEn: 'Safety Awareness',
    members: 3200,
    icon: 'shield',
    color: '#4CAF50',
    description: 'महिलांची सुरक्षा आणि अधिकार',
    category: 'safety',
  },
];

const availableTags = [
  'करिअर', 'मातृत्व', 'आरोग्य', 'शिक्षण', 'सुरक्षा', 'व्यवसाय', 'कायदा', 'तंत्रज्ञान'
];

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    loadUserToken();
    fetchPosts();
  }, []);

  const loadUserToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    setUserToken(token);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(`${BACKEND_URL}/api/community/posts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setPosts(response.data.posts || []);
      } else {
        // Set sample posts for demo
        setPosts([
          {
            id: '1',
            user_name: 'प्रिया शर्मा',
            content: 'आज मी नवीन नोकरी मिळवली आहे! खूप आनंद झाला. सर्व बहिणींना धन्यवाद जे मला प्रेरणा दिली. 💪 #करिअर #यश',
            contentEn: 'I got a new job today! Very happy. Thanks to all sisters who inspired me.',
            created_at: '2025-01-25T10:30:00Z',
            likes_count: 45,
            comments_count: 12,
            is_anonymous: false,
            tags: ['करिअर', 'यश'],
            isLiked: false,
          },
          {
            id: '2',
            user_name: 'गुमनाम वापरकर्ता',
            content: 'माझ्या मुलीच्या शिक्षणाबद्दल चिंता आहे. कोणी चांगल्या शाळेबद्दल सल्ला देऊ शकता का? 🙏 #शिक्षण #मदत',
            contentEn: 'Worried about my daughter\'s education. Can anyone suggest good schools?',
            created_at: '2025-01-25T08:15:00Z',
            likes_count: 28,
            comments_count: 35,
            is_anonymous: true,
            tags: ['शिक्षण', 'मदत'],
            isLiked: true,
          },
          {
            id: '3',
            user_name: 'अनीता देशपांडे',
            content: 'आज महिला दिनाच्या कार्यक्रमात सहभागी झाले. खूप प्रेरणादायक वक्तव्ये ऐकली. आपण सर्व मिळून बदल घडवू शकतो! ✨ #महिलाशक्ती',
            contentEn: 'Participated in Women\'s Day program today. Heard very inspiring speeches.',
            created_at: '2025-01-24T16:45:00Z',
            likes_count: 67,
            comments_count: 23,
            is_anonymous: false,
            tags: ['महिलाशक्ती'],
            isLiked: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      Alert.alert('त्रुटी / Error', 'कृपया पोस्ट लिहा / Please write your post');
      return;
    }

    if (!userToken) {
      Alert.alert(
        'प्रवेश आवश्यक / Login Required',
        'पोस्ट करण्यासाठी कृपया प्रवेश करा / Please login to create posts',
        [
          { text: 'रद्द करा / Cancel', style: 'cancel' },
          { text: 'प्रवेश करा / Login', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/community/posts`,
        {
          content: newPost.trim(),
          tags: selectedTags,
          is_anonymous: isAnonymous,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.data.success) {
        setShowCreatePost(false);
        setNewPost('');
        setSelectedTags([]);
        setIsAnonymous(false);
        fetchPosts();
        
        Alert.alert(
          'यशस्वी / Success',
          'पोस्ट यशस्वीरित्या तयार केली गेली / Post created successfully'
        );
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('त्रुटी / Error', 'पोस्ट तयार करण्यात अयशस्वी / Failed to create post');
    }
  };

  const handleLikePost = (postId: string) => {
    if (!userToken) {
      Alert.alert('प्रवेश आवश्यक / Login Required', 'लाइक करण्यासाठी कृपया प्रवेश करा / Please login to like posts');
      return;
    }

    // Update local state optimistically
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              likes_count: post.isLiked ? post.likes_count - 1 : post.likes_count + 1, 
              isLiked: !post.isLiked 
            }
          : post
      )
    );
  };

  const handleJoinGroup = (groupId: number) => {
    const group = communityGroups.find(g => g.id === groupId);
    if (!group) return;

    if (!userToken) {
      Alert.alert(
        'प्रवेश आवश्यक / Login Required',
        'समूहात सामील होण्यासाठी कृपया प्रवेश करा / Please login to join groups',
        [
          { text: 'रद्द करा / Cancel', style: 'cancel' },
          { text: 'प्रवेश करा / Login', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    Alert.alert(
      'समूहात सामील व्हा / Join Group',
      `तुम्हाला "${group.name}" या समूहात सामील व्हायचे आहे का? / Do you want to join "${group.nameEn}" group?`,
      [
        { text: 'रद्द करा / Cancel', style: 'cancel' },
        { 
          text: 'सामील व्हा / Join', 
          onPress: () => {
            Alert.alert(
              'यशस्वी / Success', 
              `तुम्ही "${group.name}" समूहात यशस्वीरित्या सामील झाला आहात / You have successfully joined "${group.nameEn}" group`
            );
          }
        },
      ]
    );
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'आत्ताच / Just now';
    if (diffInHours < 24) return `${diffInHours} तास पूर्वी / ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} दिवस पूर्वी / ${diffInDays}d ago`;
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, item.is_anonymous && styles.anonymousAvatar]}>
            <Ionicons 
              name={item.is_anonymous ? "help" : "person"} 
              size={20} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {item.is_anonymous ? 'गुमनाम वापरकर्ता / Anonymous User' : item.user_name}
            </Text>
            <Text style={styles.postTime}>
              {getTimeAgo(item.created_at)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={[styles.actionButton, item.isLiked && styles.likedButton]}
          onPress={() => handleLikePost(item.id)}
        >
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={item.isLiked ? "#FF4444" : "#666"}
          />
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>शेअर / Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroup = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.groupCard} onPress={() => handleJoinGroup(item.id)}>
      <View style={[styles.groupIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="#FFFFFF" />
      </View>
      
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupNameEn}>{item.nameEn}</Text>
        <Text style={styles.groupDescription}>{item.description}</Text>
        
        <View style={styles.groupStats}>
          <Ionicons name="people" size={14} color="#666" />
          <Text style={styles.groupMembers}>{item.members} सदस्य / members</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinGroup(item.id)}
      >
        <Text style={styles.joinButtonText}>सामील व्हा</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCreatePostModal = () => (
    <Modal
      visible={showCreatePost}
      animationType="slide" 
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>नवीन पोस्ट / New Post</Text>
            <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
              <Text style={styles.postButtonText}>पोस्ट करा</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.postInput}
              placeholder="तुमचे विचार शेअर करा... / Share your thoughts..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              value={newPost}
              onChangeText={setNewPost}
              textAlignVertical="top"
            />

            <View style={styles.anonymousContainer}>
              <TouchableOpacity
                style={styles.anonymousToggle}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <Ionicons
                  name={isAnonymous ? "checkbox" : "checkbox-outline"}
                  size={20}
                  color="#FF6B35"
                />
                <Text style={styles.anonymousText}>
                  गुमनामपणे पोस्ट करा / Post anonymously
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.tagsTitle}>टॅग जोडा / Add Tags</Text>
              <View style={styles.tagsGrid}>
                {availableTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      selectedTags.includes(tag) && styles.selectedTagOption
                    ]}
                    onPress={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Text style={[
                      styles.tagOptionText,
                      selectedTags.includes(tag) && styles.selectedTagText
                    ]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <Text style={styles.headerTitle}>समुदाय / Community</Text>
        <Text style={styles.headerSubtitle}>
          एकत्र येऊ, बळकट होऊ / Come together, grow stronger
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons
            name="chatbubbles"
            size={20}
            color={activeTab === 'posts' ? '#FF6B35' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            पोस्ट्स / Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'groups' ? '#FF6B35' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            समूह / Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'posts' ? (
          <>
            {/* Create Post Button */}
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => setShowCreatePost(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FF6B35" />
              <Text style={styles.createPostText}>
                तुमचे विचार शेअर करा... / Share your thoughts...
              </Text>
            </TouchableOpacity>

            {/* Posts List */}
            <View style={styles.listContainer}>
              <FlashList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                estimatedItemSize={200}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#E0E0E0" />
                    <Text style={styles.emptyText}>अजून कोणतेही पोस्ट्स नाहीत / No posts yet</Text>
                  </View>
                }
              />
            </View>
          </>
        ) : (
          /* Groups List */
          <View style={styles.listContainer}>
            <FlashList
              data={communityGroups}
              renderItem={renderGroup}
              keyExtractor={(item) => item.id.toString()}
              estimatedItemSize={120}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Text style={styles.groupsHeader}>
                  समुदायिक समूह / Community Groups
                </Text>
              }
            />
          </View>
        )}
      </View>

      {renderCreatePostModal()}
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
    paddingTop: 16,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  createPostText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  anonymousAvatar: {
    backgroundColor: '#666',
  },
  userDetails: {},
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#FFF3F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  likedButton: {
    // No additional styles needed, handled by icon color
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  likedText: {
    color: '#FF4444',
  },
  groupsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 16,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  groupNameEn: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMembers: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
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
  postButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  postInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 20,
  },
  anonymousContainer: {
    marginBottom: 20,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagOption: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTagOption: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
});