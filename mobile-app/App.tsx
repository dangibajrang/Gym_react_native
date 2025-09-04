import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from './src/hooks/redux';
import { getProfile } from './src/store/slices/authSlice';
import { authService } from './src/services/authService';

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await authService.getStoredToken();
        if (token) {
          // Validate token by fetching profile
          await dispatch(getProfile()).unwrap();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Token is invalid, clear it
        await authService.logout();
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    // You can add a loading screen component here
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator isAuthenticated={isAuthenticated} />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}