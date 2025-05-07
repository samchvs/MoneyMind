import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HelloWorld() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, This is Wallet!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // optional
  },
  text: {
    fontSize: 24,
    color: '#00cc99',
    fontWeight: 'bold',
  },
});
