import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

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

export default function Listpage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [expenses, setExpenses] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
    setInputValue('');
  };

  const handleEnter = () => {
    const amount = parseFloat(inputValue);
    if (!isNaN(amount)) {
      setExpenses((prev) => ({
        ...prev,
        [selectedCategory]: (prev[selectedCategory] || 0) + amount,
      }));
    }
    setModalVisible(false);
  };

  const handleDelete = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const totalExpenses = Object.entries(expenses)
    .filter(([key]) => key !== 'Income')
    .reduce((acc, [, val]) => acc + val, 0);

  const totalIncome = expenses['Income'] || 0;

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

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.username}>MoneyLog!</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Expenses</Text>
        <Text style={styles.summaryAmount}>₱{totalExpenses.toFixed(2)}</Text>

        <View style={{ alignItems: 'center', width: '100%' }}>
            <PieChart
            data={pieData}
            width={width * 0.7} // Slightly smaller than screen width
            height={150}
            chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                color: () => '#fff',
                labelColor: () => '#fff',
            }}
            accessor="amount"
            backgroundColor="transparent"
            hasLegend={false}
            center={[0, 0]}
            absolute
            />
        </View>

        <Text style={styles.percentText}>
            {totalIncome === 0 ? '0%' : `${Math.round((totalExpenses / totalIncome) * 100)}%`}
        </Text>
        </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Transaction History</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#aaa"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        <ScrollView>
          {categories
            .filter((cat) =>
              cat.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((category) => {
              const value = expenses[category] || 0;
              const isIncome = category === 'Income';
              return (
                <TouchableOpacity
                  key={category}
                  style={styles.historyRow}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryIcon}>
                      <Text style={{ fontSize: 16 }}>🏷️</Text>
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{category}</Text>
                      <Text style={styles.paymentMethod}>
                        {isIncome ? 'Online Transfer' : 'Cash'}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.amountText,
                      isIncome ? styles.amountIncome : styles.amountExpense,
                    ]}
                  >
                    {isIncome ? '+' : '-'}₱{Math.abs(value).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Modal Keypad */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedCategory}</Text>
            <Text style={styles.inputDisplay}>{inputValue}</Text>
            <View style={styles.keypad}>
              {['1','2','3','4','5','6','7','8','9','0','.'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keypadButton}
                  onPress={() => setInputValue((prev) => prev + key)}
                >
                  <Text style={styles.keypadText}>{key}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.keypadButton} onPress={handleDelete}>
                <Text style={styles.keypadText}>Del</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.enterButton} onPress={handleEnter}>
                <Text style={styles.keypadText}>Enter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  welcome: {
    fontSize: 18,
    color: '#aaa',
  },
  username: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#2a2a2a',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    color: '#f9a825',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  percentText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color: '#fff',
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
  paymentMethod: {
    color: '#aaa',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    margin: 30,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputDisplay: {
    fontSize: 30,
    color: '#0f0',
    textAlign: 'center',
    marginVertical: 10,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  keypadButton: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    width: 70,
    alignItems: 'center',
    margin: 5,
  },
  keypadText: {
    color: '#fff',
    fontSize: 20,
  },
  enterButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
    marginTop: 10,
  },
});
