import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      // This would be an actual API call in a real app
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      setResetSent(true);
      setEmailError('');
    } catch (error) {
      setEmailError('Error requesting password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // @ts-ignore - Navigate back to login
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.logo} variant="headlineLarge">
            DeepShift
          </Text>

          <View style={styles.card}>
            {!resetSent ? (
              <>
                <Text style={styles.title} variant="headlineSmall">
                  Reset Password
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  Enter your email address and we'll send you instructions to
                  reset your password.
                </Text>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  style={styles.input}
                  error={!!emailError}
                  disabled={loading}
                />
                {emailError ? (
                  <HelperText type="error" visible={!!emailError}>
                    {emailError}
                  </HelperText>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  style={styles.resetButton}
                  loading={loading}
                  disabled={loading}
                >
                  Send Reset Instructions
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.title} variant="headlineSmall">
                  Email Sent
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  If an account exists with email {email}, you will receive
                  password reset instructions.
                </Text>

                <Button
                  mode="contained"
                  onPress={handleBackToLogin}
                  style={styles.resetButton}
                >
                  Back to Login
                </Button>
              </>
            )}

            {!resetSent && (
              <Button
                mode="text"
                onPress={handleBackToLogin}
                style={styles.backButton}
              >
                Back to Login
              </Button>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1f2937',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  title: {
    marginBottom: 4,
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 20,
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  backButton: {
    marginTop: 12,
  },
});

export default ResetPasswordScreen;
