import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    let valid = true;
    const newErrors = { email: '', password: '', general: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      // Login with Supabase authentication
      await login(email, password);

      // Get user role from auth context and navigate accordingly
      const { authService } = await import('../services/authService');
      const userInfo = await authService.getCurrentUserInfo();

      // Navigate based on user role
      switch (userInfo.role) {
        case 'worker':
          navigation.navigate('WorkerDashboard');
          break;
        case 'foreman':
          navigation.navigate('ForemanDashboard');
          break;
        case 'overman':
          navigation.navigate('OvermanDashboard');
          break;
        case 'manager':
          navigation.navigate('ManagerDashboard');
          break;
        default:
          setErrors({ ...errors, general: 'Invalid user role' });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred';
      if (errorMessage.includes('Invalid login credentials')) {
        setErrors({ ...errors, general: 'Incorrect email or password' });
      } else {
        setErrors({ ...errors, general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ResetPasswordScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.logo} variant="headlineLarge">
              DeepShift
            </Text>

            <View style={styles.card}>
              <Text style={styles.title} variant="headlineSmall">
                Welcome back
              </Text>
              <Text style={styles.subtitle} variant="bodyMedium">
                Sign in to continue
              </Text>

              {errors.general ? (
                <Text style={styles.errorText}>{errors.general}</Text>
              ) : null}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
                error={!!errors.email}
                disabled={loading}
              />
              {errors.email ? (
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              ) : null}

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.password}
                disabled={loading}
              />
              {errors.password ? (
                <HelperText type="error" visible={!!errors.password}>
                  {errors.password}
                </HelperText>
              ) : null}

              <Button
                onPress={handleForgotPassword}
                mode="text"
                style={styles.forgotButton}
                compact
              >
                Forgot Password?
              </Button>

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                loading={loading}
                disabled={loading}
              >
                Login
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
});

export default LoginScreen;
