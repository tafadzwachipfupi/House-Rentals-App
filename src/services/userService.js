// src/services/userService.js
import { executeQuery, executeNonQuery } from '../database/sqliteDb';

export const userService = {
  createUser: async (email, password, name = '', phone = '', role = 'tenant') => {
    try {
      console.log('📝 Creating user:', email, 'with role:', role);
      
      const result = await executeNonQuery(
        'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email.toLowerCase().trim(), password, name.trim(), phone.trim(), role]
      );
      
      const users = await executeQuery(
        'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
        [result.insertId]
      );
      
      return users[0] || null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  },

  getUserByEmail: async (email) => {
    try {
      const users = await executeQuery(
        'SELECT * FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  getUserById: async (id) => {
    try {
      const users = await executeQuery(
        'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  getAllUsers: async () => {
    try {
      return await executeQuery(
        'SELECT id, email, name, phone, role, created_at FROM users ORDER BY created_at DESC'
      );
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  updateUser: async (id, updates) => {
    try {
      const allowedFields = ['name', 'phone', 'role'];
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
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      return await userService.getUserById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteAllUsers: async () => {
    try {
      await executeNonQuery('DELETE FROM users');
      return true;
    } catch (error) {
      console.error('Error deleting users:', error);
      return false;
    }
  }
};