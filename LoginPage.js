import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, Text, Image, Animated, TouchableOpacity, Vibration } from 'react-native';  
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(''); 
  const logoMoveUp = useRef(new Animated.Value(0)).current;      
  const moneyMindMoveUp = useRef(new Animated.Value(0)).current;  
  const inputOpacity = useRef(new Animated.Value(0)).current;     
  const buttonOpacity = useRef(new Animated.Value(0)).current;   
  const buttonMoveUp = useRef(new Animated.Value(100)).current;   

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoMoveUp, {
        toValue: -100,
        friction: 20, 
        tension: 30, 
        useNativeDriver: true,
      }),
      Animated.spring(moneyMindMoveUp, {
        toValue: -100,
        friction: 10,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(inputOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([ 
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(buttonMoveUp, {
            toValue: 0,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  }, []);

  const handleLogin = () => {
    if (username.trim() === '') {
      setError('Please enter your username before proceeding.');
      Vibration.vibrate(); 
    } else {
      setError(''); 
      console.log('Navigating with username:', username); //debugger in console but works sa app na
      navigation.navigate('HomePage', { username });
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#171717', '#232323', '#3b3b3b', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      {
    }
      <Animated.View style={[styles.logoWrapper, { transform: [{ translateY: logoMoveUp }] }]}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
      </Animated.View>

      {

      }
      <Animated.Image
        source={require('./assets/MoneyMind.png')}
        style={[styles.moneyMind, { transform: [{ translateY: moneyMindMoveUp }] }]}
      />

      {

      }
      <Animated.View style={[styles.inputWrapper, { opacity: inputOpacity }]}>
        <Text style={styles.floatingLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          placeholderTextColor="#808080"
          value={username}
          onChangeText={(text) => {
            if (text.length > 15) {
              setError('Username cannot exceed 15 characters'); 
              Vibration.vibrate(); 
            } else {
              setError(''); 
              setUsername(text); 
            }
          }}
        />
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={username ? '#00ff00' : 'transparent'}
          style={styles.icon}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Animated.View>

      {}
      <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonMoveUp }] }}>
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    marginBottom: 10,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginTop: -100, 
  },
  moneyMind: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginTop: -90, 
  },
  inputWrapper: {
    width: '85%',
    position: 'relative',
    marginTop: -100,
    marginLeft: 40,
  },
  floatingLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#8A8A8A',
    fontWeight: 'bold',
    zIndex: 1,
    marginTop: -4,
    left: 17,
  },
  input: {
    height: 50,
    width: 250,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15, 
    paddingRight: 40,
    fontSize: 16,
    color: '#fff',
    marginTop: -9,
    paddingTop: 15,
    fontWeight: 'bold',
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 17,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'center', 
    flexWrap: 'wrap',
    width: 250, 
  },
  buttonContainer: {
    width: 250,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderColor: '#fff',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
});