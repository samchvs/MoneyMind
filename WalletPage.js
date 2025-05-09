import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image,TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePredictedBudget } from './PredictedBudgetContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const categoryIcons = {
  Bills: 'cash',
  Food: 'food',
  Entertainment: 'movie',
  Transportation: 'car',
  'Personal Spending': 'account',
  Savings: 'bank',
  Healthcare: 'hospital-building',
  default: 'cash',
};

export default function WalletPage({ route }) {
  const { predictedBudget, currentIncome } = usePredictedBudget();

  const totalPredictedAmount = predictedBudget ? Object.values(predictedBudget).reduce((sum, amount) => sum + amount, 0) : 0;

  const remainingIncome = currentIncome !== null ? currentIncome - totalPredictedAmount : null;

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Budget</Text>

        <Text style={styles.heading}>Your Income</Text>
        <View style={styles.boxIncome}>
          <Text style={styles.incomeText}>₱ </Text>
          <Text style={styles.incomeValue}>{currentIncome !== null ? currentIncome.toFixed(2) : 'N/A'} </Text>
        </View>

        <Text style={styles.heading}>Predicted Allocation</Text>
        <ScrollView style={styles.scrollView}>
          <View style={styles.boxContainer}>
            {predictedBudget ? (
              Object.entries(predictedBudget).map(([category, amount]) => (
                <View key={category} style={styles.boxCategory}>
                   <View style={styles.categoryIcon}>
                     <MaterialCommunityIcons name={categoryIcons[category] || categoryIcons.default} size={24} color="#000" />
                   </View>
                  <Text style={styles.categoryText}>{category}</Text>
                  <Text style={styles.categoryAmount}>₱{amount.toFixed(2)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                 <Text style={styles.noDataText}>No predicted budget available.</Text>
                 <Text style={styles.noDataSubText}>Visit the AI page to generate a budget.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'left',
    marginLeft: 20,
  },
  heading: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'left',
    marginLeft: 20,
    marginTop: 15,
  },
  boxIncome: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 15,
  },
  incomeText: {
    fontSize: 26,
    color: '#00e676',
    fontWeight: 'bold'
  },
  incomeValue: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold'
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  boxContainer: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  boxCategory: {
    width: '100%',
    height: 60,
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
   categoryIcon: {
    width: 35,
    height: 35,
    backgroundColor: '#fff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  categoryAmount: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  noDataText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  noDataSubText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});
