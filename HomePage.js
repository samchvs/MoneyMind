import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomePage({ route }) {
  const username = route?.params?.username;
  const [jumpValue1] = useState(new Animated.Value(0));
  const [jumpValue2] = useState(new Animated.Value(0));
  const [jumpValue3] = useState(new Animated.Value(0));
  const [footerIconJump] = useState(new Animated.Value(0));
  const [footerIcon2Jump] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState('');
  const [modalTitleColor, setModalTitleColor] = useState('#fff');
  const [inputValue, setInputValue] = useState('');
  const [incomeValue, setIncomeValue] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [savingsValue, setSavingsValue] = useState('');
  

  const handlePress = (boxNumber) => {
    let jumpValue;
    switch (boxNumber) {
      case 1:
        jumpValue = jumpValue1;
        setSelectedBox('Income');
        setModalTitleColor('#3F6FFF');
        break;
      case 2:
        jumpValue = jumpValue2;
        setSelectedBox('Expenses');
        setModalTitleColor('#FF3434');
        break;
      case 3:
        jumpValue = jumpValue3;
        setSelectedBox('Savings');
        setModalTitleColor('#5BFF66');
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

    setInputValue('');
    setModalVisible(true);
  };
  

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleDelete = () => {
    setInputValue(inputValue.slice(0, -1)); //delete last number
  };

  const handleEnter = () => {
    // Perform action for entering the value 
    console.log('Entered value:', inputValue);
    if (selectedBox === 'Income') {
      setIncomeValue(inputValue);
    } else if (selectedBox === 'Expense') {
      setExpenseValue(inputValue);
    } else if (selectedBox === 'Savings') {
      setSavingsValue(inputValue);
    }
    setModalVisible(false); // Close the modal
  };
  const handleFooterIconPress = () => {
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
    ]).start();
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
          <Image
            source={require('./assets/settings_icon.png')}
            style={styles.icon}
          />
        </View>

        <View style={styles.footer}>
          {/* List Icon */}
          <TouchableWithoutFeedback onPress={handleFooterIconPress}>
           <Animated.View style={{ alignItems: 'center', marginHorizontal: 20 }}>
            <Animated.Image
              source={require('./assets/list.png')}
              style={[
                styles.footerIcon,
                { transform: [{ translateY: footerIconJump }] },
              ]}
            />
            <Text style={styles.footerIconText}>List</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
          
          {/* Savings Icon */}
          <TouchableWithoutFeedback 
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
          ]).start();
        }}
      >
      <Animated.View style={{ alignItems: 'center' }}>
        <Animated.Image
          source={require('./assets/savingsIcon.png')}
          style={[
            styles.footerIcon2, 
            { transform: [{ translateY: footerIcon2Jump }] },
          ]}
        />
        <Text style={styles.footerIcon2Text}>Save</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
        </View>

        <TouchableWithoutFeedback onPress={() => {handlePress(1)
          setSelectedBox('Income')
          setInputValue(incomeValue)
          setModalVisible(true);
        }}>
          <Animated.View
            style={[styles.customBox, { transform: [{ translateY: jumpValue1 }] }]}
          >
            <Text style={styles.boxText}>Income</Text>
            <Text style={styles.inputDisplay}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}>{incomeValue}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => {handlePress(2)
          setSelectedBox('Expense')
          setInputValue(expenseValue)
          setModalVisible(true)
        }}
          >
          <Animated.View
            style={[styles.customBox2, { transform: [{ translateY: jumpValue2 }] }]}
          >
            
            <Text style={styles.boxText2}>Expenses</Text>
            <Text style={styles.inputDisplay}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}>{expenseValue}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => {handlePress(3)
          setSelectedBox('Savings')
          setInputValue(savingsValue)
          setModalVisible(true)
        }}>
          <Animated.View
            style={[styles.customBox3, { transform: [{ translateY: jumpValue3 }] }]}
          >
            <Text style={styles.boxText3}>Savings</Text>
            <Text style={styles.inputDisplay}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}>{savingsValue}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: modalTitleColor }]}>
                {selectedBox}
              </Text>

              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              {/* Input display */}
              <Text style={styles.inputDisplay}>{inputValue}</Text>
              <View style={styles.divider} />
              {/* Keypad layout: 3x4 grid + 1x4 column */}
              <View style={styles.calcGridContainer}>
                {/* Number Grid */}
                <View style={styles.numberGrid}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={styles.calcButton}
                      onPress={() => setInputValue(inputValue + num)}
                    >
                      <Text style={styles.calcButtonText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Action Column */}
                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    style={[styles.calcButton, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.calcButtonText}>Del</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.calcButton}
                    onPress={() => setInputValue(inputValue + ',')}
                  >
                    <Text style={styles.calcButtonText}>,</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.calcButton}
                    onPress={() => setInputValue(inputValue + '.')}
                  >
                    <Text style={styles.calcButtonText}>.</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.calcButton, styles.enterButton]}
                    onPress={handleEnter}
                  >
                    <Text style={styles.calcButtonText}>Enter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: width - 40,
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
  icon: {
    width: 24,
    height: 24,
    marginRight: -40,
    marginTop: 7,
  },
  wallet: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 30,
  },
  customBox: {
    position: 'absolute',
    width: 146,
    height: 82,
    left: 27,
    top: 200,
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: '#3F6FFF',
    fontSize: 14,
    fontWeight: 'bold',
    top: -12,
  },
  customBox2: {
    position: 'absolute',
    width: 146,
    height: 82,
    left: 213,
    top: 200,
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText2: {
    color: '#FF3434',
    fontSize: 14,
    fontWeight: 'bold',
    top: -12,
  },
  customBox3: {
    position: 'absolute',
    width: 146,
    height: 82,
    left: 122,
    top: 300,
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText3: {
    color: '#5BFF66',
    fontSize: 14,
    fontWeight: 'bold',
    top: -12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    position: 'absolute',
    width: 330,
    height: 520,
    left: 27,
    top: 184,
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F6FFF',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputDisplay: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 0,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#aaa',
    marginVertical: 5,
    width: '100%',
  },
  calcGridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 210, // Adjust based on button size
    justifyContent: 'center',
  },
  
  actionColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  
  calcButton: {
    width: 60,
    height: 60,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  
  calcButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  deleteButton: {
    backgroundColor: '#f88',
  },
  
  enterButton: {
    backgroundColor: '#8f8',
  },
  footer: {
    position: 'absolute',
    width: 393,
    height: 100,
    left: -3,
    top: 740,
    backgroundColor: '#2E2E2E',
    borderRadius: 40,
  },
  footerIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 20,
    top: 15, 
  },
  footerIconText: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 33,
    top: 52, 
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  footerIcon2: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 120, 
    top: 12,   
  },
  footerIcon2Text: {
    position: 'absolute',
    width: 60,
    height: 40,
    left: 125, 
    top: 52,   
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: 'bold',
  },

});