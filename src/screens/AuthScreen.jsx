// src/screens/AuthScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { userService } from '../services/userService';
import { initDatabase } from '../database/sqliteDb';
import { seedDatabase } from '../utils/seedData';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      console.log('✅ Database ready');
    } catch (error) {
      console.error('Database init error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }
      if (!phone.trim()) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const user = await userService.getUserByEmail(email);
        if (user && user.password === password) {
          Alert.alert('Success', 'Logged in successfully!');
          onLogin(user);
        } else {
          Alert.alert('Error', 'Invalid email or password');
        }
      } else {
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
          Alert.alert('Error', 'Email already registered');
          return;
        }

        const newUser = await userService.createUser(
          email,
          password,
          fullName,
          phone,
          selectedRole
        );
        
        Alert.alert(
          'Success', 
          `Account created successfully as ${selectedRole === 'landlord' ? '🏠 Landlord' : '👤 Tenant'}!`
        );
        onLogin(newUser);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    Alert.alert(
      'Seed Database',
      'This will add sample data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            setLoading(true);
            const result = await seedDatabase();
            setLoading(false);
            if (result.success) {
              Alert.alert(
                'Success', 
                'Sample data added!\n\nTry logging in with:\n📧 landlord@houserentals.com\n🔑 password123\n\nOr:\n📧 tenant@houserentals.com\n🔑 password123'
              );
            } else {
              Alert.alert('Error', 'Failed to seed database: ' + result.error);
            }
          }
        }
      ]
    );
  };

  const RoleButton = ({ role, label, icon }) => (
    <TouchableOpacity
      style={[
        styles.roleButton,
        selectedRole === role && styles.roleButtonActive,
      ]}
      onPress={() => setSelectedRole(role)}
    >
      <Text style={styles.roleIcon}>{icon}</Text>
      <Text
        style={[
          styles.roleButtonText,
          selectedRole === role && styles.roleButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.logo}>🏠</Text>
            <Text style={styles.title}>DZIMBA</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome Back!' : 'Create Your Account'}
            </Text>

            {!isLogin && (
              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>I want to register as:</Text>
                <View style={styles.roleContainer}>
                  <RoleButton role="tenant" label="Tenant" icon="👤" />
                  <RoleButton role="landlord" label="Landlord" icon="🏠" />
                </View>
              </View>
            )}

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            )}

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password * (min 6 characters)"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password *"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsLogin(!isLogin);
                if (!isLogin) {
                  setFullName('');
                  setPhone('');
                  setConfirmPassword('');
                  setSelectedRole('tenant');
                }
              }}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.seedButton}
              onPress={handleSeedDatabase}
              disabled={loading}
            >
              <Text style={styles.seedText}>🌱 Seed Sample Data (Dev)</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {isLogin 
                  ? 'Login to continue' 
                  : `You're signing up as a ${selectedRole === 'landlord' ? '🏠 Landlord' : '👤 Tenant'}`
                }
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  logo: {
    fontSize: 60,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C6E49',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  roleSection: {
    marginBottom: 15,
  },
  roleLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    gap: 8,
  },
  roleButtonActive: {
    borderColor: '#2C6E49',
    backgroundColor: '#e8f5e9',
  },
  roleIcon: {
    fontSize: 20,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#2C6E49',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#1a1a1a', // ✅ Text color - dark
    fontWeight: '400',
  },
  submitButton: {
    backgroundColor: '#2C6E49',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  switchButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchText: {
    color: '#2C6E49',
    fontSize: 14,
  },
  seedButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#388E3C',
  },
  seedText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default AuthScreen;