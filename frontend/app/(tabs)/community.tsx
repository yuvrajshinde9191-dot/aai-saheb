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
  Image,
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

interface Post {
  _id: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  isAnonymous: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  isLiked: boolean;
  group?: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  isPrivate: boolean;
  coverImage?: string;
  isJoined: boolean;
}

interface Poll {
  _id: string;
  question: string;
  options: Array<{
    text: string;
    votes: number;
  }>;
  totalVotes: number;
  endDate: string;
  userVoted: boolean;
  userVoteIndex?: number;
}

export default function CommunityScreen() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'polls'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const availableTags = [
    { id: 'safety', name: language === 'mr' ? 'सुरक्षा' : (language === 'hi' ? 'सुरक्षा' : 'Safety') },
    { id: 'employment', name: language === 'mr' ? 'रोजगार' : (language === 'hi' ? 'रोजगार' : 'Employment') },
    { id: 'health', name: language === 'mr' ? 'आरोग्य' : (language === 'hi' ? 'स्वास्थ्य' : 'Health') },
    { id: 'education', name: language === 'mr' ? 'शिक्षण' : (language === 'hi' ? 'शिक्षा' : 'Education') },
    { id: 'legal', name: language === 'mr' ? 'कायदेशीर' : (language === 'hi' ? 'कानूनी' : 'Legal') },
    { id: 'support', name: language === 'mr' ? 'सहाय्य' : (language === 'hi' ? 'सहायता' : 'Support') },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsResponse, groupsResponse, pollsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/community/posts`),
        axios.get(`${API_BASE_URL}/api/community/groups`),
        axios.get(`${API_BASE_URL}/api/community/polls`),
      ]);
      
      setPosts(postsResponse.data.posts || []);
      setGroups(groupsResponse.data.groups || []);
      setPolls(pollsResponse.data.polls || []);
    } catch (error) {
      console.error('Error loading community data:', error);
      // Load mock data for demonstration
      setPosts(getMockPosts());
      setGroups(getMockGroups());
      setPolls(getMockPolls());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMockPosts = (): Post[] => [
    {
      _id: '1',
      content: language === 'mr' ? 
        'आज नवीन नोकरी मिळाली! सर्व बहिणींना धन्यवाद त्यांच्या प्रेरणेसाठी 🙏' :
        (language === 'hi' ? 
          'आज नई नौकरी मिली! सभी बहनों का धन्यवाद उनकी प्रेरणा के लिए 🙏' :
          'Got a new job today! Thanks to all sisters for their inspiration 🙏'),
      author: {
        name: language === 'mr' ? 'प्रिया शर्मा' : (language === 'hi' ? 'प्रिया शर्मा' : 'Priya Sharma'),
        role: 'Job Seeker',
      },
      likes: 45,
      comments: 12,
      shares: 3,
      tags: ['employment', 'support'],
      isAnonymous: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isLiked: false,
    },
    {
      _id: '2',
      content: language === 'mr' ? 
        'रात्री एकटी फिरताना सुरक्षिततेसाठी काय करावे? कोणी सल्ला देऊ शकाल का?' :
        (language === 'hi' ? 
          'रात में अकेले घूमते समय सुरक्षा के लिए क्या करें? कोई सलाह दे सकते हैं?' :
          'What should I do for safety while walking alone at night? Any advice?'),
      author: {
        name: language === 'mr' ? 'निनावी' : (language === 'hi' ? 'गुमनाम' : 'Anonymous'),
        role: 'Voter',
      },
      likes: 23,
      comments: 18,
      shares: 7,
      tags: ['safety', 'support'],
      isAnonymous: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isLiked: true,
    },
  ];

  const getMockGroups = (): Group[] => [
    {
      _id: '1',
      name: language === 'mr' ? 'महिला उद्योजक' : (language === 'hi' ? 'महिला उद्यमी' : 'Women Entrepreneurs'),
      description: language === 'mr' ? 
        'व्यवसाय सुरू करण्यासाठी आणि वाढवण्यासाठी समुदाय' :
        (language === 'hi' ? 
          'व्यवसाय शुरू करने और बढ़ाने के लिए समुदाय' :
          'Community for starting and growing businesses'),
      members: 1247,
      category: 'business',
      isPrivate: false,
      isJoined: true,
    },
    {
      _id: '2',
      name: language === 'mr' ? 'तंत्रज्ञानातील महिला' : (language === 'hi' ? 'टेक में महिलाएं' : 'Women in Tech'),
      description: language === 'mr' ? 
        'तंत्रज्ञान क्षेत्रातील महिलांसाठी नेटवर्किंग आणि सहाय्य' :
        (language === 'hi' ? 
          'तकनीक क्षेत्र की महिलाओं के लिए नेटवर्किंग और सहायता' :
          'Networking and support for women in technology'),
      members: 892,
      category: 'technology',
      isPrivate: false,
      isJoined: false,
    },
    {
      _id: '3',
      name: language === 'mr' ? 'आरोग्य आणि निरोगी राहणी' : (language === 'hi' ? 'स्वास्थ्य और कल्याण' : 'Health & Wellness'),
      description: language === 'mr' ? 
        'महिलांच्या आरोग्यासाठी माहिती आणि सहाय्य' :
        (language === 'hi' ? 
          'महिलाओं के स्वास्थ्य के लिए जानकारी और सहायता' :
          'Health information and support for women'),
      members: 2156,
      category: 'health',
      isPrivate: false,
      isJoined: true,
    },
  ];

  const getMockPolls = (): Poll[] => [
    {
      _id: '1',
      question: language === 'mr' ? 
        'महिलांसाठी सर्वात महत्त्वाचा मुद्दा कोणता?' :
        (language === 'hi' ? 
          'महिलाओं के लिए सबसे महत्वपूर्ण मुद्दा कौन सा है?' :
          'What is the most important issue for women?'),
      options: [
        { text: language === 'mr' ? 'सुरक्षा' : (language === 'hi' ? 'सुरक्षा' : 'Safety'), votes: 156 },
        { text: language === 'mr' ? 'रोजगार' : (language === 'hi' ? 'रोजगार' : 'Employment'), votes: 98 },
        { text: language === 'mr' ? 'आरोग्य' : (language === 'hi' ? 'स्वास्थ्य' : 'Health'), votes: 87 },
        { text: language === 'mr' ? 'शिक्षण' : (language === 'hi' ? 'शिक्षा' : 'Education'), votes: 72 },
      ],
      totalVotes: 413,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userVoted: false,
    },
  ];

  const createPost = async () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please enter post content');
      return;
    }

    try {
      const token = await getStoredToken();
      const newPost = {
        content: postContent,
        tags: selectedTags,
        isAnonymous: isAnonymous,
        userId: user?._id,
      };

      await axios.post(`${API_BASE_URL}/api/community/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPostContent('');
      setSelectedTags([]);
      setIsAnonymous(false);
      setShowCreatePost(false);
      await loadData();
      
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'पोस्ट यशस्वीरीत्या तयार झाली' : (language === 'hi' ? 'पोस्ट सफलतापूर्वक बनाई गई' : 'Post created successfully')
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const createPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2) {
      Alert.alert('Error', 'Please enter question and at least 2 options');
      return;
    }

    try {
      const token = await getStoredToken();
      const newPoll = {
        question: pollQuestion,
        options: pollOptions.filter(opt => opt.trim()).map(opt => ({ text: opt, votes: 0 })),
        userId: user?._id,
      };

      await axios.post(`${API_BASE_URL}/api/community/polls`, newPoll, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPollQuestion('');
      setPollOptions(['', '']);
      setShowCreatePoll(false);
      await loadData();
      
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'मतदान यशस्वीरीत्या तयार झाले' : (language === 'hi' ? 'पोल सफलतापूर्वक बनाया गया' : 'Poll created successfully')
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create poll. Please try again.');
    }
  };

  const likePost = async (postId: string) => {
    try {
      const token = await getStoredToken();
      await axios.post(`${API_BASE_URL}/api/community/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const token = await getStoredToken();
      await axios.post(`${API_BASE_URL}/api/community/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setGroups(groups.map(group => 
        group._id === groupId 
          ? { ...group, isJoined: !group.isJoined, members: group.isJoined ? group.members - 1 : group.members + 1 }
          : group
      ));
      
      Alert.alert(
        language === 'mr' ? 'यशस्वी' : (language === 'hi' ? 'सफल' : 'Success'),
        language === 'mr' ? 'गटात सामील झाली' : (language === 'hi' ? 'ग्रुप में शामिल हो गए' : 'Joined group successfully')
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to join group. Please try again.');
    }
  };

  const voteInPoll = async (pollId: string, optionIndex: number) => {
    try {
      const token = await getStoredToken();
      await axios.post(`${API_BASE_URL}/api/community/polls/${pollId}/vote`, {
        optionIndex
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setPolls(polls.map(poll => {
        if (poll._id === pollId) {
          const updatedOptions = [...poll.options];
          updatedOptions[optionIndex].votes += 1;
          return {
            ...poll,
            options: updatedOptions,
            totalVotes: poll.totalVotes + 1,
            userVoted: true,
            userVoteIndex: optionIndex,
          };
        }
        return poll;
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to vote. Please try again.');
    }
  };

  const reportPost = (postId: string) => {
    Alert.alert(
      language === 'mr' ? 'तक्रार करा' : (language === 'hi' ? 'रिपोर्ट करें' : 'Report Post'),
      language === 'mr' ? 'या पोस्टची तक्रार का करू इच्छिता?' : (language === 'hi' ? 'इस पोस्ट की रिपोर्ट क्यों करना चाहते हैं?' : 'Why do you want to report this post?'),
      [
        { text: language === 'mr' ? 'रद्द करा' : (language === 'hi' ? 'रद्द करें' : 'Cancel'), style: 'cancel' },
        { text: language === 'mr' ? 'अपमानजनक सामग्री' : (language === 'hi' ? 'अपमानजनक सामग्री' : 'Offensive Content') },
        { text: language === 'mr' ? 'स्पॅम' : (language === 'hi' ? 'स्पैम' : 'Spam') },
        { text: language === 'mr' ? 'खोटी माहिती' : (language === 'hi' ? 'गलत जानकारी' : 'False Information') },
      ]
    );
  };

  const getStoredToken = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('userToken');
  };

  const renderPostCard = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.isAnonymous ? '?' : item.author.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.authorRole}>{item.author.role}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => reportPost(item._id)}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.mediaUrl && (
        <View style={styles.mediaContainer}>
          {item.mediaType === 'image' ? (
            <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={48} color="#FF6B35" />
              <Text style={styles.videoText}>Video</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.postTags}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>
              #{availableTags.find(t => t.id === tag)?.name || tag}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => likePost(item._id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? "#FF4444" : "#666"} 
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroupCard = ({ item }: { item: Group }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupMembers}>
            {item.members} {language === 'mr' ? 'सदस्य' : (language === 'hi' ? 'सदस्य' : 'members')}
          </Text>
        </View>
        {item.isPrivate && (
          <Ionicons name="lock-closed" size={16} color="#666" />
        )}
      </View>
      
      <Text style={styles.groupDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <TouchableOpacity 
        style={[styles.joinButton, item.isJoined && styles.joinedButton]}
        onPress={() => joinGroup(item._id)}
      >
        <Text style={[styles.joinButtonText, item.isJoined && styles.joinedButtonText]}>
          {item.isJoined ? 
            (language === 'mr' ? 'सामील झाली' : (language === 'hi' ? 'शामिल हैं' : 'Joined')) :
            (language === 'mr' ? 'सामील व्हा' : (language === 'hi' ? 'शामिल हों' : 'Join'))
          }
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPollCard = ({ item }: { item: Poll }) => (
    <View style={styles.pollCard}>
      <Text style={styles.pollQuestion}>{item.question}</Text>
      
      <View style={styles.pollOptions}>
        {item.options.map((option, index) => {
          const percentage = item.totalVotes > 0 ? (option.votes / item.totalVotes * 100) : 0;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.pollOption,
                item.userVoted && item.userVoteIndex === index && styles.selectedOption,
              ]}
              onPress={() => !item.userVoted && voteInPoll(item._id, index)}
              disabled={item.userVoted}
            >
              <Text style={styles.pollOptionText}>{option.text}</Text>
              {item.userVoted && (
                <View style={styles.pollResults}>
                  <View 
                    style={[styles.pollBar, { width: `${percentage}%` }]} 
                  />
                  <Text style={styles.pollPercentage}>{percentage.toFixed(1)}%</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      <Text style={styles.pollStats}>
        {item.totalVotes} {language === 'mr' ? 'मते' : (language === 'hi' ? 'वोट' : 'votes')} • 
        {language === 'mr' ? ' संपेपर्यंत' : (language === 'hi' ? ' तक' : ' ends')} {new Date(item.endDate).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {language === 'mr' ? 'कोणत्याही पोस्ट नाहीत' : (language === 'hi' ? 'कोई पोस्ट नहीं' : 'No posts available')}
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreatePost(true)}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderGroupsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {language === 'mr' ? 'कोणते गट नाहीत' : (language === 'hi' ? 'कोई ग्रुप नहीं' : 'No groups available')}
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderPollsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={polls}
        renderItem={renderPollCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {language === 'mr' ? 'कोणते मतदान नाहीत' : (language === 'hi' ? 'कोई पोल नहीं' : 'No polls available')}
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreatePoll(true)}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'mr' ? 'समुदाय मंच' : (language === 'hi' ? 'कम्युनिटी फोरम' : 'Community Forum')}
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons name="chatbubbles" size={20} color={activeTab === 'posts' ? '#FFFFFF' : '#FF6B35'} />
          <Text style={[styles.tabButtonText, activeTab === 'posts' && styles.tabButtonTextActive]}>
            {language === 'mr' ? 'पोस्ट' : (language === 'hi' ? 'पोस्ट' : 'Posts')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'groups' && styles.tabButtonActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'groups' ? '#FFFFFF' : '#FF6B35'} />
          <Text style={[styles.tabButtonText, activeTab === 'groups' && styles.tabButtonTextActive]}>
            {language === 'mr' ? 'गट' : (language === 'hi' ? 'ग्रुप' : 'Groups')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'polls' && styles.tabButtonActive]}
          onPress={() => setActiveTab('polls')}
        >
          <Ionicons name="bar-chart" size={20} color={activeTab === 'polls' ? '#FFFFFF' : '#FF6B35'} />
          <Text style={[styles.tabButtonText, activeTab === 'polls' && styles.tabButtonTextActive]}>
            {language === 'mr' ? 'मतदान' : (language === 'hi' ? 'पोल' : 'Polls')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'posts' && renderPostsTab()}
      {activeTab === 'groups' && renderGroupsTab()}
      {activeTab === 'polls' && renderPollsTab()}

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'mr' ? 'नवीन पोस्ट' : (language === 'hi' ? 'नई पोस्ट' : 'New Post')}
            </Text>
            <TouchableOpacity onPress={createPost}>
              <Text style={styles.postButton}>
                {language === 'mr' ? 'पोस्ट करा' : (language === 'hi' ? 'पोस्ट करें' : 'Post')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.postInput}
              placeholder={language === 'mr' ? 
                'तुमचे विचार सामायिक करा...' : 
                (language === 'hi' ? 
                  'अपने विचार साझा करें...' : 
                  'Share your thoughts...')}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              style={styles.anonymousToggle}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Ionicons 
                name={isAnonymous ? "checkbox" : "square-outline"} 
                size={20} 
                color="#FF6B35" 
              />
              <Text style={styles.anonymousText}>
                {language === 'mr' ? 'निनावीपणे पोस्ट करा' : (language === 'hi' ? 'गुमनाम रूप से पोस्ट करें' : 'Post anonymously')}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.sectionTitle}>
              {language === 'mr' ? 'टॅग निवडा' : (language === 'hi' ? 'टैग चुनें' : 'Select Tags')}
            </Text>
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    selectedTags.includes(tag.id) && styles.selectedTag,
                  ]}
                  onPress={() => {
                    if (selectedTags.includes(tag.id)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag.id));
                    } else {
                      setSelectedTags([...selectedTags, tag.id]);
                    }
                  }}
                >
                  <Text style={[
                    styles.tagButtonText,
                    selectedTags.includes(tag.id) && styles.selectedTagText,
                  ]}>
                    #{tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Poll Modal */}
      <Modal visible={showCreatePoll} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePoll(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'mr' ? 'नवीन मतदान' : (language === 'hi' ? 'नया पोल' : 'New Poll')}
            </Text>
            <TouchableOpacity onPress={createPoll}>
              <Text style={styles.postButton}>
                {language === 'mr' ? 'तयार करा' : (language === 'hi' ? 'बनाएं' : 'Create')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.pollInput}
              placeholder={language === 'mr' ? 
                'तुमचा प्रश्न लिहा...' : 
                (language === 'hi' ? 
                  'अपना प्रश्न लिखें...' : 
                  'Enter your question...')}
              value={pollQuestion}
              onChangeText={setPollQuestion}
              multiline
            />
            
            <Text style={styles.sectionTitle}>
              {language === 'mr' ? 'पर्याय' : (language === 'hi' ? 'विकल्प' : 'Options')}
            </Text>
            {pollOptions.map((option, index) => (
              <TextInput
                key={index}
                style={styles.optionInput}
                placeholder={`${language === 'mr' ? 'पर्याय' : (language === 'hi' ? 'विकल्प' : 'Option')} ${index + 1}`}
                value={option}
                onChangeText={(text) => {
                  const newOptions = [...pollOptions];
                  newOptions[index] = text;
                  setPollOptions(newOptions);
                }}
              />
            ))}
            
            <TouchableOpacity 
              style={styles.addOptionButton}
              onPress={() => setPollOptions([...pollOptions, ''])}
            >
              <Ionicons name="add" size={20} color="#FF6B35" />
              <Text style={styles.addOptionText}>
                {language === 'mr' ? 'पर्याय जोडा' : (language === 'hi' ? 'विकल्प जोड़ें' : 'Add Option')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
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
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  authorRole: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#FFF0ED',
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
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  joinedButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinedButtonText: {
    color: '#4CAF50',
  },
  pollCard: {
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
  pollQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  pollOptions: {
    marginBottom: 12,
  },
  pollOption: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF0ED',
  },
  pollOptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  pollResults: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollBar: {
    height: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    marginTop: 4,
  },
  pollPercentage: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  pollStats: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
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
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
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
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  anonymousText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedTag: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  tagButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  pollInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  optionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  addOptionText: {
    fontSize: 16,
    color: '#FF6B35',
    marginLeft: 8,
    fontWeight: '600',
  },
});