import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingPage from './LoadingPage';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import RegisterPage from './RegisterPage';
import SavingsPage from './SavingsPage';
import ListPage from './Listpage';
import WalletPage from './WalletPage';
import AiPage from './AiPage';
import GenAiPage from './GenAiPage';

import { SQLiteProvider } from 'expo-sqlite';
import { UserProvider } from './UserContext';

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
        setShowLogin(true); 
      });
    }, 1000);
  }, []);

  return (
    <SQLiteProvider databaseName="db.db">
    <UserProvider>
      {!showLogin ? (
        <LinearGradient colors={['#000000', '#171717', '#232323']} style={styles.gradientContainer}>
          <Animated.View style={[styles.fullscreen, { opacity: loadingOpacity }]}>
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
            <Stack.Screen name="SavingsPage" component={SavingsPage} />
            <Stack.Screen name="ListPage" component={ListPage} />
            <Stack.Screen name="AiPage" component={AiPage} />
            <Stack.Screen name="GenAiPage" component={GenAiPage} />
            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="WalletPage" component={WalletPage} />
           
 
          </Stack.Navigator>
        </NavigationContainer>
      )}
      </UserProvider>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1, 
  },
  fullscreen: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
});