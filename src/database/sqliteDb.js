// src/database/sqliteDb.js
import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(false);

// Open database
const db = SQLite.openDatabase(
  {
    name: 'houseRental.db',
    location: 'default',
  },
  () => console.log('✅ Database opened'),
  (error) => console.log('❌ Database error:', error)
);

// Execute SQL with Promise - FIXED VERSION
export const executeSql = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (tx, results) => {
            resolve(results);
          },
          (tx, error) => {
            console.error('SQL Error:', error, 'SQL:', sql);
            reject(error);
            return true; // Prevent default error handling
          }
        );
      },
      (error) => {
        console.error('Transaction Error:', error);
        reject(error);
      }
    );
  });
};

// Initialize database
export const initDatabase = async () => {
  try {
    console.log('📱 Initializing database...');
    
    // Users table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'tenant',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    // Houses table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS houses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        location TEXT NOT NULL,
        bedrooms INTEGER DEFAULT 1,
        bathrooms INTEGER DEFAULT 1,
        description TEXT,
        image_url TEXT,
        owner_id INTEGER,
        is_available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        property_type TEXT DEFAULT 'full_house',
        has_parking INTEGER DEFAULT 0,
        has_furniture INTEGER DEFAULT 0,
        has_wifi INTEGER DEFAULT 0,
        has_ac INTEGER DEFAULT 0,
        has_security INTEGER DEFAULT 0,
        is_pet_friendly INTEGER DEFAULT 0,
        is_smoking_allowed INTEGER DEFAULT 0,
        min_stay INTEGER DEFAULT 1,
        max_guests INTEGER DEFAULT 1,
        contact_phone TEXT,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Houses table ready');

    // Bookings table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        house_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_price REAL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Bookings table ready');

    // Favorites table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        house_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, house_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Favorites table ready');

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database init error:', error);
    return false;
  }
};

// SELECT helper - FIXED
export const executeQuery = async (sql, params = []) => {
  try {
    const results = await executeSql(sql, params);
    const rows = [];
    for (let i = 0; i < results.rows.length; i++) {
      rows.push(results.rows.item(i));
    }
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// INSERT/UPDATE/DELETE helper - FIXED
export const executeNonQuery = async (sql, params = []) => {
  try {
    const results = await executeSql(sql, params);
    return {
      insertId: results.insertId,
      rowsAffected: results.rowsAffected,
    };
  } catch (error) {
    console.error('Non-query error:', error);
    throw error;
  }
};

// Reset database
export const resetDatabase = async () => {
  try {
    await executeSql('DROP TABLE IF EXISTS favorites');
    await executeSql('DROP TABLE IF EXISTS bookings');
    await executeSql('DROP TABLE IF EXISTS houses');
    await executeSql('DROP TABLE IF EXISTS users');
    console.log('✅ Database reset');
    return true;
  } catch (error) {
    console.error('Reset error:', error);
    return false;
  }
};

export default db;