import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Apiclient from '../utils/Apiclient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../context/ThemeContext';
const ReportUserScreen = ({ navigation, route }) => {
  const insetsTop = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const [categories, setCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Get reported user info from route params
  const reportedUser = route?.params?.user || { name: 'Unknown User', id: null };

  useEffect(() => {
    fetchCategories();
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await Apiclient.post('/flagReporting/getFlagCategories');
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategorySelect = (category) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const handleSubmitReport = async () => {
    if (!selectedSubCategory && !selectedMainCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe what happened');
      return;
    }

    try {
      // Here you would make your API call to submit the report
      // const reportData = {
      //   categoryId: selectedSubCategory?.id || selectedMainCategory?.id,
      //   description: description.trim(),
      //   reportedUserId: reportedUser.id
      // };

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it and take appropriate action.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const renderMainCategories = () => {
    return categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          selectedMainCategory?.id === category.id && styles.selectedCategoryCard,
        ]}
        onPress={() => handleMainCategorySelect(category)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryContent}>
          <Text style={[
            styles.categoryTitle,
            selectedMainCategory?.id === category.id && styles.selectedCategoryTitle,
          ]}>
            {category.title}
          </Text>
          <View style={styles.categoryIconContainer}>
            <Icon
              name={selectedMainCategory?.id === category.id ? "chevron-down" : "chevron-forward"}
              size={20}
              color={selectedMainCategory?.id === category.id ? "#fff" : "#666"}
            />
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderSubCategories = () => {
    if (!selectedMainCategory || !selectedMainCategory.children?.length) return null;

    return (
      <Animated.View
        style={[
          styles.subCategoriesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.subCategoryHeader}>Select specific issue:</Text>
        {selectedMainCategory.children.map((subCategory) => (
          <TouchableOpacity
            key={subCategory.id}
            style={[
              styles.subCategoryCard,
              selectedSubCategory?.id === subCategory.id && styles.selectedSubCategoryCard,
            ]}
            onPress={() => handleSubCategorySelect(subCategory)}
            activeOpacity={0.8}
          >
            <View style={styles.subCategoryContent}>
              <View style={styles.radioButton}>
                {selectedSubCategory?.id === subCategory.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={[
                styles.subCategoryTitle,
                selectedSubCategory?.id === subCategory.id && styles.selectedSubCategoryTitle,
              ]}>
                {subCategory.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }



  const showDescription =
    selectedSubCategory ||
    (selectedMainCategory && !selectedMainCategory.children?.length);

  const showSubmitButton = showDescription && description.trim();

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: 80, paddingTop: insetsTop.top }]}>
      <StatusBar
        hidden={false} // Show the status bar
        barStyle="light-content"
        backgroundColor="#fff"
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {/* <Text style={styles.headerTitle}>Report User</Text>
        <View style={styles.headerSpacer} /> */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.userInfoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.userInfoContent}>
            {/* <View style={styles.userAvatar}>
              <Icon name="person" size={24} color="#fff" />
            </View> */}
            <View style={styles.userDetails}>
              {/* <Text style={styles.reportingText}>Reporting</Text> */}
              {/* <Text style={styles.userName}>{reportedUser.name}</Text> */}
              <Text style={styles.userName}>Why are you reporting this person?</Text>
            </View>
          </View>
        </Animated.View>
        {!selectedMainCategory && (
          <Animated.View
            style={[
              styles.categoriesSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>What's the issue?</Text>
            <View style={styles.categoriesContainer}>
              {renderMainCategories()}
            </View>
          </Animated.View>
        )}


        {selectedMainCategory && (
          <Animated.View
            style={[
              styles.categoriesSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setSelectedMainCategory(null);
                setSelectedSubCategory(null);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
            >
              <Icon name="arrow-back" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
                {selectedMainCategory.title}
              </Text>
            </TouchableOpacity>
            {/* Show Subcategories only when MainCategory has children */}
            {selectedMainCategory?.children?.length > 0 && renderSubCategories()}

            {showDescription && (
              <Animated.View
                style={[
                  styles.descriptionSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.descriptionLabel}>Describe what happened</Text>
                <TextInput
                  style={styles.descriptionInput}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Please provide details about the issue..."
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </Animated.View>
            )}

            {showSubmitButton && (
              <Animated.View
                style={[
                  styles.submitSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReport}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                  <Icon name="send" size={20} color="#fff" style={styles.submitIcon} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>)}


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userInfoCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    // paddingHorizontal: 2,
    paddingTop: 10,
    marginBottom: 24,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  reportingText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d93a63',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedCategoryCard: {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  selectedCategoryTitle: {
    color: '#fff',
  },
  categoryIconContainer: {
    marginLeft: 12,
  },
  subCategoriesContainer: {
    marginBottom: 24,
  },
  subCategoryHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  subCategoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedSubCategoryCard: {
    backgroundColor: '#2a2a2a',
    borderColor: '#ff4757',
  },
  subCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4757',
  },
  subCategoryTitle: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  selectedSubCategoryTitle: {
    color: '#fff',
  },
  descriptionSection: {
    marginBottom: 32,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  descriptionInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
  },
  submitSection: {
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4757',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 4,
  },
});

export default ReportUserScreen;