import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { getUserByEmail } from '../database/database';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Quiet Notice', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await getUserByEmail(email);
      
      if (user && user.password === password) {
        // Success - gentle navigation
        setTimeout(() => {
          navigation.replace('TaskList', { 
            userId: user.id, 
            userName: user.name,
            userEmail: user.email 
          });
        }, 300);
      } else {
        Alert.alert('Quiet Notice', 'The email or password seems incorrect');
      }
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

  const showAboutInfo = () => {
    setShowAboutModal(true);
  };

  const closeAboutInfo = () => {
    setShowAboutModal(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.aboutButton} onPress={showAboutInfo}>
          <View style={styles.aboutButtonInner}>
            <Text style={styles.aboutButtonText}>ⓘ</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Enhanced Main Content */}
      <View style={styles.content}>
        {/* Logo/Brand Element */}
        <View style={styles.brandContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>✓</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Find your quiet space</Text>
        </View>
        
        <View style={styles.inputContainer}>
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
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Entering...' : 'Enter Quiet Space'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>
            Need a quiet space? {'\n'}
            <Text style={styles.linkTextBold}>Create one here</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced About Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAboutInfo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalLogo}>
                <Text style={styles.modalLogoText}>✓</Text>
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>About Info</Text>
                <Text style={styles.modalSubtitle}>Your peaceful productivity app</Text>
              </View>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>👥 Submitted by:</Text>
                <View style={styles.namesGrid}>
                  <View style={styles.nameColumn}>
                    <Text style={styles.infoText}>• Boyles, Charlie</Text>
                    <Text style={styles.infoText}>• Contrevida, Roslyn</Text>
                    <Text style={styles.infoText}>• Sabior, Mikylla</Text>
                    <Text style={styles.infoText}>• Ramos, Jomarie</Text>
                    <Text style={styles.infoText}>• Torcende, Elvie</Text>
                  </View>
                  <View style={styles.nameColumn}>
                    <Text style={styles.infoText}>• Boncales, Elaisa</Text>
                    <Text style={styles.infoText}>• Taculad, CieloMarie</Text>
                    <Text style={styles.infoText}>• Ydulzura, Lyca Jane</Text>
                    <Text style={styles.infoText}>• Gwen Angel Obado</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>📝 Submitted to:</Text>
                <View style={styles.mentorContainer}>
                  <Text style={styles.mentorText}>Mr. Jay Ian Camelotes</Text>
                  <Text style={styles.mentorRole}>Project Advisor</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>🎨 This Space Offers</Text>
                <View style={styles.featuresGrid}>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>•</Text>
                    <Text style={styles.featureText}>Thoughtful task management</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>•</Text>
                    <Text style={styles.featureText}>Peaceful collaboration</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeAboutInfo}>
              <Text style={styles.closeButtonText}>Return to Quiet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  aboutButton: {
    padding: 8,
  },
  aboutButtonInner: {
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
  aboutButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    paddingTop: 0,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#84A59D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#84A59D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    color: '#64748B',
    fontWeight: '300',
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    height: 56,
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
  },
  passwordInput: {
    height: 56,
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
  button: {
    height: 56,
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
    padding: 12,
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
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  modalLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#84A59D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalLogoText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  modalBody: {
    padding: 24,
  },
  infoSection: {
    marginBottom: 28,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#334155',
  },
  namesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameColumn: {
    width: '48%',
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  mentorContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#84A59D',
  },
  mentorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  mentorRole: {
    fontSize: 14,
    color: '#64748B',
  },
  featuresGrid: {
    flexDirection: 'column',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 16,
    color: '#84A59D',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#F1F5F9',
    padding: 18,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;