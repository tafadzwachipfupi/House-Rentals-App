// src/screens/LandlordDashboard.jsx - Updated with Modal
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
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { houseService } from '../services/houseService';
import { bookingService } from '../services/bookingService';
import AddPropertyScreen from './AddPropertyScreen';

const LandlordDashboard = ({ user, onLogout }) => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const houses = await houseService.getHousesByOwner(user.id);
      setProperties(houses || []);

      const allBookings = await bookingService.getOwnerBookings(user.id);
      setBookings(allBookings || []);

      const activeBookings = (allBookings || []).filter(b => b.status === 'pending' || b.status === 'confirmed');
      const totalRevenue = (allBookings || [])
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      setStats({
        totalProperties: (houses || []).length,
        activeBookings: activeBookings.length,
        totalRevenue: totalRevenue,
        pendingRequests: activeBookings.filter(b => b.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error loading landlord data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddProperty = () => {
    console.log('📤 Opening Add Property with user:', user); // Debug log
    setShowAddProperty(true);
   };

  const handleCloseAddProperty = () => {
    setShowAddProperty(false);
    loadData(); // Refresh after adding
  };

  const handleViewProperty = (propertyId) => {
    Alert.alert('View Property', `Viewing property ID: ${propertyId}`);
  };

  const handleManageBooking = (bookingId) => {
    Alert.alert('Manage Booking', `Managing booking ID: ${bookingId}`);
  };

  const handleDeleteProperty = (propertyId, propertyTitle) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${propertyTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await houseService.deleteHouse(propertyId);
              if (result) {
                Alert.alert('Success', 'Property deleted successfully');
                loadData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          }
        }
      ]
    );
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      'full_house': '🏠 Full House',
      'apartment': '🏢 Apartment',
      'room': '🛏️ Room',
      'shared_room': '🛌 Shared Room',
      'studio': '🎨 Studio',
      'other': '🏗️ Other'
    };
    return types[type] || '🏠 Property';
  };

  const renderStatCard = (label, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value || 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => handleViewProperty(item.id)}
    >
      <View style={styles.propertyHeader}>
        <View style={styles.propertyTitleContainer}>
          <Text style={styles.propertyType}>{getPropertyTypeLabel(item.property_type)}</Text>
          <Text style={styles.propertyTitle}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.is_available === 1 ? '#4CAF50' : '#FF6B6B' 
        }]}>
          <Text style={styles.statusText}>
            {item.is_available === 1 ? 'Available' : 'Booked'}
          </Text>
        </View>
      </View>
      
      <View style={styles.propertyDetailsRow}>
        <Text style={styles.propertyPrice}>💰 ${item.price}/month</Text>
        <Text style={styles.propertyLocation}>📍 {item.location}</Text>
      </View>
      
      <View style={styles.propertyDetailsRow}>
        <Text style={styles.propertyDetails}>
          🛏️ {item.bedrooms || 0} bed • 🚽 {item.bathrooms || 0} bath
        </Text>
        {item.max_guests && (
          <Text style={styles.propertyDetails}>👥 Max {item.max_guests} guests</Text>
        )}
      </View>

      <View style={styles.amenitiesPreview}>
        {item.has_wifi === 1 && <Text style={styles.amenityTag}>📶 WiFi</Text>}
        {item.has_parking === 1 && <Text style={styles.amenityTag}>🅿️ Parking</Text>}
        {item.has_ac === 1 && <Text style={styles.amenityTag}>❄️ AC</Text>}
        {item.has_furniture === 1 && <Text style={styles.amenityTag}>🛋️ Furnished</Text>}
        {item.is_pet_friendly === 1 && <Text style={styles.amenityTag}>🐾 Pets</Text>}
      </View>

      <View style={styles.propertyActions}>
        <TouchableOpacity 
          style={[styles.actionButtonSmall, styles.editButton]}
          onPress={() => handleViewProperty(item.id)}
        >
          <Text style={styles.actionButtonSmallText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButtonSmall, styles.deleteButton]}
          onPress={() => handleDeleteProperty(item.id, item.title)}
        >
          <Text style={styles.actionButtonSmallText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingHouse}>{item.house_title || 'Unknown House'}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'pending' ? '#FF9800' : 
                          item.status === 'confirmed' ? '#4CAF50' : 
                          item.status === 'cancelled' ? '#FF6B6B' : '#999'
        }]}>
          <Text style={styles.statusText}>{item.status || 'Unknown'}</Text>
        </View>
      </View>
      <Text style={styles.bookingUser}>👤 {item.user_name || 'Unknown User'}</Text>
      <Text style={styles.bookingDates}>
        📅 {item.check_in} → {item.check_out}
      </Text>
      <Text style={styles.bookingPrice}>💰 ${item.total_price || 0}</Text>
      <TouchableOpacity 
        style={styles.manageButton}
        onPress={() => handleManageBooking(item.id)}
      >
        <Text style={styles.manageButtonText}>Manage Booking</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏠 Landlord Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {user?.name || 'Landlord'}!</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2C6E49']}
          />
        }
      >
        <View style={styles.statsGrid}>
          {renderStatCard('Properties', stats.totalProperties, '🏘️', '#007AFF')}
          {renderStatCard('Active Bookings', stats.activeBookings, '📅', '#4CAF50')}
          {renderStatCard('Revenue', `$${stats.totalRevenue}`, '💰', '#FF9800')}
          {renderStatCard('Pending', stats.pendingRequests, '⏳', '#FF6B6B')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddProperty}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionLabel}>Add Property</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon')}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Properties</Text>
            <Text style={styles.sectionCount}>{properties.length} total</Text>
          </View>
          {properties.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No properties yet</Text>
              <Text style={styles.emptySubText}>Tap "Add Property" to get started</Text>
            </View>
          ) : (
            <FlatList
              data={properties}
              renderItem={renderPropertyItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <Text style={styles.sectionCount}>{bookings.length} total</Text>
          </View>
          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubText}>Bookings will appear here</Text>
            </View>
          ) : (
            <FlatList
              data={bookings.slice(0, 5)}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>HouseRentalApp v1.0</Text>
        </View>
      </ScrollView>

      {/* Add Property Modal */}
    <Modal
        visible={showAddProperty}
        animationType="slide"
        transparent={false}
        >
        <AddPropertyScreen 
            user={user}  // ✅ Pass user directly
            navigation={{ goBack: handleCloseAddProperty }}
            route={{ params: { 
            onPropertyAdded: handleCloseAddProperty,
            user: user  // ✅ Also pass in params
            }}}
        />
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  propertyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  propertyTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  propertyType: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  propertyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  propertyPrice: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
  },
  propertyDetails: {
    fontSize: 13,
    color: '#888',
  },
  amenitiesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 8,
  },
  amenityTag: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  actionButtonSmall: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingHouse: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  bookingUser: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  bookingDates: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  manageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});

export default LandlordDashboard;