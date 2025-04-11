import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingPage from './LoadingPage'; 
import LoginPage from './LoginPage'; 

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowLogin(true);
    }, 1000); 
  }, []);

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#171717', '#232323', '#3b3b3b', '#3b3b3b','#4f4f4f']}
      style={styles.background}
    >
      <View style={styles.centeredContainer}>
        {showLogin ? <LoginPage /> : <LoadingPage />}
      </View>
    </LinearGradient>
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
