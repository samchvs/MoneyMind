import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const SIZE = 200;

export default function SavingsPage({ route }) {
  const { username } = route.params;
  const [progress, setProgress] = useState('');
  const [goal, setGoal] = useState('');

  const numericProgress = parseFloat(progress);
  const numericGoal = parseFloat(goal);

  const savingsPercent =
    numericGoal && numericProgress >= 0
      ? Math.min(100, (numericProgress / numericGoal) * 100)
      : 0;

  // For half circle representation, scale savingsPercent to max 50
  const greenHalf = (savingsPercent / 100) * 50; // 0 to 50
  const rotateLeft = (greenHalf / 50) * 180; // Rotate green in left side

  // Determine the color based on progress
  let color = '#ff0000'; // Default red
  if (savingsPercent >= 50 && savingsPercent < 80) {
    color = '#ffcc00'; // Yellow for moderate progress
  } else if (savingsPercent >= 80) {
    color = '#00ff00'; // Green for good progress
  }

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome,</Text>
          <Text style={styles.username}>{username}!</Text>
          <Text style={styles.pageTitle}>Savings Goal</Text>
        </View>

        <View style={styles.circleContainer}>
          <View style={styles.circleBase}>
            {/* Full gray circle as goal */}
            <View style={styles.fullCircle} />

            {/* LEFT HALF - green progress */}
            <View style={styles.leftHalfContainer}>
              <View style={styles.halfClipLeft}>
                <View
                  style={[
                    styles.halfCircle,
                    {
                      backgroundColor: color, // Dynamic color
                      transform: [{ rotate: `${rotateLeft}deg` }],
                    },
                  ]}
                />
              </View>
            </View>

            {/* RIGHT HALF - static gray */}
            <View style={styles.rightHalfContainer}>
              <View style={styles.halfClipRight}>
                <View
                  style={[
                    styles.halfCircle,
                    {
                      backgroundColor: '#aaa',
                      transform: [{ rotate: '0deg' }],
                    },
                  ]}
                />
              </View>
            </View>

            {/* Inner circle with percentage text */}
            <View style={styles.innerCircle}>
              <Text style={styles.progressText}>
                {isNaN(savingsPercent) ? '0' : savingsPercent.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* User input fields */}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter savings"
          placeholderTextColor="#777"
          value={progress}
          onChangeText={setProgress}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter goal"
          placeholderTextColor="#777"
          value={goal}
          onChangeText={setGoal}
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
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
  pageTitle: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 30,
  },
  circleContainer: {
    marginTop: 60,
  },
  circleBase: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullCircle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#aaa',
  },
  leftHalfContainer: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    overflow: 'hidden',
    borderRadius: SIZE / 2,
  },
  rightHalfContainer: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    overflow: 'hidden',
    borderRadius: SIZE / 2,
    transform: [{ rotate: '180deg' }],
  },
  halfClipLeft: {
    width: SIZE / 2,
    height: SIZE,
    overflow: 'hidden',
  },
  halfClipRight: {
    width: SIZE / 2,
    height: SIZE,
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  innerCircle: {
    position: 'absolute',
    width: SIZE - 40,
    height: SIZE - 40,
    borderRadius: (SIZE - 40) / 2,
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 22,
    color: '#00ff00',
    fontWeight: 'bold',
  },
  input: {
    marginTop: 20,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: width * 0.6,
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#1c1c1c',
  },
});
