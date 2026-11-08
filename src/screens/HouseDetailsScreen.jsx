// src/screens/HouseDetailsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { houseService } from '../services/houseService';
import { bookingService } from '../services/bookingService';

const HouseDetailsScreen = ({ route, navigation }) => {
  const { houseId } = route.params;
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadHouseDetails();
  }, []);

  const loadHouseDetails = async () => {
    setLoading(true);
    try {
      const houseData = await houseService.getHouseById(houseId);
      setHouse(houseData);
    } catch (error) {
      console.error('Error loading house details:', error);
      Alert.alert('Error', 'Failed to load house details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    Alert.alert(
      'Book This House',
      'Would you like to book this house?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            setBooking(true);
            // Simulate booking
            setTimeout(() => {
              setBooking(false);
              Alert.alert(
                'Success',
                'Booking request sent! The landlord will confirm shortly.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            }, 1500);
          }
        }
      ]
    );
  };

  const handleOpenMaps = () => {
    if (!house?.location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    // For demo, using a static address
    // In production, you would use actual latitude/longitude
    const address = encodeURIComponent(house.location);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const getAmenityIcon = (key) => {
    const icons = {
      has_parking: '🅿️',
      has_furniture: '🛋️',
      has_wifi: '📶',
      has_ac: '❄️',
      has_security: '🔒',
      is_pet_friendly: '🐾',
      is_smoking_allowed: '🚬',
    };
    return icons[key] || '✅';
  };

  const getAmenityLabel = (key) => {
    const labels = {
      has_parking: 'Parking Available',
      has_furniture: 'Furnished',
      has_wifi: 'WiFi Included',
      has_ac: 'Air Conditioning',
      has_security: 'Security System',
      is_pet_friendly: 'Pet Friendly',
      is_smoking_allowed: 'Smoking Allowed',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2C6E49" />
        <Text style={styles.loadingText}>Loading house details...</Text>
      </SafeAreaView>
    );
  }

  if (!house) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>House not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: house.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={[styles.statusBadge, { 
            backgroundColor: house.is_available === 1 ? '#4CAF50' : '#FF6B6B' 
          }]}>
            <Text style={styles.statusText}>
              {house.is_available === 1 ? 'Available' : 'Booked'}
            </Text>
          </View>
        </View>

        {/* Title & Price */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{house.title}</Text>
            <Text style={styles.price}>${house.price}/month</Text>
          </View>
          <Text style={styles.propertyType}>
            {house.property_type?.replace('_', ' ') || 'Property'}
          </Text>
        </View>

        {/* Location */}
        <TouchableOpacity style={styles.locationSection} onPress={handleOpenMaps}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{house.location}</Text>
          </View>
          <Text style={styles.mapLink}>📱 Open in Maps</Text>
        </TouchableOpacity>

        {/* Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🛏️</Text>
              <Text style={styles.detailValue}>{house.bedrooms}</Text>
              <Text style={styles.detailLabel}>Bedrooms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🚽</Text>
              <Text style={styles.detailValue}>{house.bathrooms}</Text>
              <Text style={styles.detailLabel}>Bathrooms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailValue}>{house.max_guests || 1}</Text>
              <Text style={styles.detailLabel}>Max Guests</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailValue}>{house.min_stay || 1}</Text>
              <Text style={styles.detailLabel}>Min Stay (days)</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{house.description || 'No description available'}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.amenitiesSection}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {[
              'has_parking',
              'has_furniture',
              'has_wifi',
              'has_ac',
              'has_security',
              'is_pet_friendly',
              'is_smoking_allowed'
            ].map((key) => {
              if (house[key] === 1) {
                return (
                  <View key={key} style={styles.amenityItem}>
                    <Text style={styles.amenityIcon}>{getAmenityIcon(key)}</Text>
                    <Text style={styles.amenityLabel}>{getAmenityLabel(key)}</Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
          {!Object.keys(house).some(key => 
            ['has_parking', 'has_furniture', 'has_wifi', 'has_ac', 
             'has_security', 'is_pet_friendly', 'is_smoking_allowed'].includes(key) && house[key] === 1
          ) && (
            <Text style={styles.noAmenities}>No amenities listed</Text>
          )}
        </View>

        {/* Owner Info */}
        <View style={styles.ownerSection}>
          <Text style={styles.sectionTitle}>Host Information</Text>
          <View style={styles.ownerCard}>
            <Text style={styles.ownerName}>👤 {house.owner_name || 'Unknown Host'}</Text>
            {house.contact_phone && (
              <Text style={styles.ownerPhone}>📞 {house.contact_phone}</Text>
            )}
            <Text style={styles.ownerEmail}>✉️ {house.owner_email || 'No email provided'}</Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            (house.is_available !== 1 || booking) && styles.bookButtonDisabled
          ]}
          onPress={handleBookNow}
          disabled={house.is_available !== 1 || booking}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              {house.is_available === 1 ? 'Book Now' : 'Not Available'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
  },
  backText: {
    fontSize: 16,
    color: '#2C6E49',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2C6E49',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  titleSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C6E49',
  },
  propertyType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  locationSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  mapLink: {
    fontSize: 14,
    color: '#2C6E49',
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 24,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  amenitiesSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  amenityLabel: {
    fontSize: 13,
    color: '#333',
  },
  noAmenities: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  ownerSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  ownerCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  ownerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ownerEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#2C6E49',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#999',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    height: 30,
  },
});

export default HouseDetailsScreen;