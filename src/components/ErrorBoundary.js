import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    console.log('🚨 ErrorBoundary: getDerivedStateFromError', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('🚨 ErrorBoundary: componentDidCatch', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  resetError = () => {
    console.log('🔄 ErrorBoundary: Resetting error state');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      console.log('🚨 ErrorBoundary: Rendering error UI');
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorEmoji}>😔</Text>
            </View>
            
            <Text style={styles.errorTitle}>Quiet Glitch</Text>
            <Text style={styles.errorSubtitle}>
              Something unexpected happened in your peaceful space
            </Text>

            <View style={styles.errorDetails}>
              <Text style={styles.detailLabel}>What happened:</Text>
              <Text style={styles.detailText}>
                {this.state.error ? this.state.error.toString() : 'An unknown error occurred'}
              </Text>

              {this.state.errorInfo?.componentStack && (
                <>
                  <Text style={styles.detailLabel}>Technical details:</Text>
                  <ScrollView style={styles.stackScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.stackText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </ScrollView>
                </>
              )}
            </View>

            <TouchableOpacity 
              style={styles.resetButton}
              onPress={this.resetError}
            >
              <Text style={styles.resetButtonText}>Return to Peace</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => console.log('Report error:', this.state.error)}
            >
              <Text style={styles.reportButtonText}>Report Quietly</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    console.log('✅ ErrorBoundary: Rendering children normally');
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  errorEmoji: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  stackScroll: {
    maxHeight: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  stackText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  resetButton: {
    width: '100%',
    backgroundColor: '#84A59D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#84A59D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  reportButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  reportButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ErrorBoundary;