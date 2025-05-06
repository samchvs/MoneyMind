import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function SavingsPage() {
  const [savings, setSavings] = useState('');
  const [goal, setGoal] = useState('');
  const parsedSavings = parseFloat(savings) || 0;
  const parsedGoal = parseFloat(goal) || 1; 
  const [modalVisible, setModalVisible] = useState(false);  
  const [modalInput, setModalInput] = useState('');
  

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
      color: '#ffffff',
      legendFontColor: '#ffffff',
      legendFontSize: 14,
    },
  ];

  return (
    <LinearGradient colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Savings Goal</Text>
        </View>

        <View style={styles.totalSavingsContainer}>
          <Text style={styles.totalSavingsText}>Total Savings</Text>
        </View>

        <View style={styles.chartWrapper}>
          <PieChart
            data={pieData}
            width={width - 40}
            height={220}
            chartConfig={{
              color: () => `#fff`,
              labelColor: () => '#fff',
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            hasLegend={false}
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

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Funds</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor="#aaa"
                value={modalInput}
                onChangeText={setModalInput}
              />

              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => {
                  const additional = parseFloat(modalInput);
                  const current = parseFloat(savings) || 0;

                  if (!isNaN(additional)) {
                    const newTotal = current + additional;
                    setSavings(newTotal.toString());
                  }

                  setModalInput('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.inputContainer}>
          
        <View style={styles.rectangle}>
          <Text style={styles.rectangleText}>You should set a target 🎯</Text>
            <Text style={styles.rectangleText1}>
              Saving is so much easier when you have a {'\n'}clear idea of what you're aiming for.
            </Text>   
              
        </View>
          
          
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

      
      </ScrollView>
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
    paddingTop: 70,
  },
  pageTitle: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
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
  totalSavingsText: {
    fontSize: 14, // Adjust the font size
    fontWeight: 'bold', // Make the text bold
    color: '#fff', // White color for the text
    marginTop: 50, // Add some spacing from the top
    marginBottom: -10, // Add spacing between the text and the chart
    textAlign: 'center', // Center the text horizontally
  },
  chartWrapper: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    left: 73,
  },
  customLegend: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 20,
    paddingHorizontal: 20,
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
  addButton: {
    marginTop: 20,
    backgroundColor: '#00cc99',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1c1c1c',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  modalInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#00cc99',
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    paddingVertical: 5,
  },
  modalDoneButton: {
    backgroundColor: '#00cc99',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 10,
  },
  modalDoneText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rectangle: {
    width: 350, // Width of the rectangle
    height: 80, // Height of the rectangle
    backgroundColor: '#2E2E2E', // Background color of the rectangle
    borderRadius: 20, // Optional: Rounded corners
    marginVertical: 20, // Optional: Spacing around the rectangle
    alignSelf: 'center', // Center horizontally
  },
  rectangleText: {
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'left', 
    marginHorizontal: 20, // Horizontal padding
    marginTop: -25, // Vertical padding
    lineHeight: 100, // Vertically center the text (same as rectangle height)
    overflow: 'hidden', // Ensure text does not overflow the rectangle
    width: '100%', // Ensure the text stays within the rectangle's width
  },
  rectangleText1: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'left',
    marginTop: -40,
    marginHorizontal: 20,
    flexWrap: 'wrap', // Allow text to wrap
    width: '100%', // Ensure the text stays within the rectangle's width
    overflow: 'hidden', // Prevent text overflow
  },
  
});
