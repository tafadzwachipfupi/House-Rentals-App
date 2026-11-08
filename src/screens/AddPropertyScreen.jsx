// src/screens/AddPropertyScreen.jsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { houseService } from '../services/houseService';

const AddPropertyScreen = ({ navigation, route }) => {
  // ✅ Get user from route params with fallback
  const user = route?.params?.user || navigation?.params?.user || null;
  const onPropertyAdded = route?.params?.onPropertyAdded || navigation?.params?.onPropertyAdded || null;
  
  const [loading, setLoading] = useState(false);
  
  // Property type options
  const propertyTypes = [
    { id: 'full_house', label: '🏠 Full House' },
    { id: 'apartment', label: '🏢 Apartment' },
    { id: 'room', label: '🛏️ Single Room' },
    { id: 'shared_room', label: '🛌 Shared Room' },
    { id: 'studio', label: '🎨 Studio' },
    { id: 'other', label: '🏗️ Other' },
  ];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'full_house',
    price: '',
    location: '',
    description: '',
    bedrooms: '1',
    bathrooms: '1',
    isAvailable: true,
    hasParking: false,
    hasFurniture: false,
    hasWiFi: false,
    hasAC: false,
    hasSecurity: false,
    isPetFriendly: false,
    isSmokingAllowed: false,
    minStay: '1',
    maxGuests: '1',
    contactPhone: '',
    imageUrl: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a property title');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Parse numbers correctly
      const bedrooms = parseInt(formData.bedrooms) || 1;
      const bathrooms = parseInt(formData.bathrooms) || 1;
      const minStay = parseInt(formData.minStay) || 1;
      const maxGuests = parseInt(formData.maxGuests) || 1;
      const price = parseFloat(formData.price) || 0;

      const houseData = {
        title: formData.title.trim(),
        price: price,
        location: formData.location.trim(),
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        description: formData.description.trim(),
        image_url: formData.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        owner_id: user.id,
        property_type: formData.propertyType || 'full_house',
        has_parking: formData.hasParking ? 1 : 0,
        has_furniture: formData.hasFurniture ? 1 : 0,
        has_wifi: formData.hasWiFi ? 1 : 0,
        has_ac: formData.hasAC ? 1 : 0,
        has_security: formData.hasSecurity ? 1 : 0,
        is_pet_friendly: formData.isPetFriendly ? 1 : 0,
        is_smoking_allowed: formData.isSmokingAllowed ? 1 : 0,
        min_stay: minStay,
        max_guests: maxGuests,
        contact_phone: formData.contactPhone || '',
        is_available: formData.isAvailable ? 1 : 0,
      };

      console.log('📤 Adding property with data:', houseData);
      const result = await houseService.addHouse(houseData);
      console.log('✅ Property added successfully:', result);
      
      Alert.alert(
        'Success', 
        'Property added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onPropertyAdded) onPropertyAdded();
              if (navigation?.goBack) navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error adding property:', error);
      Alert.alert('Error', 'Failed to add property: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const renderAmenitySwitch = (label, field, icon) => (
    <View style={styles.amenityRow}>
      <Text style={styles.amenityLabel}>{icon} {label}</Text>
      <Switch
        value={formData[field]}
        onValueChange={(value) => updateField(field, value)}
        trackColor={{ false: '#ddd', true: '#2C6E49' }}
        thumbColor={formData[field] ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderPropertyTypeButton = (type) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeButton,
        formData.propertyType === type.id && styles.typeButtonActive
      ]}
      onPress={() => updateField('propertyType', type.id)}
    >
      <Text style={[
        styles.typeButtonText,
        formData.propertyType === type.id && styles.typeButtonTextActive
      ]}>
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>➕ Add Property</Text>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Property Type *</Text>
            <View style={styles.typeGrid}>
              {propertyTypes.map(renderPropertyTypeButton)}
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Basic Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Property Title *"
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={(text) => updateField('title', text)}
            />
            
            <View style={styles.row}>
              <View style={styles.rowHalf}>
                <TextInput
                  style={styles.input}
                  placeholder="Price *"
                  placeholderTextColor="#999"
                  value={formData.price}
                  onChangeText={(text) => updateField('price', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowHalf}>
                <TextInput
                  style={styles.input}
                  placeholder="Location *"
                  placeholderTextColor="#999"
                  value={formData.location}
                  onChangeText={(text) => updateField('location', text)}
                />
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description *"
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Room Details */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Room Details</Text>
            
            <View style={styles.row}>
              <View style={styles.rowHalf}>
                <TextInput
                  style={styles.input}
                  placeholder="Bedrooms"
                  placeholderTextColor="#999"
                  value={formData.bedrooms}
                  onChangeText={(text) => updateField('bedrooms', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowHalf}>
                <TextInput
                  style={styles.input}
                  placeholder="Bathrooms"
                  placeholderTextColor="#999"
                  value={formData.bathrooms}
                  onChangeText={(text) => updateField('bathrooms', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowHalf}>
                <TextInput
                  style={styles.input}
                  placeholder="Min Stay (days)"
                  placeholderTextColor="#999"
                  value={formData.minStay}
                  onChangeText={(text) => updateField('minStay', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowHalf}>
                <TextInput
                  style={styles.input}
                  placeholder="Max Guests"
                  placeholderTextColor="#999"
                  value={formData.maxGuests}
                  onChangeText={(text) => updateField('maxGuests', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Amenities</Text>
            {renderAmenitySwitch('Parking Available', 'hasParking', '🅿️')}
            {renderAmenitySwitch('Furnished', 'hasFurniture', '🛋️')}
            {renderAmenitySwitch('WiFi', 'hasWiFi', '📶')}
            {renderAmenitySwitch('Air Conditioning', 'hasAC', '❄️')}
            {renderAmenitySwitch('Security System', 'hasSecurity', '🔒')}
            {renderAmenitySwitch('Pet Friendly', 'isPetFriendly', '🐾')}
            {renderAmenitySwitch('Smoking Allowed', 'isSmokingAllowed', '🚬')}
          </View>

          {/* Contact & Status */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact & Status</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Contact Phone (optional)"
              placeholderTextColor="#999"
              value={formData.contactPhone}
              onChangeText={(text) => updateField('contactPhone', text)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              placeholderTextColor="#999"
              value={formData.imageUrl}
              onChangeText={(text) => updateField('imageUrl', text)}
            />

            <View style={styles.amenityRow}>
              <Text style={styles.amenityLabel}>📌 Available for Booking</Text>
              <Switch
                value={formData.isAvailable}
                onValueChange={(value) => updateField('isAvailable', value)}
                trackColor={{ false: '#ddd', true: '#2C6E49' }}
                thumbColor={formData.isAvailable ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Property</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#2C6E49',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowHalf: {
    flex: 1,
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  amenityLabel: {
    fontSize: 15,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2C6E49',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
});

export default AddPropertyScreen;