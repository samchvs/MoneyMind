import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from './UserContext';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function HomePage({ route }) {
  const username = route?.params?.username;
  const db = useSQLiteContext();
  const { loggedInUser } = useUser();
  const loggedInUserId = loggedInUser?.user_id;
  const isFocused = useIsFocused();

  const [jumpValue1] = useState(new Animated.Value(0));
  const [jumpValue2] = useState(new Animated.Value(0));
  const [jumpValue3] = useState(new Animated.Value(0));
  const [footerIconJump] = useState(new Animated.Value(0));
  const [footerIcon2Jump] = useState(new Animated.Value(0));
  const [footerIcon3Jump] = useState(new Animated.Value(0));
  const [footerIcon4Jump] = useState(new Animated.Value(0));
  const [footerIcon5Jump] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState('');
  const [modalTitleColor, setModalTitleColor] = useState('#fff');
  const [inputValue, setInputValue] = useState('');
  const [incomeValue, setIncomeValue] = useState('0.00');
  const [expenseValue, setExpenseValue] = useState('0.00');
  const [savingsValue, setSavingsValue] = useState('0.00');
  const navigation = useNavigation();

  const [incomeRecordId, setIncomeRecordId] = useState(null);


  const fetchUserData = useCallback(async () => {
    if (db && loggedInUserId) {
      try {
        const incomeResult = await db.getFirstAsync(
          'SELECT id, amount FROM income WHERE user_id = ? LIMIT 1',
          [loggedInUserId]
        );

        if (incomeResult) {
          setIncomeValue(parseFloat(incomeResult.amount).toFixed(2));
          setIncomeRecordId(incomeResult.id);
        } else {
          setIncomeValue('0.00');
          setIncomeRecordId(null);
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        const startOfMonthISO = startOfMonth.toISOString();
        const endOfMonthISO = endOfMonth.toISOString();

        const expensesResult = await db.getFirstAsync(
          'SELECT IFNULL(SUM(amount), 0) AS total_expenses FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
          [loggedInUserId, startOfMonthISO, endOfMonthISO]
        );
        setExpenseValue(parseFloat(expensesResult?.total_expenses || 0).toFixed(2));


        const latestSavingsResult = await db.getFirstAsync(
          'SELECT IFNULL(SUM(sc.amount), 0) AS total_contributed FROM savings_contributions sc ' +
          'INNER JOIN savings_goals sg ON sc.savings_goal_id = sg.id ' +
          'WHERE sg.user_id = ?',
          [loggedInUserId]
        );
        setSavingsValue(parseFloat(latestSavingsResult?.total_contributed || 0).toFixed(2));

      } catch (error) {
        console.error('HomePage - Error fetching user data:', error);
        Alert.alert('Database Error', 'Failed to load user financial data.');
      }
    } else {
      setIncomeValue('0.00');
      setIncomeRecordId(null);
      setExpenseValue('0.00');
      setSavingsValue('0.00');
    }
  }, [db, loggedInUserId]);

  useEffect(() => {
    if (isFocused) {
        fetchUserData();
    }
  }, [fetchUserData, isFocused]);


  const handlePress = (boxName) => {
    let jumpValue;
    let color;

    switch (boxName) {
      case 'Income':
        jumpValue = jumpValue1;
        color = '#3F6FFF';
        setSelectedBox('Income');
        setModalTitleColor(color);
        setInputValue(incomeValue === '0.00' ? '' : incomeValue);
        setModalVisible(true);
        break;
      case 'Expenses':
        jumpValue = jumpValue2;
        color = '#FF3434';
        setSelectedBox('Expenses');
        Alert.alert('Expenses', 'View and add specific expenses on the List page.');
        break;
      case 'Savings':
        jumpValue = jumpValue3;
        color = '#5BFF66';
        setSelectedBox('Savings');
        Alert.alert('Savings', 'Manage savings goals and contributions on the Savings page.');
        break;
      default:
        return;
    }


    Animated.sequence([
      Animated.timing(jumpValue, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(jumpValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const closeModal = () => {
    setModalVisible(false);
    setInputValue('');
    setSelectedBox('');
  };

  const handleKeypadPress = (value) => {
    if (value === 'delete') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (value === 'enter') {
      handleEnter();
    } else {
      if (value === '.' && inputValue.includes('.')) return;
      if (inputValue.includes('.') && inputValue.split('.')[1]?.length >= 2) return;
      setInputValue((prev) => prev + value);
    }
  };


  const handleEnter = async () => {
    if (!db || !loggedInUserId) {
      Alert.alert('Error', 'Database or user not ready.');
      return;
    }

    if (selectedBox !== 'Income') {
        closeModal();
        return;
    }

    const amount = parseFloat(inputValue);

    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number or zero.');
      return;
    }

    const currentDate = new Date().toISOString();

    try {
      let dbResult;
      if (incomeRecordId !== null) {
        dbResult = await db.runAsync(
          'UPDATE income SET amount = ?, date = ? WHERE id = ? AND user_id = ?',
          [amount, currentDate, incomeRecordId, loggedInUserId]
        );
        if (dbResult.changes > 0) {
          Alert.alert('Success', 'Income updated.');
        } else {
           console.warn('Income update failed, attempting insert as fallback.');
           dbResult = await db.runAsync(
               'INSERT INTO income (user_id, amount, date) VALUES (?, ?, ?)',
               [loggedInUserId, amount, currentDate]
           );
           if (dbResult.changes > 0) {
              Alert.alert('Success', 'Income saved (inserted as fallback).');
              setIncomeRecordId(dbResult.lastInsertRowId);
           } else {
              Alert.alert('Error', 'Failed to update or insert income.');
           }
        }
      } else {
        dbResult = await db.runAsync(
          'INSERT INTO income (user_id, amount, date) VALUES (?, ?, ?)',
          [loggedInUserId, amount, currentDate]
        );
        if (dbResult.changes > 0) {
          setIncomeRecordId(dbResult.lastInsertRowId);
          Alert.alert('Success', 'Income saved.');
        } else {
          Alert.alert('Error', 'Failed to save income.');
        }
      }

      const updatedIncomeResult = await db.getFirstAsync(
        'SELECT id, amount FROM income WHERE user_id = ? LIMIT 1',
        [loggedInUserId]
      );
       if (updatedIncomeResult) {
           setIncomeValue(parseFloat(updatedIncomeResult.amount).toFixed(2));
           setIncomeRecordId(updatedIncomeResult.id);
       } else {
           setIncomeValue('0.00');
           setIncomeRecordId(null);
       }

      fetchUserData();

      closeModal();


    } catch (error) {
      console.error(`Database error saving ${selectedBox}:`, error);
      Alert.alert('Database Error', `An error occurred while saving your ${selectedBox.toLowerCase()}.`);
    }
  };


  const renderKeypad = () => {
  const numericKeys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', '']];
  return (
    <View style={styles.keypad}>
      <View style={styles.numericKeypad}>
        {numericKeys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, colIndex) => (
              <TouchableOpacity
                key={key || `empty-${rowIndex}-${colIndex}`}
                style={[styles.keypadButton, styles.numericButton]}
                onPress={() => handleKeypadPress(key)}
                disabled={key === ''}
              >
                <Text style={styles.keypadText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.specialButtons}>
        <TouchableOpacity 
          style={[styles.keypadButton, styles.deleteButton]} 
          onPress={() => handleKeypadPress('delete')}
        >
          <MaterialIcons name="backspace" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.keypadButton, styles.enterButton]} 
          onPress={() => handleKeypadPress('enter')}
        >
          <MaterialIcons name="check" size={36} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome,</Text>
            <Text style={styles.username}>{username}!</Text>
            <Text style={styles.wallet}>Your Wallet</Text>
          </View>
          <TouchableOpacity onPress={() => {}}>
             <Image
               source={require('./assets/settings_icon.png')}
               style={styles.icon}
             />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>

        <TouchableOpacity
        activeOpacity={0.7}
        style={{ alignItems: 'center', marginHorizontal: 20 }}
        onPress={() => {
          Animated.sequence([
            Animated.timing(footerIconJump, {
              toValue: -10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(footerIconJump, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.navigate('ListPage', { username });
          });
        }}
      >
        <Animated.Image
          source={require('./assets/list.png')}
          style={[
            styles.footerIcon,
            { transform: [{ translateY: footerIconJump }] },
          ]}
        />
        <Text style={styles.footerIconText}>List</Text>
      </TouchableOpacity>


        <TouchableOpacity
            activeOpacity={0.7}
            style={{ alignItems: 'center', marginHorizontal: 20 }}
            onPress={() => {
              Animated.sequence([
                Animated.timing(footerIcon2Jump, {
                  toValue: -10,
                  duration: 100,
                  useNativeDriver: true,
                }),
                Animated.timing(footerIcon2Jump, {
                  toValue: 0,
                  duration: 100,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                navigation.navigate('SavingsPage', { username });
              });
            }}
          >
        <Animated.Image
          source={require('./assets/savingsIcon.png')}
          style={[
            styles.footerIcon2,
            { transform: [{ translateY: footerIcon2Jump }] },
          ]}
        />
        <Text style={styles.footerIcon2Text}>Savings</Text>
      </TouchableOpacity>

      <TouchableOpacity
            activeOpacity={0.7}
            style={{ alignItems: 'center', marginHorizontal: 20 }}
            onPress={() => {
              Animated.sequence([
                Animated.timing(footerIcon3Jump, {
                  toValue: -10,
                  duration: 100,
                  useNativeDriver: true,
                }),
                Animated.timing(footerIcon3Jump, {
                  toValue: 0,
                  duration: 100,
                  useNativeDriver: true,
                }),
              ]).start(() => {
              });
            }}
          >
        <Animated.Image
          source={require('./assets/home.png')}
          style={[
            styles.footerIcon3,
            { transform: [{ translateY: footerIcon3Jump }] },
          ]}
        />
        <Text style={[styles.footerIcon3Text, { color: '#fff' }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
      activeOpacity={0.7}
      style={{ alignItems: 'center', marginHorizontal: 20 }}
      onPress={() => {
        Animated.sequence([
          Animated.timing(footerIcon4Jump, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(footerIcon4Jump, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.navigate('WalletPage', {
            income: incomeValue,
            monthlyExpenses: expenseValue,
            totalSavings: savingsValue,
          });
        });
      }}
    >
      <Animated.Image
        source={require('./assets/walletIcon.png')}
        style={[
          styles.footerIcon4,
          { transform: [{ translateY: footerIcon4Jump }] },
        ]}
      />
      <Text style={styles.footerIcon4Text}>Budget</Text>
    </TouchableOpacity>

      <TouchableOpacity
      activeOpacity={0.7}
      style={{ alignItems: 'center', marginHorizontal: 20 }}
      onPress={() => {
        Animated.sequence([
          Animated.timing(footerIcon5Jump, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(footerIcon5Jump, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.navigate('AiPage', { username });
        });
      }}
    >
      <Animated.Image
        source={require('./assets/AiIcon.png')}
        style={[
          styles.footerIcon5,
          { transform: [{ translateY: footerIcon5Jump }] },
        ]}
      />
      <Text style={styles.footerIcon5Text}>AI</Text>
    </TouchableOpacity>


        </View>

        <TouchableWithoutFeedback onPress={() => handlePress('Income')}>
          <Animated.View
            style={[styles.customBox, { transform: [{ translateY: jumpValue1 }] }]}
          >
            <Text style={styles.boxText}>Income</Text>
            <Text style={styles.boxValueText}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}>₱{incomeValue}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handlePress('Expenses')}>
          <Animated.View
            style={[styles.customBox2, { transform: [{ translateY: jumpValue2 }] }]}
          >
            <Text style={styles.boxText2}>Expenses</Text>
            <Text style={styles.boxValueText}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}>₱{expenseValue}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handlePress('Savings')}>
          <Animated.View
            style={[styles.customBox3, { transform: [{ translateY: jumpValue3 }] }]}
          >
            <Text style={styles.boxText3}>Savings</Text>
            <Text style={styles.boxValueText}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}>₱{savingsValue}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

       <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: modalTitleColor }]}>
                Enter Income Amount
              </Text>

              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              <Text style={styles.modalInputDisplay}>₱{inputValue || '0.00'}</Text>
              <View style={styles.divider} />

              <View style={styles.keypadContainer}>
                {renderKeypad()}
              </View>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: screenWidth - 40,
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 30,
  },
  title: {
    fontSize: 16,
    color: '#aaaaaa',
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  icon: {
    width: 28,
    height: 28,
    marginTop: 5,
    tintColor: '#fff',
  },
  wallet: {
    fontSize: 38,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
  },
  customBox: {
    position: 'absolute',
    width: (screenWidth / 2) - 30,
    height: 90,
    left: 20,
    top: 220,
    backgroundColor: '#2E2E2E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  boxText: {
    color: '#3F6FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  customBox2: {
    position: 'absolute',
    width: (screenWidth / 2) - 30,
    height: 90,
    right: 20,
    top: 220,
    backgroundColor: '#2E2E2E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  boxText2: {
    color: '#FF3434',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  customBox3: {
    position: 'absolute',
    width: (screenWidth / 2) - 30,
    height: 90,
    left: screenWidth / 2 - ((screenWidth / 2) - 30) / 2,
    top: 320,
    backgroundColor: '#2E2E2E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  boxText3: {
    color: '#5BFF66',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  boxValueText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
 modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
},
  modalContent: {
    width: screenWidth * 0.9,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    padding: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
   modalInputDisplay: {
    fontSize: 36,
    color: '#fff',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 10,
    width: '100%',
  },
 keypadContainer: {
    marginTop: 10,
    width: '100%',
    paddingBottom: 10,
    alignItems: 'center',
  },
  keypad: {
    width: '93%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numericKeypad: {
    flex: 3,
    flexDirection: 'column',
  },
   keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
 keypadButton: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 65,
    flex: 1,
    marginHorizontal: 5,
  },
  numericButton: {
    backgroundColor: '#2c2c2c',
  },
  deleteButton: {
    backgroundColor: '#ff5c5c',
  },
  enterButton: {
    backgroundColor: '#00e676',
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
  },
  keypadText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    width: screenWidth,
    height: 80,
    bottom: 0,
    left: 0,
    backgroundColor: '#171717',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  footerIcon: {
    width: 28,
    height: 28,
    tintColor: '#aaaaaa',
  },
  footerIconText: {
    fontSize: 11,
    color: '#aaaaaa',
    marginTop: 4,
  },
  footerIcon2: {
    width: 28,
    height: 28,
    tintColor: '#aaaaaa',
  },
  footerIcon2Text: {
    fontSize: 11,
    color: '#aaaaaa',
    marginTop: 4,
  },
  footerIcon3: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  footerIcon3Text: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  footerIcon4: {
    width: 28,
    height: 28,
    tintColor: '#aaaaaa',
  },
  footerIcon4Text: {
    fontSize: 11,
    color: '#aaaaaa',
    fontWeight: 'bold',
    marginTop: 4,
  },
  footerIcon5: {
    width: 28,
    height: 28,
    tintColor: '#aaaaaa',
  },
  footerIcon5Text: {
    fontSize: 11,
    color: '#aaaaaa',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#444',
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});