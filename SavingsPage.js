import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SavingsPage({ route }) {
  const { username } = route.params;

  return (
    <LinearGradient colors={['#000000', '#171717', '#232323']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome,</Text>
          <Text style={styles.username}>{username}!</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    justifyContent: 'flex-start',
    width: '100%', 
    paddingHorizontal: 20, 
    paddingTop: 50,
  },
  title: {
    fontSize: 15,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 20,
    color: '#fff',
    marginTop: -5,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: -40,
    marginTop: 7,
  },
});
