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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState('');
  const [modalTitleColor, setModalTitleColor] = useState('#fff');
  const [inputValue, setInputValue] = useState('');

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
    setModalVisible(false); // Close the modal
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

        <TouchableWithoutFeedback onPress={() => handlePress(1)}>
          <Animated.View
            style={[styles.customBox, { transform: [{ translateY: jumpValue1 }] }]}
          >
            <Text style={styles.boxText}>Income</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handlePress(2)}>
          <Animated.View
            style={[styles.customBox2, { transform: [{ translateY: jumpValue2 }] }]}
          >
            <Text style={styles.boxText2}>Expenses</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handlePress(3)}>
          <Animated.View
            style={[styles.customBox3, { transform: [{ translateY: jumpValue3 }] }]}
          >
            <Text style={styles.boxText3}>Savings</Text>
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

              {/* Row 1 */}
              <View style={styles.calcRow}>
                {['1', '2', '3'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.calcButton}
                    onPress={() => setInputValue(inputValue + num)}
                  >
                    <Text style={styles.calcButtonText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 2 */}
              <View style={styles.calcRow}>
                {['4', '5', '6'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.calcButton}
                    onPress={() => setInputValue(inputValue + num)}
                  >
                    <Text style={styles.calcButtonText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 3 */}
              <View style={styles.calcRow}>
                {['7', '8', '9'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.calcButton}
                    onPress={() => setInputValue(inputValue + num)}
                  >
                    <Text style={styles.calcButtonText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 4 (Delete, 0, Enter) */}
              <View style={styles.calcRow}>
                <TouchableOpacity
                  style={[styles.calcButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={styles.calcButtonText}>Del</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.calcButton, styles.zeroButton]} 
                  onPress={() => setInputValue(inputValue + '0')}
                >
                  <Text style={styles.calcButtonText}>0</Text>
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
    top: -20,
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
    top: -20,
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
    top: -20,
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
    marginBottom: 20,
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  calcRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  calcButton: {
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  calcButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  zeroButton: {
    width: 60, 
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3434',
  },
  enterButton: {
    backgroundColor: '#5BFF66',
  },
});
