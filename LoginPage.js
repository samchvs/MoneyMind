import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, Image, Animated, TouchableOpacity, Easing } from 'react-native';  
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginPage() {
  const [username, setUsername] = useState('');

 
  const logoMoveUp = useRef(new Animated.Value(0)).current;       // start at initial position
  const moneyMindMoveUp = useRef(new Animated.Value(0)).current;  // start at initial position
  const inputOpacity = useRef(new Animated.Value(0)).current;     // hidden at start
  const buttonOpacity = useRef(new Animated.Value(0)).current;    // button opacity, initially hidden
  const buttonMoveUp = useRef(new Animated.Value(100)).current;   // button starts below, will move up

  useEffect(() => {
     Animated.parallel([
      Animated.timing(logoMoveUp, {
        toValue: -100, 
        duration: 2000,  
        easing: Easing.out(Easing.exp),  
        useNativeDriver: true,
      }),
      Animated.timing(moneyMindMoveUp, {
        toValue: -100, 
        duration: 2000,  
        easing: Easing.out(Easing.exp),  
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(inputOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,  
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(buttonMoveUp, {
            toValue: 0,  
            duration: 600,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]).start();  
      });
    });
  }, []);

  const handleLogin = () => {
    alert('Login Button Pressed');
  };

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#171717', '#232323', '#3b3b3b', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      {/* Logo */}
      <Animated.View style={[styles.logoWrapper, { transform: [{ translateY: logoMoveUp }] }]}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
      </Animated.View>

      {/* MoneyMind Image */}
      <Animated.Image
        source={require('./assets/MoneyMind.png')}
        style={[styles.moneyMind, { transform: [{ translateY: moneyMindMoveUp }] }]}
      />

      {/* Input Field */}
      <Animated.View style={[styles.inputWrapper, { opacity: inputOpacity }]}>
        <Text style={styles.floatingLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          placeholderTextColor="#808080"
          value={username}
          onChangeText={(text) => {
            if (text.length <= 15) {
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
      </Animated.View>

      {/* Button Container with Animated Opacity and Movement */}
      <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonMoveUp }] }}>
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin} activeOpacity={0.8}>
         <Text style={styles.buttonText}>Login</Text>
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
  buttonContainer: {
    width: 250,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderColor: '#fff',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
});
