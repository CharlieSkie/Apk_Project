import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { addUser, getUserByEmail } from '../database/database';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Quiet Notice', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Quiet Notice', 'Please enter a valid email address');
      return;
    }

    const emailParts = email.split('@');
    if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1].includes('.')) {
      Alert.alert('Quiet Notice', 'Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Quiet Notice', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Quiet Notice', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert('Quiet Notice', 'An account with this email already exists');
        return;
      }

      const userId = await addUser(name, email, password);
      Alert.alert('Welcome', 'Your quiet space has been created!', [
        { text: 'Enter', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Quiet Notice', 'Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>✨</Text>
            </View>
            <Text style={styles.welcomeText}>Create Your Space</Text>
            <Text style={styles.subtitle}>Begin your peaceful journey</Text>
          </View>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!isLoading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={toggleShowPassword}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={toggleShowConfirmPassword}>
                <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating...' : 'Create Quiet Space'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>
                Already have a space?{'\n'}
                <Text style={styles.linkTextBold}>Enter here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 100, // Space for header
    paddingBottom: 40, // Bottom padding
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 60, // Increased spacing
  },
  logo: {
    width: 100, // Slightly larger
    height: 100,
    borderRadius: 25,
    backgroundColor: '#84A59D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#84A59D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  logoText: {
    fontSize: 40, // Larger
    color: '#FFFFFF',
    fontWeight: '300',
  },
  welcomeText: {
    fontSize: 34, // Slightly larger
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1E293B',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: '#64748B',
    fontWeight: '300',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 40, // More spacing before button
  },
  input: {
    height: 58, // Slightly taller
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    height: 58, // Slightly taller
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    paddingRight: 60,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
    opacity: 0.7,
  },
  actionContainer: {
    marginTop: 20,
  },
  button: {
    height: 58, // Slightly taller
    backgroundColor: '#84A59D',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#84A59D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  linkButton: {
    padding: 16,
  },
  linkText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
  },
  linkTextBold: {
    color: '#84A59D',
    fontWeight: '500',
  },
});

export default RegisterScreen;