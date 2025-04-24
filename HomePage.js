import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomePage({ route }) {
  const username = route?.params?.username;

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
       
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome,</Text>
            <Text style={styles.username}>{username}!</Text>
            <Text style={styles.wallet}>Your Wallet</Text>
          </View>
          <Image
            source={require('./assets/settings_icon.png')}
            style={styles.icon}
          />
        </View>
        
      </SafeAreaView>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',   
    alignItems: 'flex-start',              
    width: width - 40,                 
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
  wallet: {
    fontSize: 35,
    color: '#fff',
    marginTop: 40,
    fontWeight: 'bold',
    marginTop: 30,
  },

});
