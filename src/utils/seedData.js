// src/utils/seedData.js
import { userService } from '../services/userService';
import { houseService } from '../services/houseService';
import { resetDatabase, initDatabase } from '../database/sqliteDb';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Reset and initialize
    await resetDatabase();
    await initDatabase();
    
    console.log('📝 Creating users...');
    
    // Create LANDLORD user
    let landlord = await userService.createUser(
      'landlord@houserentals.com',
      'password123',
      'John Landlord',
      '+1234567890'
    );
    console.log('👤 Landlord created:', landlord);
    
    // Update landlord role
    landlord = await userService.updateUser(landlord.id, { role: 'landlord' });
    console.log('🏠 Landlord role updated to:', landlord?.role);
    
    // Create TENANT user
    let tenant = await userService.createUser(
      'tenant@houserentals.com',
      'password123',
      'Jane Tenant',
      '+0987654321'
    );
    console.log('👤 Tenant created:', tenant);
    
    // Create SECOND TENANT user
    let tenant2 = await userService.createUser(
      'tenant2@houserentals.com',
      'password123',
      'Bob Tenant',
      '+0111222333'
    );
    console.log('👤 Second Tenant created:', tenant2);
    
    // Verify users were created with correct roles
    const allUsers = await userService.getAllUsers();
    console.log('📊 All users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.name}) - Role: ${u.role || 'NOT SET!'}`);
    });
    
    // Sample houses (owned by landlord)
    console.log('🏠 Creating sample houses...');
    const sampleHouses = [
      {
        title: 'Modern Downtown Apartment',
        price: 1200,
        location: 'Downtown, Main St 123',
        bedrooms: 2,
        bathrooms: 1,
        description: 'Beautiful modern apartment in the heart of downtown. Walking distance to shops, restaurants, and public transport. Features include hardwood floors, stainless steel appliances, and in-unit laundry.',
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        owner_id: landlord.id
      },
      {
        title: 'Cozy Riverside Studio',
        price: 850,
        location: 'Riverside, Waterfront Ave 45',
        bedrooms: 1,
        bathrooms: 1,
        description: 'Cozy studio with stunning river views. Perfect for singles or couples. Includes parking, utilities, and access to shared garden.',
        image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
        owner_id: landlord.id
      },
      {
        title: 'Spacious Family Home',
        price: 2000,
        location: 'Green Hills Suburb, Oak St 789',
        bedrooms: 4,
        bathrooms: 2,
        description: 'Large family home with a big backyard. Great for families with kids. Features include a modern kitchen, spacious living room, and a two-car garage.',
        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
        owner_id: landlord.id
      },
      {
        title: 'Luxury Penthouse',
        price: 3500,
        location: 'Skyline Tower, 5th Ave',
        bedrooms: 3,
        bathrooms: 2,
        description: 'Stunning penthouse with panoramic city views. Features floor-to-ceiling windows, modern finishes, and access to building amenities including gym and pool.',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
        owner_id: landlord.id
      },
      {
        title: 'Garden Cottage',
        price: 950,
        location: 'Green Valley, Garden Rd',
        bedrooms: 2,
        bathrooms: 1,
        description: 'Charming cottage with a beautiful garden. Quiet and peaceful location. Features a fireplace, wooden floors, and a private patio.',
        image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
        owner_id: landlord.id
      }
    ];
    
    for (const house of sampleHouses) {
      await houseService.addHouse(house);
    }
    
    console.log(`✅ ${sampleHouses.length} sample houses added`);
    
    // Verify houses were created
    const allHouses = await houseService.getAllHouses();
    console.log(`📊 Total houses in database: ${allHouses.length}`);
    
    console.log('🌱 Seeding complete! ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏠 LANDLORD:');
    console.log('   Email: landlord@houserentals.com');
    console.log('   Password: password123');
    console.log('   Role: landlord ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 TENANT:');
    console.log('   Email: tenant@houserentals.com');
    console.log('   Password: password123');
    console.log('   Role: tenant ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 SECOND TENANT:');
    console.log('   Email: tenant2@houserentals.com');
    console.log('   Password: password123');
    console.log('   Role: tenant ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { 
      success: true,
      landlord,
      tenant,
      tenant2,
      houses: sampleHouses.length,
      message: 'Database seeded successfully!'
    };
  } catch (error) {
    console.error('❌ Seeding error:', error);
    console.error('Error details:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};