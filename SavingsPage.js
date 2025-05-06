import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';



const { width } = Dimensions.get('window');

export default function SavingsPage() {
  const [savings, setSavings] = useState('');
  const [goal, setGoal] = useState('');
  const parsedSavings = parseFloat(savings) || 0;
  const parsedGoal = parseFloat(goal) || 1; //avoid divsion by zero
  const [modalVisible, setModalVisible] = useState(false);  //modals storing
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
    paddingTop: 50,
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
  chartWrapper: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    left: 73,
  },
  customLegend: {
    flexDirection: 'row', // make children sit side by side
    justifyContent: 'space-around', // add spacing between them
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
  
  
  
});
