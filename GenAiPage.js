import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import * as Progress from 'react-native-progress';

const GenAiPage = () => {
  const progressValues = [0.2, 0.4, 0.6, 0.8, 1.0];
  const progressTexts = [
    'Spend only 10 %  of your budget for Shopping!',
    'Spend only 30 %  of your budget for Bills!',
    'Spend only 40 %  of your budget for Food!',
    'Spend only 50 %  of your budget for Entertainment!',
    'Spend only 5 %  of your budget for Online Subcription!'
  ];

  const [modified, setModified] = useState(false);

  const handleModify = () => {
    setModified(true);
  };

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <Text style={styles.title}>For You!</Text>
      <Text style={styles.subtitle}>AI Budget Recommendation</Text>

      <View style={styles.progressWrapper}>
        {progressValues.map((progress, index) => (
          <View key={index} style={styles.progressContainer}>
            <Text style={styles.progressText}>{progressTexts[index]}</Text>
            <Progress.Bar
              progress={progress}
              width={400}
              height={40}
              color="#fff"
              unfilledColor="#2E2E2E"
              borderRadius={20}
              borderColor="transparent"
              style={styles.progressBar} 
            />
          </View>
        ))}
      </View>

      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>
          {modified
            ? `You’ve customized your budget\nbased on your lifestyle!\n\nHere’s your new spending plan. Make sure\nthese adjustments align with your financial goals to keep your spending on track!`
            : `Based on your past spending, you're not\non track with a balanced budget.\nAdjusting your expenses can help you stay\nfinancially stable and reach your goals faster!`}
        </Text>

        {!modified && (
          <Text style={styles.bottomText1}>
            Would you like to follow this recommendation?
          </Text>
        )}
      </View>

      {!modified && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => console.log('No pressed')}>
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleModify}>
            <Text style={styles.buttonText}>Modify</Text>
          </TouchableOpacity>
        </View>
      )}
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
    progressWrapper: {
      marginTop: 50,
      alignItems: 'center',
    },
    progressContainer: {
      marginBottom: 10,
      alignItems: 'center',
    },
    progressText: {
      fontSize: 12,
      color: '#fff',
      marginBottom: 10,
      textAlign: 'center',
    },
    progressBar: {
      width: 300,
    },
    bottomTextContainer: {
      position: 'absolute',
      bottom: 140,
      left: 20,
      right: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomText: {
      fontSize: 14,
      color: '#B0B0B0',
      textAlign: 'center',
      fontWeight: 'bold',
      lineHeight: 20,
    },
    bottomText1: {
      fontSize: 14,
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      marginTop: 20,
      width: '100%',
      lineHeight: 20,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 150,
    },
    button: {
      backgroundColor: '#000000',
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 20,
      marginHorizontal: 10,
      alignItems: 'center',
      width: 120,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
export default GenAiPage;  