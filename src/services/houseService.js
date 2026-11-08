// src/services/houseService.js
import { executeQuery, executeNonQuery } from '../database/sqliteDb';

export const houseService = {
// src/services/houseService.js - Update addHouse function

addHouse: async (houseData) => {
  try {
    const { 
      title, price, location, bedrooms = 1, bathrooms = 1, 
      description = '', image_url = '', owner_id = 1,
      property_type = 'full_house',
      has_parking = 0, has_furniture = 0, has_wifi = 0,
      has_ac = 0, has_security = 0, is_pet_friendly = 0,
      is_smoking_allowed = 0, min_stay = 1, max_guests = 1,
      contact_phone = '', is_available = 1
    } = houseData;
    
    // ✅ Validate data
    if (!title || !price || !location || !owner_id) {
      throw new Error('Missing required fields: title, price, location, or owner_id');
    }

    // ✅ Ensure numeric values are valid
    const validPrice = parseFloat(price) || 0;
    const validBedrooms = parseInt(bedrooms) || 1;
    const validBathrooms = parseInt(bathrooms) || 1;
    const validMinStay = parseInt(min_stay) || 1;
    const validMaxGuests = parseInt(max_guests) || 1;
    
    console.log('🏠 Inserting house with data:', {
      title, price: validPrice, location, bedrooms: validBedrooms,
      bathrooms: validBathrooms, owner_id, property_type
    });

    const result = await executeNonQuery(
      `INSERT INTO houses 
       (title, price, location, bedrooms, bathrooms, description, image_url, owner_id,
        property_type, has_parking, has_furniture, has_wifi, has_ac, has_security,
        is_pet_friendly, is_smoking_allowed, min_stay, max_guests, contact_phone, is_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(), 
        validPrice, 
        location.trim(), 
        validBedrooms, 
        validBathrooms, 
        description.trim(), 
        image_url, 
        owner_id, 
        property_type, 
        has_parking, 
        has_furniture, 
        has_wifi, 
        has_ac, 
        has_security, 
        is_pet_friendly, 
        is_smoking_allowed, 
        validMinStay, 
        validMaxGuests, 
        contact_phone, 
        is_available
      ]
    );
    
    console.log('✅ Insert result:', result);
    
    const houses = await executeQuery(
      `SELECT h.*, u.name as owner_name FROM houses h 
       LEFT JOIN users u ON h.owner_id = u.id 
       WHERE h.id = ?`,
      [result.insertId]
    );
    return houses[0] || null;
  } catch (error) {
    console.error('Error adding house:', error);
    console.error('Error details:', error.message);
    throw new Error('Failed to add house: ' + error.message);
  }
},

  getAllHouses: async () => {
    try {
      return await executeQuery(
        `SELECT h.*, u.name as owner_name FROM houses h 
         LEFT JOIN users u ON h.owner_id = u.id 
         WHERE h.is_available = 1 
         ORDER BY h.created_at DESC`
      );
    } catch (error) {
      console.error('Error getting houses:', error);
      return [];
    }
  },

  getHousesByOwner: async (ownerId) => {
    try {
      return await executeQuery(
        `SELECT h.*, u.name as owner_name 
         FROM houses h 
         LEFT JOIN users u ON h.owner_id = u.id 
         WHERE h.owner_id = ? 
         ORDER BY h.created_at DESC`,
        [ownerId]
      );
    } catch (error) {
      console.error('Error getting owner houses:', error);
      return [];
    }
  },

  getHouseById: async (id) => {
    try {
      const houses = await executeQuery(
        `SELECT h.*, u.name as owner_name FROM houses h 
         LEFT JOIN users u ON h.owner_id = u.id 
         WHERE h.id = ?`,
        [id]
      );
      return houses[0] || null;
    } catch (error) {
      console.error('Error getting house:', error);
      return null;
    }
  },

  updateHouse: async (id, updates) => {
    try {
      const allowedFields = ['title', 'price', 'location', 'bedrooms', 'bathrooms', 'description', 'image_url', 'is_available'];
      const filteredUpdates = {};
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = value;
        }
      }
      
      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }
      
      const fields = Object.keys(filteredUpdates);
      const values = Object.values(filteredUpdates);
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      
      await executeNonQuery(
        `UPDATE houses SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      return await houseService.getHouseById(id);
    } catch (error) {
      console.error('Error updating house:', error);
      throw error;
    }
  },

  deleteHouse: async (id) => {
    try {
      await executeNonQuery('DELETE FROM houses WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting house:', error);
      return false;
    }
  },

  deleteAllHouses: async () => {
    try {
      await executeNonQuery('DELETE FROM houses');
      return true;
    } catch (error) {
      console.error('Error deleting houses:', error);
      return false;
    }
  },

  searchHouses: async (query) => {
    try {
      return await executeQuery(
        `SELECT h.*, u.name as owner_name 
         FROM houses h 
         LEFT JOIN users u ON h.owner_id = u.id 
         WHERE h.is_available = 1 
         AND (h.title LIKE ? OR h.location LIKE ? OR h.description LIKE ?)
         ORDER BY h.created_at DESC`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
    } catch (error) {
      console.error('Error searching houses:', error);
      return [];
    }
  }
};

export default houseService;