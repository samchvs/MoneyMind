import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";  // For calendar


const { width } = Dimensions.get('window');

const categories = [
  'Bills',
  'Food',
  'Entertainment',
  'Transportation',
  'Personal Spending',
  'Savings',
  'Healthcare',
  'Income',
];

const categoryIcons = {
  Bills: 'cash',
  Food: 'food',
  Entertainment: 'movie',
  Transportation: 'car',
  'Personal Spending': 'account',
  Savings: 'bank',
  Healthcare: 'hospital-building',
  Income: 'cash-multiple',
};

export default function ListPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [expenses, setExpenses] = useState({}); // Stores user input for expenses
  const [timePeriod, setTimePeriod] = useState('Daily'); // Default to Daily
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false); // For Calendar
  const [selectedDate, setSelectedDate] = useState(null);

  // Animation for sliding the Plus button
  const [slideAnim] = useState(new Animated.Value(0)); // Start at 0 (hidden)

  const handleCategoryPress = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleCategorySelect = (category) => {
    // Prevent selecting "Income" for editing
    if (category === 'Income') {
      return;
    }
    setSelectedCategory(category);
    setDropdownVisible(false);
    setInputValue('');
  };

  const handleKeypadPress = (value) => {
    if (value === 'delete') {
      handleDelete();
    } else if (value === 'calendar') {
      setIsCalendarVisible(true); // Open the calendar modal
    } else if (value === 'enter') {
      handleEnter(); // Confirm the input and save the value
    } else {
      // Handle normal number and dot input
      if (value === '.' && inputValue.includes('.')) return;
      setInputValue((prev) => prev + value);
    }
  };

  const handleEnter = () => {
    if (timePeriod !== 'Daily') {
      setModalVisible(false);
      return; // Only allow Daily inputs
    }
  
    if (selectedCategory === 'Income') {
      setModalVisible(false);
      return;
    }
  
    const amount = parseFloat(inputValue);
    if (!isNaN(amount)) {
      setExpenses((prev) => ({
        ...prev,
        [selectedCategory]: {
          ...prev[selectedCategory],
          [timePeriod]: amount,
        },
      }));
    }
    setModalVisible(false);
  };

  const handleDelete = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const totalExpenses = Object.entries(expenses)
    .filter(([category]) => category !== 'Income')
    .reduce((acc, [, periodExpenses]) => acc + (periodExpenses[timePeriod] || 0), 0);

  const totalIncome = expenses['Income']?.[timePeriod] || 0;

  const pieData = [
    {
      name: 'Expenses',
      amount: totalExpenses,
      color: '#f9a825',
      legendFontColor: '#fff',
      legendFontSize: 14,
    },
    {
      name: 'Remaining',
      amount: Math.max(totalIncome - totalExpenses, 0),
      color: '#00e676',
      legendFontColor: '#fff',
      legendFontSize: 14,
    },
  ];

  const renderKeypad = () => {
    const numericRows = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', ',']
    ];
  
    return (
      <View style={styles.keypad}>
        <View style={styles.numericKeypad}>
          {/* Numeric buttons */}
          {numericRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.keypadButton,
                    { backgroundColor: '#333' } // Default background for numbers
                  ]}
                  onPress={() => handleKeypadPress(key)}
                >
                  <Text style={styles.keypadText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
  
        <View style={styles.specialButtons}>
          {/* Special buttons (Delete, Calendar, Enter) */}
          <TouchableOpacity
            style={[styles.keypadButton, { backgroundColor: '#ff5c5c' }]} // Red for delete
            onPress={() => handleKeypadPress('delete')}
          >
            <MaterialIcons name="backspace" size={24} color="#fff" />
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.keypadButton, { backgroundColor: '#ccc' }]} // Grey for calendar
            onPress={() => handleKeypadPress('calendar')}
          >
            <MaterialIcons name="calendar-today" size={24} color="#fff" />
          </TouchableOpacity>
  
          {/* Enter button spanning two columns */}
          <TouchableOpacity
            style={[styles.enterButton]}
            onPress={() => handleKeypadPress('enter')}
          >
            <MaterialIcons name="check" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const handlePlusPress = () => {
    Animated.timing(slideAnim, {
      toValue: slideAnim._value === 0 ? -100 : 0, // Toggle between hidden and visible
      duration: 300,
      useNativeDriver: true,
    }).start();
    setModalVisible(true);
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setIsCalendarVisible(false);
  };

  return (
    <LinearGradient
      colors={['#000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <View style={styles.headerSection}>
        <Text style={styles.title}>MoneyLog!</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={handlePlusPress}
          >
            <MaterialIcons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.summaryAmount}>₱{totalExpenses.toFixed(2)}</Text>
      </View>

      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <PieChart
          data={pieData}
          width={width * 0.7}
          height={160}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            color: () => '#fff',
            labelColor: () => '#fff',
            decimalPlaces: 2,
          }}
          accessor="amount"
          backgroundColor="transparent"
          hasLegend
          center={[0, 0]}
          absolute
        />
      </View>

      <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Transaction History</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.filterButton, timePeriod === 'Daily' && styles.activeFilter]}
            onPress={() => setTimePeriod('Daily')}
          >
            <Text style={styles.filterButtonText}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timePeriod === 'Weekly' && styles.activeFilter]}
            onPress={() => setTimePeriod('Weekly')}
          >
            <Text style={styles.filterButtonText}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timePeriod === 'Monthly' && styles.activeFilter]}
            onPress={() => setTimePeriod('Monthly')}
          >
            <Text style={styles.filterButtonText}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.plusButtonAlt}
            onPress={handlePlusPress}
            disabled={timePeriod !== 'Daily'} // Disable on non-daily
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {categories
            .filter(
              (category) =>
                category.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (expenses[category]?.[timePeriod] || 0) > 0 // Show only categories with values
            )
            .map((category) => {
              const isIncome = category === 'Income';
              const categoryAmount = expenses[category]?.[timePeriod] || 0;
              return (
                <TouchableOpacity
                  key={category}
                  style={styles.historyRow}
                  onPress={() => {}}
                >
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryIcon}>
                      <MaterialCommunityIcons name={categoryIcons[category]} size={24} color="#000" />
                    </View>
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                  <Text style={[styles.amountText, isIncome ? styles.amountIncome : styles.amountExpense]}>
                    {isIncome ? '+' : '-'}₱{Math.abs(categoryAmount).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Input Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Dropdown for category selection */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity onPress={handleCategoryPress} style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>{selectedCategory || 'Select Category'}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
              </TouchableOpacity>
              {dropdownVisible && (
                <View style={styles.dropdownList}>
                  {categories.map((category) => (
                    <TouchableOpacity key={category} onPress={() => handleCategorySelect(category)}>
                      <Text style={styles.dropdownItem}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.modalTitle}>Enter Amount for {selectedCategory}</Text>
            <Text style={styles.inputDisplay}>₱{inputValue || '0.00'}</Text>

            {/* Numpad section */}
            <View style={styles.keypadContainer}>
              {renderKeypad()}
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <DateTimePickerModal
        isVisible={isCalendarVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setIsCalendarVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    position: 'relative',
  },
  plusButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -15 }],
    padding: 10,
    backgroundColor: '#f9a825',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#f9a825',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginLeft: 20,
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    marginLeft: 20,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
  },
  historyTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: '#fff',
    flex: 1,
  },
  scrollView: {
    marginBottom: 10,
  },
  historyRow: {
    backgroundColor: '#1c1c1c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountExpense: {
    color: '#ff1744',
  },
  amountIncome: {
    color: '#00e676',
  },
  inputDisplay: {
    fontSize: 30,  // Reduced font size for input value
    color: '#fff',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 16,  // Keep the size for the title, or adjust as needed
    color: '#fff',  // Changed color to white
    marginBottom: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 18,
  },
  dropdownList: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 1,
  },
  dropdownItem: {
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  inputDisplay: {
    fontSize: 40,
    color: '#fff',
    marginBottom: 20,
  },
  keypadContainer: {
    marginTop: 10,
    width: '100%',
    paddingBottom: 20,
  },
  keypad: {
    flexDirection: 'row',  // Use row to place numeric keypad and special buttons side by side
    width: '100%',
    marginTop: 20,
  },
  numericKeypad: {
    flex: 1,  // This takes up the left side of the screen
    justifyContent: 'space-evenly',
    paddingRight: 10,  // Space between numbers and special buttons
  },
  specialButtons: {
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',  // Align buttons to the right side
    width: '44%',  // The width of the right side (adjust as needed)
  },
  keypadRow: {
    flexDirection: 'row',
    width: '100%',
  },
  keypadButton: {
    backgroundColor: '#333', // Default background for normal buttons
    width: '40%',  // Each button takes up 22% width of the row
    paddingVertical: 20,
    alignItems: 'center',
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
  },
  enterButton: {
    width: '44%',
    height: '150',  // Make the 'enter' button span two columns
    backgroundColor: '#000', // Black background for enter
    paddingVertical: 20,
    alignItems: 'center',
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
  },
  keypadText: {
    color: '#fff',
    fontSize: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#333',
    marginRight: 5,
  },
  activeFilter: {
    backgroundColor: '#f9a825',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  plusButtonAlt: {
    backgroundColor: '#f9a825',
    padding: 8,
    borderRadius: 10,
    marginLeft: 5,
  },
});


