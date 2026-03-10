/**
 * @format
 */

// URL Polyfill is required for Supabase to work with React Native Hermes
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
