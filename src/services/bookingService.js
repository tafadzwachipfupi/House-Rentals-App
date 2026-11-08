// src/services/bookingService.js
import { executeQuery, executeNonQuery } from '../database/sqliteDb';

export const bookingService = {
  // Get user bookings
  getUserBookings: async (userId) => {
    try {
      return await executeQuery(
        `SELECT b.*, h.title as house_title, h.location, h.image_url, h.price
         FROM bookings b
         JOIN houses h ON b.house_id = h.id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`,
        [userId]
      );
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  },

  // Get owner bookings (for landlord)
  getOwnerBookings: async (ownerId) => {
    try {
      return await executeQuery(
        `SELECT b.*, h.title as house_title, u.name as user_name, u.email as user_email
         FROM bookings b
         JOIN houses h ON b.house_id = h.id
         JOIN users u ON b.user_id = u.id
         WHERE h.owner_id = ?
         ORDER BY b.created_at DESC`,
        [ownerId]
      );
    } catch (error) {
      console.error('Error getting owner bookings:', error);
      return [];
    }
  },

  // Create booking
  createBooking: async (houseId, userId, checkIn, checkOut, totalPrice) => {
    try {
      // Check if house is available
      const house = await executeQuery(
        'SELECT is_available FROM houses WHERE id = ?',
        [houseId]
      );
      
      if (!house.length || house[0].is_available === 0) {
        throw new Error('House is not available');
      }
      
      const result = await executeNonQuery(
        `INSERT INTO bookings 
         (house_id, user_id, check_in, check_out, total_price) 
         VALUES (?, ?, ?, ?, ?)`,
        [houseId, userId, checkIn, checkOut, totalPrice]
      );
      
      // Mark house as unavailable
      await executeNonQuery(
        'UPDATE houses SET is_available = 0 WHERE id = ?',
        [houseId]
      );
      
      const bookings = await executeQuery(
        `SELECT b.*, h.title as house_title, h.location, h.image_url
         FROM bookings b
         JOIN houses h ON b.house_id = h.id
         WHERE b.id = ?`,
        [result.insertId]
      );
      return bookings[0] || null;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, userId) => {
    try {
      // Get booking details
      const bookings = await executeQuery(
        'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
        [bookingId, userId]
      );
      
      if (!bookings.length) {
        throw new Error('Booking not found or unauthorized');
      }
      
      const booking = bookings[0];
      
      // Update booking status
      await executeNonQuery(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['cancelled', bookingId]
      );
      
      // Check if house has any other active bookings
      const activeBookings = await executeQuery(
        'SELECT * FROM bookings WHERE house_id = ? AND status != "cancelled"',
        [booking.house_id]
      );
      
      // If no other bookings, make house available again
      if (activeBookings.length === 0) {
        await executeNonQuery(
          'UPDATE houses SET is_available = 1 WHERE id = ?',
          [booking.house_id]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    try {
      const bookings = await executeQuery(
        `SELECT b.*, h.title as house_title, h.location, h.image_url,
         u.name as user_name, u.email as user_email
         FROM bookings b
         JOIN houses h ON b.house_id = h.id
         JOIN users u ON b.user_id = u.id
         WHERE b.id = ?`,
        [bookingId]
      );
      return bookings[0] || null;
    } catch (error) {
      console.error('Error getting booking details:', error);
      return null;
    }
  },

  // Get house bookings (for landlord)
  getHouseBookings: async (houseId) => {
    try {
      return await executeQuery(
        `SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         WHERE b.house_id = ?
         ORDER BY b.created_at DESC`,
        [houseId]
      );
    } catch (error) {
      console.error('Error getting house bookings:', error);
      return [];
    }
  }
};