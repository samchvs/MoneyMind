import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomePage() {
  return (
    <LinearGradient
      colors={['#000000', '#171717', '#171717', '#232323', '#3b3b3b', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to HomePage!</Text>
        {/* Add your components here */}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});
