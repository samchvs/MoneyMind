import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import { useUser } from './UserContext';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialIcons } from '@expo/vector-icons';
import { usePredictedBudget } from './PredictedBudgetContext';

const GenAiPage = () => {
  const db = useSQLiteContext();
  const { loggedInUser } = useUser();
  const loggedInUserId = loggedInUser?.user_id;
  const { setPredictedBudget, setCurrentIncome } = usePredictedBudget();

  const [predictedBudgetState, setPredictedBudgetState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIncomeState, setCurrentIncomeState] = useState(null);

  const BACKEND_URL = 'http://jaest.pythonanywhere.com'; // Ensure this is your correct backend URL

  const fetchUserIncome = useCallback(async () => {
    if (!db || !loggedInUserId) {
      console.warn("DB or user not ready to fetch income.");
      return null;
    }
    try {
      const incomeResult = await db.getFirstAsync(
        'SELECT amount FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 1',
        [loggedInUserId]
      );
      if (incomeResult) {
        console.log("Fetched income from frontend DB:", incomeResult.amount);
        return parseFloat(incomeResult.amount);
      } else {
        console.log("No income found for user in frontend DB.");
        return 0;
      }
    } catch (error) {
      console.error('Error fetching user income from frontend DB:', error);
      return null;
    }
  }, [db, loggedInUserId]);

  const generateBudget = useCallback(async () => {
    if (!loggedInUserId || !db) {
         setLoading(false);
         setError("User not logged in or database not ready.");
         return;
    }

    setLoading(true);
    setError(null);
    setPredictedBudgetState(null);
    setPredictedBudget(null);

    const income = await fetchUserIncome();
    if (income === null) {
         setLoading(false);
         setError("Could not fetch user income from the app database.");
         return;
    }
    setCurrentIncomeState(income);
    setCurrentIncome(income);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      console.log(`Calling backend for prediction: User ID ${loggedInUserId}, Income ${income} on URL: ${BACKEND_URL}/predict/`);
      const response = await fetch(`${BACKEND_URL}/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: loggedInUserId,
          user_income: income,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `Backend error: ${response.status}`;
        try {
            const errorJson = await response.json();
            errorDetail = errorJson.error || errorDetail;
        } catch (jsonError) {
             errorDetail = `Backend error: ${response.status} ${response.statusText || ''}`;
        }
        console.error('Backend prediction failed:', response.status, errorDetail);
        throw new Error(errorDetail);
      }

      const predictionData = await response.json();
      console.log('Prediction successful:', predictionData);
      setPredictedBudgetState(predictionData);
      setPredictedBudget(predictionData);

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
          console.error('Fetch timeout:', err);
          setError("Request timed out after 60 seconds. The backend took too long to respond.");
      } else {
          console.error('Error calling backend API:', err);
          setError(`Failed to generate budget: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [loggedInUserId, db, fetchUserIncome, BACKEND_URL, setPredictedBudget, setCurrentIncome]);

  useEffect(() => {
    if (loggedInUserId && db) {
        generateBudget();
    } else {
        setLoading(false);
        setError("User not logged in or database not ready.");
    }

    return () => {};

  }, [loggedInUserId, db, generateBudget]);

  const totalPredictedAmount = predictedBudgetState ? Object.values(predictedBudgetState).reduce((sum, amount) => sum + amount, 0) : 0;

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={styles.container}
    >
      <Text style={styles.title}>For You!</Text>
      <Text style={styles.subtitle}>AI Budget Recommendation</Text>

      {loading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.statusText}>Generating budget...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.statusContainer}>
          <MaterialIcons name="error" size={40} color="red" />
          <Text style={styles.statusText}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
           <TouchableOpacity style={styles.retryButton} onPress={() => {
               setError(null);
               setLoading(true);
               console.log("Retry button pressed. Re-generating budget...");
               generateBudget();
           }}>
               <Text style={styles.retryButtonText}>Retry</Text>
             </TouchableOpacity>
        </View>
      )}

      {predictedBudgetState && !loading && !error && (
          <ScrollView style={styles.predictedBudgetContainer} contentContainerStyle={styles.predictedBudgetContent}>
            <Text style={styles.predictionIncomeText}>Based on your income: ₱{currentIncomeState?.toFixed(2) || 'N/A'}</Text>
            {Object.entries(predictedBudgetState).map(([category, amount], index) => {
                const progress = totalPredictedAmount > 0 ? amount / totalPredictedAmount : 0;
                const percentage = totalPredictedAmount > 0 ? ((amount / totalPredictedAmount) * 100).toFixed(1) : 0;

                const colors = ['#42a5f5', '#66bb6a', '#ffee58', '#ff7043', '#ab47bc', '#ef5350', '#26a69a'];
                const color = colors[index % colors.length];

                return (
                    <View key={category} style={styles.progressItem}>
                        <Text style={styles.progressLabel}>{category}: ₱{amount.toFixed(2)} ({percentage}%)</Text>
                        <Progress.Bar
                            progress={progress}
                            width={null}
                            height={20}
                            color={color}
                            unfilledColor="#2E2E2E"
                            borderRadius={10}
                            borderColor="transparent"
                            style={styles.progressBar}
                        />
                    </View>
                );
            })}
             <Text style={styles.totalPredictedText}>Total Predicted Allocation: ₱{totalPredictedAmount.toFixed(2)}</Text>
             {currentIncomeState !== null && (
                 <Text style={styles.remainingIncomeText}>
                     Remaining Income: ₱{(currentIncomeState - totalPredictedAmount).toFixed(2)}
                 </Text>
             )}

             <View style={styles.bottomTextContainer}>
                <Text style={styles.bottomText}>
                    This is an AI-generated budget recommendation based on historical data.
                    Review and adjust it to fit your personal financial goals.
                </Text>
             </View>

            <TouchableOpacity style={styles.generateButton} onPress={() => {
                console.log("Generate Budget Again button pressed.");
                generateBudget();
            }}>
                <MaterialIcons name="refresh" size={24} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Budget Again</Text>
            </TouchableOpacity>

          </ScrollView>
      )}

    </LinearGradient>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 15,
        color: '#B0B0B0',
        marginTop: 5,
        marginBottom: 30,
    },
    statusContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    statusText: {
      fontSize: 18,
      color: '#fff',
      marginTop: 10,
      textAlign: 'center',
    },
     statusTextDetail: {
      fontSize: 14,
      color: '#ccc',
      marginTop: 5,
      textAlign: 'center',
     },
    errorText: {
      fontSize: 14,
      color: 'red',
      textAlign: 'center',
      marginTop: 5,
      paddingHorizontal: 20,
    },
     retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#444',
        borderRadius: 10,
     },
     retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
     },
    predictedBudgetContainer: {
       flex: 1,
    },
    predictedBudgetContent: {
        paddingBottom: 40,
    },
    predictionIncomeText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    progressItem: {
      marginBottom: 25,
      width: '100%',
    },
    progressLabel: {
      fontSize: 15,
      color: '#fff',
      marginBottom: 10,
      fontWeight: 'bold',
    },
    progressBar: {
      width: '100%',
    },
    totalPredictedText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
     remainingIncomeText: {
        fontSize: 18,
        color: '#00e676',
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    bottomTextContainer: {
      marginTop: 40,
      paddingHorizontal: 15,
      backgroundColor: '#1c1c1c',
      borderRadius: 10,
      paddingVertical: 15,
    },
    bottomText: {
      fontSize: 14,
      color: '#B0B0B0',
      textAlign: 'center',
      lineHeight: 22,
    },
    generateButton: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
  });
export default GenAiPage;
