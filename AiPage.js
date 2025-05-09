import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { useNavigation } from '@react-navigation/native';


const AiPage = () => {
    const navigation = useNavigation();
    return (
        <LinearGradient
        colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
        style={styles.container}
        >
        <Text style={styles.title}>Generate with AI!</Text>
        <Text style={styles.subtitle}>AI Budget Recommendation</Text>

        <Image
            source={require('./assets/logo.png')} 
            style={styles.logo}
        />
        
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatbotPage')}
        >
            <View style={styles.buttonContent}>
            <Image
                source={require('./assets/spark.png')}
                style={{ width: 20, height: 20, marginRight: 10 }}
            />
            <Text style={styles.buttonText}>Generate</Text>
            </View>
        </TouchableOpacity>
        </View>

        </LinearGradient>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#B0B0B0',
    marginTop: 5,
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginTop: 40, 
    alignSelf: 'center', 
  },
  buttonContainer: {
    marginTop: -40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30, 
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',   
  },
  

});


export default AiPage;
