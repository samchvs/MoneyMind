import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingPage from './LoadingPage';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import RegisterPage from './RegisterPage';
import { SQLiteProvider } from 'expo-sqlite';

const Stack = createStackNavigator();

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowLogin(true); // After the fade-out, show the login page
      });
    }, 1000);
  }, []);

  return (
    <SQLiteProvider databaseName="db.db">
      {!showLogin ? (
        <LinearGradient colors={['#000000', '#171717', '#232323']} style={styles.container}>
          <Animated.View style={[styles.fullscreen, { opacity: loadingOpacity, position: 'absolute' }]}>
            <LoadingPage />
          </Animated.View>
        </LinearGradient>
      ) : (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#000000' },
              ...TransitionPresets.SlideFromRightIOS,
            }}
          >
            <Stack.Screen name="LoginPage" component={LoginPage} />
            <Stack.Screen name="RegisterPage" component={RegisterPage} />
            <Stack.Screen name="HomePage" component={HomePage} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
