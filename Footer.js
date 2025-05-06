import React, { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
} from 'react-native';

export default function Footer({ username }) {
const navigation = useNavigation();
  const iconJumps = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const animateIcon = (icon) => {
    Animated.sequence([
      Animated.timing(icon, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(icon, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const iconData = [
    {
      source: require('./assets/list.png'),
      label: 'List',
      onPress: () => {
        animateIcon(iconJumps[0]);
        navigation.navigate('ListPage', { username });
      },
      style: styles.footerIcon1,
      textStyle: styles.footerIcon1Text,
    },
    {
      source: require('./assets/savingsIcon.png'),
      label: 'Savings',
      onPress: () => {
        animateIcon(iconJumps[1]);
        navigation.navigate('SavingsPage', { username });
      },
      style: styles.footerIcon2,
      textStyle: styles.footerIcon2Text,
    },
    {
      source: require('./assets/home.png'),
      label: 'Home',
      onPress: () => {
        animateIcon(iconJumps[2]);
        console.log('Navigating to HomePage...')
        navigation.navigate('HomePage', { username });
      },
      style: styles.footerIcon3,
      textStyle: styles.footerIcon3Text,
    },
    {
      source: require('./assets/walletIcon.png'),
      label: 'Wallet',
      onPress: () => {
        animateIcon(iconJumps[3]);
        navigation.navigate('WalletPage', { username });
      },
      style: styles.footerIcon4,
      textStyle: styles.footerIcon4Text,
    },
    {
      source: require('./assets/AiIcon.png'),
      label: 'AI',
      onPress: () => {
        animateIcon(iconJumps[4]);
        navigation.navigate('AIPage', { username });
      },
      style: styles.footerIcon5,
      textStyle: styles.footerIcon5Text,
    },
  ];

  return (
    <View style={styles.footer}>
      {iconData.map((icon, index) => (
        <TouchableWithoutFeedback key={index} onPress={icon.onPress}>
          <Animated.View>
            <Animated.Image
              source={icon.source}
              style={[
                icon.style,
                { transform: [{ translateY: iconJumps[index] }] },
              ]}
            />
            {icon.label !== '' && (
              <Text style={icon.textStyle}>{icon.label}</Text>
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#2E2E2E',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 10,
  },
  footerIcon1: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 25,
    top: 15,
  },
  footerIcon1Text: {
    position: 'absolute',
    left: 37,
    top: 50,
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  footerIcon2: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 100,
    top: 10,
  },
  footerIcon2Text: {
    position: 'absolute',
    left: 100,
    top: 50,
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  footerIcon3: {
    position: 'absolute',
    width: 45,
    height: 45,
    left: 175,
    top: 10,
  },
  footerIcon3Text: {
    position: 'absolute',
    right: 170,
    top: 50,
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  footerIcon4: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 250,
    top: 15,
  },
  footerIcon4Text: {
    position: 'absolute',
    left: 252,
    top: 50,
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  footerIcon5: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 320,
    top: 15,
  },
  footerIcon5Text: {
    position: 'absolute',
    left: 334,
    top: 50,
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
});
