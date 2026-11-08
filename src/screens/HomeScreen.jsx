// src/screens/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { houseService } from '../services/houseService';
import { bookingService } from '../services/bookingService';

const HomeScreen = ({ user, onLogout }) => {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState([]);
  
  // Modal states
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allHouses = await houseService.getAllHouses();
      setHouses(allHouses);
      setFilteredHouses(allHouses);

      if (user && user.id) {
        const bookings = await bookingService.getUserBookings(user.id);
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredHouses(houses);
    } else {
      const filtered = houses.filter(house =>
        house.title.toLowerCase().includes(text.toLowerCase()) ||
        house.location.toLowerCase().includes(text.toLowerCase()) ||
        (house.description && house.description.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredHouses(filtered);
    }
  };

  const handleViewHouse = (house) => {
    setSelectedHouse(house);
    setShowDetailsModal(true);
  };

  const handleBookNow = async () => {
    if (!selectedHouse) return;
    
    Alert.alert(
      'Confirm Booking',
      `Would you like to book "${selectedHouse.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: async () => {
            setBookingLoading(true);
            try {
              // Simulate booking - you can replace with actual booking logic
              setTimeout(() => {
                setBookingLoading(false);
                setShowDetailsModal(false);
                Alert.alert(
                  'Success',
                  'Booking request sent! The landlord will confirm shortly.',
                );
                loadData(); // Refresh data
              }, 1500);
            } catch (error) {
              setBookingLoading(false);
              Alert.alert('Error', 'Failed to book house');
            }
          }
        }
      ]
    );
  };

  const handleOpenMaps = () => {
    if (!selectedHouse?.location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const address = encodeURIComponent(selectedHouse.location);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
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
      has_parking: 'Parking',
      has_furniture: 'Furnished',
      has_wifi: 'WiFi',
      has_ac: 'Air Conditioning',
      has_security: 'Security',
      is_pet_friendly: 'Pet Friendly',
      is_smoking_allowed: 'Smoking Allowed',
    };
    return labels[key] || key;
  };

  const renderHouseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.houseCard}
      onPress={() => handleViewHouse(item)}
    >
      <View style={styles.houseImagePlaceholder}>
        <Text style={styles.houseImageText}>🏠</Text>
      </View>
      <View style={styles.houseInfo}>
        <Text style={styles.houseTitle}>{item.title}</Text>
        <Text style={styles.housePrice}>💰 ${item.price}/month</Text>
        <Text style={styles.houseLocation}>📍 {item.location}</Text>
        <Text style={styles.houseDetails}>
          🛏️ {item.bedrooms} bed • 🚽 {item.bathrooms} bath
        </Text>
        {item.owner_name && (
          <Text style={styles.houseOwner}>👤 {item.owner_name}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => {
          setSelectedHouse(item);
          setShowDetailsModal(true);
        }}
      >
        <Text style={styles.bookButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingHouse}>{item.house_title || 'Unknown House'}</Text>
      <Text style={styles.bookingDates}>
        📅 {item.check_in} → {item.check_out}
      </Text>
      <Text style={styles.bookingPrice}>💰 ${item.total_price || 0}</Text>
      <View style={[styles.bookingStatus, { 
        backgroundColor: item.status === 'pending' ? '#FF9800' : 
                        item.status === 'confirmed' ? '#4CAF50' : 
                        item.status === 'cancelled' ? '#FF6B6B' : '#999'
      }]}>
        <Text style={styles.bookingStatusText}>{item.status || 'Unknown'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2C6E49" />
          <Text style={styles.loadingText}>Loading houses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏠 House Rentals</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.name || 'Tenant'}!</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search houses..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{houses.length}</Text>
            <Text style={styles.statLabel}>Available Houses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userBookings.length}</Text>
            <Text style={styles.statLabel}>My Bookings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Houses</Text>
            <Text style={styles.sectionCount}>{filteredHouses.length} found</Text>
          </View>
          {filteredHouses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No houses found</Text>
              <Text style={styles.emptySubText}>
                {searchQuery ? 'Try a different search' : 'Check back later for new listings'}
              </Text>
            </View>
          ) : (
            filteredHouses.map((item) => (
              <View key={item.id}>
                {renderHouseItem({ item })}
              </View>
            ))
          )}
        </View>

        {userBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Bookings</Text>
              <Text style={styles.sectionCount}>{userBookings.length} total</Text>
            </View>
            {userBookings.slice(0, 3).map((item) => (
              <View key={item.id}>
                {renderBookingItem({ item })}
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>HouseRentalApp v1.0</Text>
        </View>
      </ScrollView>

      {/* House Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        {selectedHouse && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => setShowDetailsModal(false)} 
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Property Details</Text>
                <View style={styles.modalHeaderPlaceholder} />
              </View>

              {/* Image */}
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: selectedHouse.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={[styles.modalStatusBadge, { 
                  backgroundColor: selectedHouse.is_available === 1 ? '#4CAF50' : '#FF6B6B' 
                }]}>
                  <Text style={styles.modalStatusText}>
                    {selectedHouse.is_available === 1 ? 'Available' : 'Booked'}
                  </Text>
                </View>
              </View>

              {/* Title & Price */}
              <View style={styles.modalSection}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalHouseTitle}>{selectedHouse.title}</Text>
                  <Text style={styles.modalPrice}>${selectedHouse.price}/month</Text>
                </View>
                <Text style={styles.modalPropertyType}>
                  {selectedHouse.property_type?.replace('_', ' ') || 'Property'}
                </Text>
              </View>

              {/* Location */}
              <TouchableOpacity style={styles.modalSection} onPress={handleOpenMaps}>
                <View style={styles.modalLocationRow}>
                  <Text style={styles.modalLocationIcon}>📍</Text>
                  <Text style={styles.modalLocationText}>{selectedHouse.location}</Text>
                </View>
                <Text style={styles.modalMapLink}>📱 Open in Maps</Text>
              </TouchableOpacity>

              {/* Details */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Details</Text>
                <View style={styles.modalDetailsGrid}>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailIcon}>🛏️</Text>
                    <Text style={styles.modalDetailValue}>{selectedHouse.bedrooms}</Text>
                    <Text style={styles.modalDetailLabel}>Bedrooms</Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailIcon}>🚽</Text>
                    <Text style={styles.modalDetailValue}>{selectedHouse.bathrooms}</Text>
                    <Text style={styles.modalDetailLabel}>Bathrooms</Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailIcon}>👥</Text>
                    <Text style={styles.modalDetailValue}>{selectedHouse.max_guests || 1}</Text>
                    <Text style={styles.modalDetailLabel}>Max Guests</Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailIcon}>📅</Text>
                    <Text style={styles.modalDetailValue}>{selectedHouse.min_stay || 1}</Text>
                    <Text style={styles.modalDetailLabel}>Min Stay</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalDescription}>
                  {selectedHouse.description || 'No description available'}
                </Text>
              </View>

              {/* Amenities */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Amenities</Text>
                <View style={styles.modalAmenitiesGrid}>
                  {[
                    'has_parking',
                    'has_furniture',
                    'has_wifi',
                    'has_ac',
                    'has_security',
                    'is_pet_friendly',
                    'is_smoking_allowed'
                  ].map((key) => {
                    if (selectedHouse[key] === 1) {
                      return (
                        <View key={key} style={styles.modalAmenityItem}>
                          <Text style={styles.modalAmenityIcon}>{getAmenityIcon(key)}</Text>
                          <Text style={styles.modalAmenityLabel}>{getAmenityLabel(key)}</Text>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              </View>

              {/* Owner Info */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Host Information</Text>
                <View style={styles.modalOwnerCard}>
                  <Text style={styles.modalOwnerName}>👤 {selectedHouse.owner_name || 'Unknown Host'}</Text>
                  {selectedHouse.contact_phone && (
                    <Text style={styles.modalOwnerPhone}>📞 {selectedHouse.contact_phone}</Text>
                  )}
                </View>
              </View>

              {/* Book Button */}
              <TouchableOpacity
                style={[
                  styles.modalBookButton,
                  (selectedHouse.is_available !== 1 || bookingLoading) && styles.modalBookButtonDisabled
                ]}
                onPress={handleBookNow}
                disabled={selectedHouse.is_available !== 1 || bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBookButtonText}>
                    {selectedHouse.is_available === 1 ? '📅 Book Now' : 'Not Available'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.modalFooter} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
  },
  houseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  houseImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  houseImageText: {
    fontSize: 30,
  },
  houseInfo: {
    flex: 1,
  },
  houseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  housePrice: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  houseLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 1,
  },
  houseDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  houseOwner: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#2C6E49',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookingHouse: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bookingDates: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 2,
  },
  bookingStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  bookingStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalHeaderPlaceholder: {
    width: 40,
  },
  modalImageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#ddd',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalStatusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHouseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C6E49',
  },
  modalPropertyType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalLocationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modalLocationText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  modalMapLink: {
    fontSize: 14,
    color: '#2C6E49',
    fontWeight: '600',
    marginTop: 8,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalDetailItem: {
    alignItems: 'center',
  },
  modalDetailIcon: {
    fontSize: 24,
  },
  modalDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  modalDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  modalAmenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  modalAmenityIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  modalAmenityLabel: {
    fontSize: 13,
    color: '#333',
  },
  modalOwnerCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  modalOwnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalOwnerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalBookButton: {
    backgroundColor: '#2C6E49',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBookButtonDisabled: {
    backgroundColor: '#999',
  },
  modalBookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalFooter: {
    height: 30,
  },
});

export default HomeScreen;