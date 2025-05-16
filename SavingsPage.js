import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { InitializeDatabase } from './RegisterPage';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

export default function SavingsPage({ route, navigation }) { 
  const db = useSQLiteContext();
  const { loggedInUser } = useUser();
  const loggedInUserId = loggedInUser?.user_id;

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
  const [dbReady, setDbReady] = useState(false); 

  useEffect(() => {
      const setupDatabase = async () => {
          if (db) {
              try {
                  await InitializeDatabase(db);
                  setDbReady(true);
                  console.log('SavingsPage - Database initialized and ready.');
              } catch (e) {
                  console.error('SavingsPage - Failed to initialize database:', e);
                  Alert.alert('Database Error', 'Failed to initialize the database.');
              }
          }
      };

      setupDatabase();
  }, [db]);

  useEffect(() => {
      const fetchSavingsData = async () => {
          console.log('SavingsPage - Attempting to fetch data...');
          console.log('SavingsPage - dbReady:', dbReady);
          console.log('SavingsPage - loggedInUserId:', loggedInUserId);

          if (dbReady && loggedInUserId) {
              try {
                  const latestGoal = await db.getFirstAsync(
                      'SELECT target_amount, target_date FROM savings_goals WHERE user_id = ? ORDER BY id DESC LIMIT 1',
                       [loggedInUserId]
                  );

                  console.log('SavingsPage - Fetched latestGoal:', latestGoal);

                  if (latestGoal) {
                      setGoal(latestGoal.target_amount.toString());
                      setSelectedDate(new Date(latestGoal.target_date));
                      setIsGoalSet(true);
                      console.log('SavingsPage - Goal found.');

                      const totalContributions = await db.getFirstAsync(
                          'SELECT SUM(amount) AS total_contributed FROM savings_contributions WHERE savings_goal_id = (SELECT id FROM savings_goals WHERE user_id = ? ORDER BY id DESC LIMIT 1)',
                          [loggedInUserId] 
                      );

                      console.log('SavingsPage - Fetched totalContributions:', totalContributions);

                      if (totalContributions && totalContributions.total_contributed !== null) {
                          setSavings(totalContributions.total_contributed.toString());
                      } else {
                          setSavings('0');
                      }
                  } else {
                      console.log('SavingsPage - No goal found for user.');
                      setIsGoalSet(false);
                      setGoal('0');
                      setSavings('0');
                      setSelectedDate(null);
                  }
              } catch (error) {
                  console.error('SavingsPage - Error fetching savings goal or contributions:', error);
                  Alert.alert('Database Error', 'Failed to load savings data.');
              }
          } else {
              console.log('SavingsPage - DB not ready or no user ID, skipping data fetch.');
          }
      };

      fetchSavingsData();
  }, [dbReady, loggedInUserId]);


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

  const handleGoalDone = async () => {
    console.log('SavingsPage - handleGoalDone triggered');
    console.log('SavingsPage - Goal:', goal);
    console.log('SavingsPage - Selected Date:', selectedDate);
    console.log('SavingsPage - dbReady:', dbReady);
    console.log('SavingsPage - loggedInUserId:', loggedInUserId);

    if (!dbReady || !loggedInUserId) {
        Alert.alert('Error', 'Database not ready or user not logged in. Please try again.');
        console.warn('SavingsPage - Cannot set goal: DB not ready or user ID missing.');
        return;
    }

    if (!goal || !selectedDate) {
        Alert.alert('Missing Information', 'Please enter both a target amount and a target date.');
        return;
    }

    const parsedGoalAmount = parseFloat(goal);
    if (isNaN(parsedGoalAmount) || parsedGoalAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid positive number for your goal.');
        return;
    }


    try {
      const formattedDateForDB = selectedDate.toISOString();

      const result = await db.runAsync(
        'INSERT INTO savings_goals (user_id, target_amount, target_date) VALUES (?, ?, ?)',
        [loggedInUserId, parsedGoalAmount, formattedDateForDB]
      );
      console.log('SavingsPage - INSERT result:', result);


      if (result.changes > 0) {
        console.log('SavingsPage - Goal saved successfully');
        setIsGoalSet(true);
        setGoalDateModalVisible(false); 
        setSavings('0');
      } else {
        console.error('SavingsPage - Error saving savings goal: Insert failed.');
        Alert.alert('Save Error', 'Failed to save your savings goal.');
      }
    } catch (error) {
      console.error('SavingsPage - Error saving savings goal:', error);
      Alert.alert('Database Error', 'An error occurred while saving your goal.');
    }
  };

  const handleStartNewGoal = () => {
    Alert.alert(
        "Start New Goal",
        "Are you sure you want to start a new savings goal? This will clear your current progress.",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Yes",
                onPress: async () => {

                    if (dbReady && loggedInUserId) {
                        try {
                            const latestGoal = await db.getFirstAsync(
                                'SELECT id FROM savings_goals WHERE user_id = ? ORDER BY id DESC LIMIT 1',
                                [loggedInUserId]
                            );

                            if (latestGoal) {
                                await db.runAsync('DELETE FROM savings_goals WHERE id = ?', [latestGoal.id]);
                                console.log(`Deleted goal ${latestGoal.id} and its contributions.`);
                            }

                            setGoal('');
                            setIsGoalSet(false);
                            setSelectedDate(null);
                            setSavings('');
                             console.log('SavingsPage - State reset for new goal.');
                        } catch (error) {
                            console.error('Error starting new goal:', error);
                            Alert.alert('Error', 'Could not start a new goal.');
                        }
                    } else {
                        console.warn('DB not ready or user ID missing, cannot start new goal.');
                    }
                }
            }
        ]
    );
  };


  const pieData = [
    {
      name: 'Saved',
      amount: parsedSavings,
      color: '#00cc99', 
      legendFontColor: '#fff',
      legendFontSize: 14,
    },
    {
      name: 'Remaining',
      amount: remaining, 
      color: '#444', 
      legendFontColor: '#fff', 
      legendFontSize: 14,
    },
  ];

   const chartData = parsedGoal <= 0 ?
   [
       {
           name: 'Saved',
           amount: parsedSavings,
           color: '#00cc99',
           legendFontColor: '#fff',
           legendFontSize: 14,
       },
        {
           name: 'Remaining',
           amount: 1, // Represent as a full circle if goal is 0 or less
           color: '#444',
           legendFontColor: '#fff',
           legendFontSize: 14,
        },
   ]
   : pieData;


  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No date set'; 

  const handleAddFunds = async () => {
    const additional = parseFloat(modalInput);

    if (!dbReady || !loggedInUserId) {
         Alert.alert('Error', 'Database not ready or user not logged in. Please try again.');
         console.warn('SavingsPage - Cannot add funds: DB not ready or user ID missing.');
         return;
    }

    if (isNaN(additional) || additional <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number to add.');
      return;
    }

    if (!isGoalSet) {
      Alert.alert('No Goal Set', 'Please set a savings goal first before adding funds.');
      return;
    }

    try {
      const goalResult = await db.getFirstAsync(
        'SELECT id FROM savings_goals WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [loggedInUserId]
      );

      if (goalResult && goalResult.id) {
        const currentGoalId = goalResult.id;
        const contributionResult = await db.runAsync( 
          'INSERT INTO savings_contributions (savings_goal_id, amount) VALUES (?, ?)',
          [currentGoalId, additional]
        );
       console.log('SavingsPage - Add funds INSERT result:', contributionResult);

        if (contributionResult.changes > 0) {
          console.log('SavingsPage - Savings contribution saved successfully.');
          const currentSavings = parseFloat(savings) || 0;
          setSavings((currentSavings + additional).toFixed(2).toString());
          setModalInput('');
          setModalVisible(false);
        } else {
          console.error('Failed to save savings contribution.');
           Alert.alert('Save Error', 'Failed to save your contribution.');
        }
      } else {
        console.warn('No savings goal found for the current user.');
        Alert.alert('Error', 'Could not find your current savings goal.');
      }
    } catch (error) {
      console.error('Error saving savings contribution:', error);
       Alert.alert('Database Error', 'An error occurred while adding funds.');
    }
  };


  return (
    <LinearGradient colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Savings Goal</Text>
        </View>

        <View style={styles.chartWrapper}>
          <PieChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            hasLegend={false}
          />
        </View>

        <View style={styles.customLegend}>
          {chartData.map((item, index) => (
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
           {!isGoalSet && (
               <Text style={styles.progressMessage}>
                   No savings goal set yet. Tap "Set Goal" below to get started!
               </Text>
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
                maxLength={10}
              />

              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={handleAddFunds}
              >
                <Text style={styles.modalDoneText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {!isGoalSet && ( 
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
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={goalDateModalVisible}
          onRequestClose={() => setGoalDateModalVisible(false)}
        >
          <View style={styles.modalOverlay1}>
            <View style={styles.modalContent1}>
              <Text style={styles.modalTitle1}>{isGoalSet ? 'Current Target' : 'Set Target'}</Text>

              <View style={styles.modalInputBox2}>
                <TextInput
                  style={styles.modalTextInput2}
                  keyboardType="numeric"
                  placeholder="Enter Target Amount:"
                  placeholderTextColor="#999"
                  value={goal}
                  onChangeText={setGoal}
                  editable={!isGoalSet} 
                  maxLength={10} 
                />
              </View>
              <TouchableOpacity onPress={showDatePicker} style={styles.modalInput1} disabled={isGoalSet}>
                <Text style={{ color: selectedDate ? '#fff' : '#999' }}>
                  {selectedDate ? selectedDate.toLocaleDateString() : 'Select Target Date:'}
                </Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
              />

              {!isGoalSet && ( 
                  <TouchableOpacity
                      style={styles.modalDoneButton1}
                      onPress={handleGoalDone}
                  >
                      <Text style={styles.modalDoneText1}>
                          Set Savings Target
                      </Text>
                  </TouchableOpacity>
              )}

               {isGoalSet && ( 
                    <TouchableOpacity
                       style={[styles.modalDoneButton1, {backgroundColor: '#555'}]} 
                       onPress={() => setGoalDateModalVisible(false)}
                   >
                       <Text style={styles.modalDoneText1}>
                           Close
                       </Text>
                   </TouchableOpacity>
               )}


            </View>
          </View>
        </Modal>


        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "If you want to get rich, think of saving as earning"{'\n'}- Andrew Carnegie.
          </Text>
        </View>

        {isGoalSet && parsedSavings >= parsedGoal && (
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