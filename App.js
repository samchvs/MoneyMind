import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingPage from './LoadingPage'; 
import LoginPage from './LoginPage'; 
import HomePage from './HomePage';

const Stack = createStackNavigator();

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowLogin(true);
    }, 1000); 
  }, []);

  if (!showLogin) {
    // Show LoadingPage while waiting
    return (
      <LinearGradient
        colors={['#000000', '#171717', '#171717', '#232323', '#3b3b3b', '#3b3b3b', '#4f4f4f']}
        style={styles.background}
      >
        <View style={styles.centeredContainer}>
          <LoadingPage />
        </View>
      </LinearGradient>
      
    );
  }

  // Show NavigationContainer once LoadingPage is done
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!showLogin ? (
          <Stack.Screen name="LoadingPage" component={LoadingPage} />
        ) : (
          <>
            <Stack.Screen name="LoginPage" component={LoginPage} />
            <Stack.Screen name="HomePage" component={HomePage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});