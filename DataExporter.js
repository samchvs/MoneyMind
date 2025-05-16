import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from './UserContext';
import { Alert } from 'react-native';


export const exportDataAsCsv = async (db, loggedInUserId) => {
    if (!db || !loggedInUserId) {
        Alert.alert("Error", "User not logged in or database not ready.");
        return;
    }

    try {
        const allIncome = await db.getAllAsync(
            'SELECT user_id, amount, date FROM income WHERE user_id = ? ORDER BY date ASC',
            [loggedInUserId]
        );

        const allExpenses = await db.getAllAsync(
            'SELECT user_id, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date ASC',
            [loggedInUserId]
        );

        if (allIncome.length === 0 && allExpenses.length === 0) {
            Alert.alert("No Data", "No income or expense data available to export.");
            return;
        }

        const monthlyData = {}; 

        allIncome.forEach(entry => {
            const month = entry.date.slice(0, 7); 
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    user_id: entry.user_id,
                    Income: 0,
                    Bills: 0,
                    Food: 0,
                    Entertainment: 0,
                    Transportation: 0,
                    'Personal Spending': 0,
                    Healthcare: 0,
                    Savings: 0
                };
            }
            monthlyData[month].Income += entry.amount;
        });

        allExpenses.forEach(entry => {
            const month = entry.date.slice(0, 7); 
             if (!monthlyData[month]) {
                  monthlyData[month] = {
                      user_id: entry.user_id,
                      Income: 0,
                      Bills: 0,
                      Food: 0,
                      Entertainment: 0,
                      Transportation: 0,
                      'Personal Spending': 0,
                      Healthcare: 0,
                      Savings: 0
                  };
              }
            if (monthlyData[month].hasOwnProperty(entry.category)) {
               monthlyData[month][entry.category] += entry.amount;
            } else {
              
               console.warn(`Unexpected expense category during export: ${entry.category}`);
            }
        });


        const headers = ['user_id', 'Month', 'Income', 'Bills', 'Food', 'Entertainment', 'Transportation', 'Personal Spending', 'Healthcare', 'Savings'];
        let csvString = headers.join(',') + '\n';

        const sortedMonths = Object.keys(monthlyData).sort();

        sortedMonths.forEach(month => {
            const data = monthlyData[month];
            const row = [
                data.user_id,
                month, // Include the month for context, though not used directly by the model features
                data.Income,
                data.Bills,
                data.Food,
                data.Entertainment,
                data.Transportation,
                data['Personal Spending'],
                data.Healthcare,
                data.Savings
            ];

            csvString += row.join(',') + '\n';
        });

        console.log("--- Exported Training Data (CSV) ---");
        console.log(csvString);
        console.log("--- End Export ---");

        Alert.alert(
            "Export Complete",
            "Data exported to console as CSV. Copy the output from your Metro Bundler terminal and save it as 'exported_training_data.csv' in your backend directory.",
            [{ text: "OK" }]
        );


    } catch (error) {
        console.error('Error exporting data:', error);
        Alert.alert("Export Error", "Failed to export data.");
    }
};
S