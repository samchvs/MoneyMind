import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import Footer from './Footer';

const { width } = Dimensions.get('window');

export default function SavingsPage({ route }) {
  const { username } = route.params;

  const [savings, setSavings] = useState('');
  const [goal, setGoal] = useState('');

  const parsedSavings = parseFloat(savings) || 0;
  const parsedGoal = parseFloat(goal) || 1; 

  const pieData = [
    {
      name: 'Saved',
      amount: parsedSavings,
      color: '#00cc99',
      legendFontColor: '#ffffff',
      legendFontSize: 14,
    },
    {
      name: 'Remaining',
      amount: Math.max(parsedGoal - parsedSavings, 0),
      color: '#555555',
      legendFontColor: '#ffffff',
      legendFontSize: 14,
    },
  ];

  return (
    <LinearGradient colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome,</Text>
          <Text style={styles.username}>{username}!</Text>
          <Text style={styles.pageTitle}>Savings Goal</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Savings:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 300"
            placeholderTextColor="#777"
            value={savings}
            onChangeText={setSavings}
          />

          <Text style={styles.inputLabel}>Enter Goal:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 1000"
            placeholderTextColor="#777"
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        <View style={styles.chartWrapper}>
          <PieChart
            data={pieData}
            width={width - 60}
            height={240}
            chartConfig={{
              color: () => `#fff`,
              labelColor: () => '#fff',
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            hasLegend={false} // Hide the default legend
          />
        </View>

        <View style={styles.customLegend}>
          {pieData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.name}: {item.amount}
              </Text>
            </View>
          ))}
        </View>
        
      </ScrollView>
      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    paddingBottom: 30,
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
  inputContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 5,
    marginBottom: 10,
  },
  chartWrapper: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    left: 73,
  },
  customLegend: {
    marginTop: 20,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 6,
  },
  legendText: {
    color: '#fff',
    fontSize: 14,
  },
});
