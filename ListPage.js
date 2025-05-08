
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSQLiteContext } from 'expo-sqlite';
import { InitializeDatabase } from './RegisterPage';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const selectableCategories = [
  'Bills',
  'Food',
  'Entertainment',
  'Transportation',
  'Personal Spending',
  'Savings',
  'Healthcare'
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
  default: 'cash',
};

const timePeriodOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function ListPage() {
  const db = useSQLiteContext();
  const { loggedInUser } = useUser();
  const loggedInUserId = loggedInUser?.user_id;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [allTransactions, setAllTransactions] = useState([]);
  const [timePeriod, setTimePeriod] = useState('Daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [timePeriodDropdownVisible, setTimePeriodDropdownVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dbReady, setDbReady] = useState(false);
  const [totalOverallIncome, setTotalOverallIncome] = useState(0);

  useEffect(() => {
    const setupDatabase = async () => {
      if (db) {
        try {
          await InitializeDatabase(db);
          setDbReady(true);
        } catch (e) {
          console.error("Failed to initialize database:", e);
          Alert.alert('Database Error', 'Failed to initialize the database.');
        }
      }
    };
    setupDatabase();
  }, [db]);

  const loadTransactions = useCallback(async () => {
    if (db && loggedInUserId) {
      try {
        const expensesResult = await db.getAllAsync(
          'SELECT id, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC',
          [loggedInUserId]
        );
        const incomeResult = await db.getAllAsync(
          'SELECT id, amount, date FROM income WHERE user_id = ? ORDER BY date DESC, id DESC',
          [loggedInUserId]
        );

        const combinedTransactions = [
          ...expensesResult.map(tx => ({ ...tx, type: 'expense' })),
          ...incomeResult.map(tx => ({ ...tx, type: 'income', category: 'Income' })),
        ];
        combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllTransactions(combinedTransactions);

        const overallIncomeSum = incomeResult.reduce((sum, tx) => sum + tx.amount, 0);
        setTotalOverallIncome(overallIncomeSum);

      } catch (error) {
        console.error("Failed to load transactions:", error);
        Alert.alert('Database Error', 'Failed to load transaction data.');
      }
    } else {
      setAllTransactions([]);
      setTotalOverallIncome(0);
    }
  }, [db, loggedInUserId]);

  useEffect(() => {
    if (dbReady && loggedInUserId) {
      loadTransactions();
    } else if (dbReady && !loggedInUserId) {
      setAllTransactions([]);
      setTotalOverallIncome(0);
    }
  }, [dbReady, loggedInUserId, loadTransactions]);


  const handleCategoryPress = () => {
    setCategoryDropdownVisible(!categoryDropdownVisible);
    setTimePeriodDropdownVisible(false);
  };

  const handleTimePeriodPress = () => {
    setTimePeriodDropdownVisible(!timePeriodDropdownVisible);
    setCategoryDropdownVisible(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategoryDropdownVisible(false);
    setInputValue('');
  };

  const handleTimePeriodSelect = (period) => {
    setTimePeriod(period);
    setTimePeriodDropdownVisible(false);
  };

  const handleKeypadPress = (value) => {
    if (value === 'delete') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (value === 'calendar') {
      setIsCalendarVisible(true);
    } else if (value === 'enter') {
      handleEnter();
    } else {
      if (value === '.' && inputValue.includes('.')) return;
      if (inputValue.includes('.') && inputValue.split('.')[1]?.length >= 2) return;
      setInputValue((prev) => prev + value);
    }
  };

  const handleEnter = async () => {
    if (!dbReady || !loggedInUserId) {
      Alert.alert('Error', 'Database not ready or user not logged in.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select an expense category.');
      return;
    }
    const amount = parseFloat(inputValue);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for the expense.');
      return;
    }

    const dateToSave = selectedDate || new Date();
    const formattedDateForDB = dateToSave.toISOString();

    try {
      const result = await db.runAsync(
        'INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, ?)',
        [loggedInUserId, amount, selectedCategory, formattedDateForDB]
      );

      if (result.changes > 0 || result.lastInsertRowId > 0) {
        loadTransactions();

        setModalVisible(false);
        setInputValue('');
        setSelectedCategory('');
        setSelectedDate(new Date());
      } else {
        Alert.alert('Save Error', `Failed to save your expense.`);
      }
    } catch (error) {
      console.error('Insert error:', error);
      Alert.alert('Database Error', `An error occurred while saving your expense.`);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    if (!dbReady || !loggedInUserId) {
      Alert.alert('Error', 'Database not ready or user not logged in.');
      return;
    }

    const table = transaction.type === 'expense' ? 'expenses' : 'income';

    try {
      const result = await db.runAsync(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`, [transaction.id, loggedInUserId]);

      if (result.changes > 0) {
        loadTransactions();
        Alert.alert('Success', `${transaction.type === 'expense' ? 'Expense' : 'Income'} deleted successfully.`);
      } else {
        Alert.alert('Delete Error', `Failed to delete the ${transaction.type}.`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Database Error', `An error occurred while deleting the ${transaction.type}.`);
    }
  };

  const filterTransactionsByPeriod = (transactionsToFilter, period) => {
    return transactionsToFilter.filter(transaction => {
      if (!transaction.date) return false;
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

      let periodStart, periodEnd;

      switch (period) {
        case 'Daily':
          periodStart = todayStart;
          periodEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          return transactionDate >= periodStart && transactionDate <= periodEnd;
        case 'Weekly':
          const dayOfWeek = todayStart.getDay();
          periodStart = new Date(todayStart);
          periodStart.setDate(todayStart.getDate() - dayOfWeek);
          periodStart.setHours(0, 0, 0, 0);

          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodStart.getDate() + 6);
          periodEnd.setHours(23, 59, 59, 999);

          return transactionDate >= periodStart && transactionDate <= periodEnd;
        case 'Monthly':
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
          periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          return transactionDate >= periodStart && transactionDate <= periodEnd;
        case 'Yearly':
          periodStart = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
          periodEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
          return transactionDate >= periodStart && transactionDate <= periodEnd;
        default:
          return true;
      }
    });
  };


  const transactionsForPeriod = filterTransactionsByPeriod(allTransactions, timePeriod);

  const calculateTotals = (transactionsToSum) => {
    let totalExp = 0;
    let totalInc = 0;
    transactionsToSum.forEach(transaction => {
      if (transaction.type === 'expense') totalExp += transaction.amount;
      else if (transaction.type === 'income') totalInc += transaction.amount;
    });
    return { totalExp, totalInc };
  };

  const { totalExp: currentTotalExpenses, totalInc: currentTotalIncome } = calculateTotals(transactionsForPeriod);

  const pieChartData = () => {
    const data = [];
    const categoryExpenses = transactionsForPeriod
        .filter(tx => tx.type === 'expense' && tx.category !== 'Income')
        .reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {});

    Object.entries(categoryExpenses).forEach(([category, amount], index) => {
        const colors = ['#42a5f5', '#66bb6a', '#ffee58', '#ff7043', '#ab47bc', '#ef5350', '#26a69a'];
        const color = colors[index % colors.length];
        data.push({
            name: category,
            amount: parseFloat(amount.toFixed(2)),
            color: color,
            legendFontColor: '#fff',
            legendFontSize: 12
        });
    });


    if (data.length === 0) {
      data.push({ name: 'No Data', amount: 1, color: '#555', legendFontColor: '#fff', legendFontSize: 14 });
    }
    return data;
  };
  const currentPieData = pieChartData();

  const renderKeypad = () => {
    const numericKeys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', '']];
    return (
      <View style={styles.keypad}>
        <View style={styles.numericKeypad}>
          {numericKeys.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key || `empty-${rowIndex}-${Math.random()}`}
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
          <TouchableOpacity style={[styles.keypadButton, styles.deleteButton]} onPress={() => handleKeypadPress('delete')}>
            <MaterialIcons name="backspace" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.keypadButton, styles.calendarButton]}
            onPress={() => handleKeypadPress('calendar')}
          >
            <MaterialIcons name="calendar-today" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.enterButton} onPress={() => handleKeypadPress('enter')}>
            <MaterialIcons name="check" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handlePlusPress = () => {
    setInputValue('');
    setSelectedCategory('');
    setSelectedDate(new Date());
    setCategoryDropdownVisible(false);
    setTimePeriodDropdownVisible(false);
    setModalVisible(true);
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setIsCalendarVisible(false);
  };

  const historyListData = transactionsForPeriod.filter(transaction =>
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedIncome = timePeriod === 'Yearly' ? totalOverallIncome * 12 : currentTotalIncome;
  const displayedBalance = timePeriod === 'Yearly' ? (totalOverallIncome * 12) - currentTotalExpenses : currentTotalIncome - currentTotalExpenses;

  return (
    <LinearGradient colors={['#000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']} style={styles.container}>
      {!dbReady && (
        <View style={styles.fullScreenOverlay}><Text style={styles.loadingText}>Loading database...</Text></View>
      )}
      {!loggedInUser && dbReady && (
        <View style={styles.fullScreenOverlay}><Text style={styles.loadingText}>Please log in to view data.</Text></View>
      )}

      {dbReady && loggedInUser && (
        <>
          <View style={styles.headerSection}>
            <Text style={styles.title}>MoneyLog!</Text>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses ({timePeriod})</Text>
                <Text style={styles.summaryAmountExpense}>₱{currentTotalExpenses.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income ({timePeriod})</Text>
                <Text style={styles.summaryAmountIncome}>₱{displayedIncome.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance ({timePeriod})</Text>
            <Text style={styles.balanceAmount}>₱{displayedBalance.toFixed(2)}</Text>
          </View>

          <View style={styles.chartContainer}>
            {currentPieData.length > 0 && !(currentPieData.length === 1 && currentPieData[0].name === 'No Data') ? (
              <PieChart
                data={currentPieData}
                width={width * 0.8}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  decimalPlaces: 2,
                }}
                accessor="amount"
                backgroundColor="transparent"
                hasLegend={false}
                center={[(width * 0.8) / 2 - (width * 0.1), 10]}
                absolute
              />
            ) : (
              <View style={styles.noChartDataContainer}>
                <Text style={styles.noChartDataText}>No data for chart in this period.</Text>
                <Text style={styles.noChartDataSubText}>Add expenses or check filter.</Text>
              </View>
            )}
            {currentPieData.length > 0 && !(currentPieData.length === 1 && currentPieData[0].name === 'No Data') && (
              <View style={styles.chartLegend}>
                {currentPieData.map((item, index) => (
                  item.name !== 'No Data' && (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.name}: ₱{item.amount.toFixed(2)}</Text>
                    </View>
                   )
                ))}
              </View>
            )}
          </View>

          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Transaction History</Text>
              <View style={styles.filterDropdownContainer}>
                <TouchableOpacity onPress={handleTimePeriodPress} style={styles.filterDropdownButton}>
                  <Text style={styles.filterDropdownButtonText}>{timePeriod}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#fff" />
                </TouchableOpacity>
                {timePeriodDropdownVisible && (
                  <View style={styles.filterDropdownList}>
                    <ScrollView contentContainerStyle={styles.filterDropdownScrollViewContent} nestedScrollEnabled={true}>
                      {timePeriodOptions.map((option, index) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.filterDropdownItem,
                            index === timePeriodOptions.length - 1 && styles.filterDropdownItemLast
                          ]}
                          onPress={() => handleTimePeriodSelect(option)}
                        >
                          <Text style={styles.filterDropdownItemText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search category..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} nestedScrollEnabled={true}>
              {historyListData.length > 0 ? (
                <>
                  {historyListData.map((transaction) => {
                    const isIncome = transaction.type === 'income';
                    const amountColorStyle = isIncome ? styles.amountIncome : styles.amountExpense;
                    return (
                      <TouchableOpacity
                        key={`${transaction.type}-${transaction.id}-${transaction.date}`}
                        style={styles.historyRow}
                        onPress={() =>
                          Alert.alert(
                            "Delete Transaction",
                            `Are you sure you want to delete this ${transaction.type === 'expense' ? 'expense' : 'income'} of ₱${transaction.amount.toFixed(2)}?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              { text: "Delete", onPress: () => handleDeleteTransaction(transaction), style: "destructive" }
                            ]
                          )
                        }
                      >
                        <View style={styles.categoryInfo}>
                          <View style={styles.categoryIcon}>
                            <MaterialCommunityIcons name={categoryIcons[transaction.category] || categoryIcons.default} size={24} color="#000" />
                          </View>
                          <View>
                            <Text style={styles.categoryName}>{transaction.category}</Text>
                            <Text style={styles.transactionDate}>
                              {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'No Date'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.amountText, amountColorStyle]}>
                          {isIncome ? '+' : '-'}₱{Math.abs(transaction.amount).toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : (
                <Text style={styles.noTransactionsText}>No transactions found for this period/search.</Text>
              )}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.fabPlusButton} onPress={handlePlusPress}>
            <MaterialIcons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity onPress={handleCategoryPress} style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>{selectedCategory || 'Select Category'}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
              </TouchableOpacity>
              {categoryDropdownVisible && (
                <View style={styles.dropdownList}>
                  <ScrollView contentContainerStyle={styles.dropdownScrollViewContent} nestedScrollEnabled={true}>
                    {selectableCategories.map((category, index) => (
                      <View
                        key={category}
                        style={[
                          styles.dropdownItemContainer,
                          index === selectableCategories.length - 1 && styles.dropdownItemContainerLast
                        ]}
                      >
                        <TouchableOpacity onPress={() => handleCategorySelect(category)}>
                          <Text style={styles.dropdownItem}>{category}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.modalTitle}>Enter Amount {selectedCategory ? `for ${selectedCategory}` : ''}</Text>
            <Text style={styles.inputDisplay}>₱{inputValue || '0.00'}</Text>

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

      <DateTimePickerModal
        isVisible={isCalendarVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setIsCalendarVisible(false)}
        maximumDate={new Date()}
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
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  summaryAmountExpense: {
    color: '#ff1744',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 2,
  },
  summaryAmountIncome: {
    color: '#00e676',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 2,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  balanceLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  noChartDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    width: '100%',
    padding: 15,
  },
  noChartDataText: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 5,
    textAlign: 'center',
  },
  noChartDataSubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  fabPlusButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f9a825',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 80,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 200,
  },
  historyTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
    zIndex: 100,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  noTransactionsText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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
  transactionDate: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountIncome: {
    color: '#00e676',
  },
  amountExpense: {
    color: '#ff1744',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1e1e1e',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownContainer: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
    zIndex: 300,
  },
  dropdownButton: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    borderColor: '#444',
    borderWidth: 1,
    zIndex: 310,
    maxHeight: 350,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownScrollViewContent: {
    paddingVertical: 0,
  },
  dropdownItemContainer: {
    width: '100%',
  },
  dropdownItemContainerLast: {
    borderBottomWidth: 0,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputDisplay: {
    fontSize: 40,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  keypadContainer: {
    marginTop: 10,
    width: '100%',
    paddingBottom: 10,
    zIndex: 0,
  },
  keypad: {
    flexDirection: 'row',
    width: '100%',
  },
  numericKeypad: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  specialButtons: {
    flex: 1,
    flexDirection: 'column',
    //justifyContent: 'space-evenly', // Adjust as needed: 'space-around', 'space-between'
    alignItems: 'center',
    paddingLeft: 5,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 5,
    
  },
  keypadButton: {
    backgroundColor: '#333',
    aspectRatio: 1,
    flex: 1,
    margin: 3,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numericButton: {
    backgroundColor: '#2c2c2c',
  },
  deleteButton: {
    backgroundColor: '#ff5c5c',
  },
  calendarButton: {
    backgroundColor: '#555',
    marginBottom: 5,
  },
  enterButton: {
    backgroundColor: '#00e676',
    flexGrow: 1,
    minHeight: 100,
    width: 58,
    borderRadius: 10,
  },
  disabledKeypadButton: {
    opacity: 0.5,
  },
  keypadText: {
    color: '#fff',
    fontSize: 28,
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
  filterDropdownContainer: {
    position: 'relative',
    zIndex: 200,
  },
  filterDropdownButton: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterDropdownButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterDropdownList: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#333',
    borderRadius: 10,
    borderColor: '#444',
    borderWidth: 1,
    zIndex: 210,
    maxHeight: 150,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    minWidth: 100,
  },
  filterDropdownScrollViewContent: {
    paddingVertical: 5,
  },
  filterDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  filterDropdownItemLast: {
    borderBottomWidth: 0,
  },
  filterDropdownItemText: {
    color: '#fff',
    fontSize: 14,
  },
});
