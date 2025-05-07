import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const { width } = Dimensions.get('window');

export default function SavingsPage() {
  const [savings, setSavings] = useState('');
  const [goal, setGoal] = useState('');
  const parsedSavings = parseFloat(savings) || 0;
  const parsedGoal = parseFloat(goal) || 1; 
  const [modalVisible, setModalVisible] = useState(false);  
  const [modalInput, setModalInput] = useState('');
  const [goalDateModalVisible, setGoalDateModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isGoalSet, setIsGoalSet] = useState(false);
  const remaining = Math.max(parsedGoal - parsedSavings, 0);

  
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const handleGoalDone = () => {
    if (goal && selectedDate) {
      setIsGoalSet(true);  
      setGoalDateModalVisible(false);  
    }
  };

  const handleStartNewGoal = () => {
    setGoal('');
    setIsGoalSet(false);
    setSelectedDate(null);
    setSavings('');
  };

  const pieData = [
    {
      name: 'Saved',
      amount: parsedSavings,
      color: '#00cc99',
      legendFontColor: '#transparent',
      legendFontSize: 14,
    },
    {
      name: 'Remaining',
      amount: Math.max(parsedGoal - parsedSavings, 0),
      color: '#ffffff',
      legendFontColor: 'transparent',
      legendFontSize: 14,
    },
  ];

  const formattedDate = selectedDate
  ? selectedDate.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  : '';

  return (
    <LinearGradient colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Savings Goal</Text>
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
                    {item.name}
                  </Text>
            </View>
          ))} 
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Funds</Text>
        
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          {isGoalSet && selectedDate && (
            parsedSavings >= parsedGoal ? (
              <Text style={styles.progressMessage}>
                  🎉 Congratulations! {'\n'}You reached your Goal 🤑
              </Text>
              ) : (
                <Text style={styles.progressMessage}>
                  Keep going, there is only Php
                  <Text style={{ fontWeight: 'bold' }}> {remaining.toFixed(2)} </Text>
                    left to reach Php
                    <Text style={{ fontWeight: 'bold' }}> {parsedGoal.toFixed(2)} </Text>
                      by
                    <Text style={{ fontWeight: 'bold' }}> {formattedDate}.</Text>
                  </Text>
                ) 
            )}    
        </View>
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
            <TouchableOpacity onPress={() => setGoalDateModalVisible(true)}>
              <Text style={styles.rectangleGoal}>Set Goal</Text>
            </TouchableOpacity>   
        </View>
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={goalDateModalVisible}
            onRequestClose={() => setGoalDateModalVisible(false)}
          >
          <View style={styles.modalOverlay1}>
            <View style={styles.modalContent1}>
              <Text style={styles.modalTitle1}>Set Target</Text>
  
            {/* Goal Box */}
            <View style={styles.modalInputBox2}>
              <TextInput
                style={styles.modalTextInput2}
                keyboardType="numeric"
                placeholder="Enter Target Amount:"
                placeholderTextColor="#999"
                value={goal}
                onChangeText={setGoal}
                editable={!isGoalSet}
              />
            </View>

            {/* Date Picker Trigger */}
            <TouchableOpacity onPress={showDatePicker} style={styles.modalInput1} disabled={isGoalSet}>
              <Text style={{ color: '#999' }}>
                {selectedDate ? selectedDate.toDateString() : ' Enter Target Date:'}
              </Text>
            </TouchableOpacity>

            {/* Date Picker Modal */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />

            <TouchableOpacity
              style={[
                styles.modalDoneButton1,
                isGoalSet && styles.disabledButton  
              ]}
              onPress={handleGoalDone}
              disabled={isGoalSet}
            >
              <Text style={[
                styles.modalDoneText1,
                isGoalSet && styles.disabledButtonText
              ]}>
                {isGoalSet ? 'Goal Set' : 'Set Savings Target'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>

    <View style={styles.quoteContainer}>
      <Text style={styles.quoteText}>
        "If you want to get rich, think of saving as earning"{'\n'}- Andrew Carnegie.
      </Text>
    </View>

   {remaining === 0 && remaining === 0.00 &&(
      <TouchableOpacity style={styles.newGoalButton} onPress={handleStartNewGoal}>
        <Text style={styles.newGoalButtonText}>Start a New Goal</Text>
      </TouchableOpacity>
    )}

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
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 20,
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
    marginTop: 10,
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
    width: 350, 
    height: 100, 
    backgroundColor: '#2E2E2E', 
    borderRadius: 20, 
    marginVertical: 20, 
    alignSelf: 'center', 
  },
  rectangleText: {
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'left', 
    marginHorizontal: 20, 
    marginTop: -25, 
    lineHeight: 100, 
    overflow: 'hidden',
    width: '100%', 
  },
  rectangleText1: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'left',
    marginTop: -40,
    marginHorizontal: 20,
    flexWrap: 'wrap', 
    width: '100%', 
    overflow: 'hidden', 
  },
  rectangleGoal: {
    fontSize: 12,
    color: '#00cc99',
    textAlign: 'left',
    marginHorizontal: 20,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  modalOverlay1: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent1: {
    backgroundColor: '#1c1c1c',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle1: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  modalInput1: {
    backgroundColor: '#2c2c3a',
    color: '#fff',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 20,
  },
  modalDoneButton1: {
    backgroundColor: '#00cc99',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalDoneText1: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalInputBox2: {
    backgroundColor: '#2c2c3a',
    color: '#999',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 20,
  },
  modalInputLabel2: {
    color: '#aaa',
    marginBottom: 4,
    fontSize: 12,
  },
  modalTextInput2: {
    color: '#fff',
    fontSize: 14,
    borderBottomColor: '#444',
    paddingVertical: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',  
  },
  disabledButtonText: {
    color: '#666',
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginTop: 25, 
    marginBottom: -20, 
  },
  progressMessage: {
    textAlign: 'center', 
    fontSize: 16, 
    color: '#fff', 
    maxWidth: '90%', 
    padding: 10, 
    lineHeight: 22, 
  },
  quoteContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#ccc',
    textAlign: 'center',
  },
  newGoalButton: {
    backgroundColor: '#00cc99',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '50%', // full width 
    alignSelf: 'center',
  },
  
  newGoalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
