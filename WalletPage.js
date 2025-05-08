import React from 'react'; 
import { View, Text, StyleSheet, Image,TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const handleFilterPress = () => {
  // Add your filter logic here
  console.log('Filter pressed!');
};

useEffect(() => {
  if (loggedInUser) {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT income FROM income_table WHERE username = ?;',
        [loggedInUser],
        (_, { rows }) => {
          if (rows.length > 0) {
            setIncome(rows.item(0).income);
          }
        }
      );
    });
  }
}, [loggedInUser]);

export default function WalletPage({ route }) {
  const { income } = route.params || {};
  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.heading}>Income</Text>
        <View style={styles.boxIncome}>
          <Text style={styles.incomeText}>Php </Text>
          <Text style={styles.incomeValue}>{income} </Text>
        </View>
        <TouchableOpacity style={styles.filterContainer} onPress={handleFilterPress}>
          <Text style={styles.Filter}>Filter</Text>
          <Image source={require('./assets/filter.png')} style={styles.filterImage} />
        </TouchableOpacity>
        <ScrollView style={styles.scrollView}>
        <View style={styles.boxContainer}>
            <View style={styles.boxBills}>
              <Text style={styles.billText}>💸 Bills</Text>
            </View>
            <View style={styles.boxFood}>
              <Text style={styles.foodText}>🍕 Food</Text>
            </View>
            <View style={styles.boxEntertainment}>
              <Text style={styles.entertainmentText}>🍿 Entertainment</Text>
            </View>
            <View style={styles.boxTransportation}>
              <Text style={styles.transportationText}>🚗 Transportation</Text>
            </View>
            <View style={styles.boxPersonal}>
              <Text style={styles.personalText}>💆🏻‍♀️ Personal</Text>
            </View>
            <View style={styles.boxSavings}>
              <Text style={styles.savingsText}>💰 Savings</Text>
            </View>
            <View style={styles.boxHealthcare}>
              <Text style={styles.healthcareText}>🏥 Healthcare</Text>
            </View>
        </View>  
        </ScrollView>
      </View>

    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', 
    paddingTop: 30,   
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'left',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'left',
    marginLeft: 20,
  },
  boxIncome: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: -10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingLeft: 10,       
  },
  incomeText: {
    fontSize: 26,
    color: '#5BFF66',
    fontWeight: 'bold'
  },
  incomeValue: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold'
  },
  Filter: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-end',
    marginRight: 5,
  },
  filterImage: {
    width: 20,
    height: 20,
    marginLeft: 2,
    marginTop: -2,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
  },
  boxContainer: {
    marginTop: 5,
  },
  boxBills: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  billText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex',
    alignItems: 'flex-start', 
    justifyContent: 'center'
    
  },
  boxFood: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  foodText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center'
  },
  boxEntertainment: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex',
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  entertainmentText:{
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex', 
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  boxTransportation: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  transportationText:{
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center'
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  boxPersonal: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  personalText:{
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center'
  },
  boxSavings: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center' 
  },
  savingsText:{
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex', 
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  boxHealthcare: {
    width: 345,
    height: 70,
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    margin: 20,
    marginTop: 5,
    padding: 10,
    display: 'flex', 
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  healthcareText:{
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 20,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  
 
});
