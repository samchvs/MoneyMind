import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Import your pages
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ListPage from './ListPage';
import SavingsPage from './SavingsPage';
import WalletPage from './WalletPage';
// Import both AiPage (intro) and GenAiPage (generation)
import AiPage from './AiPage'; // This is your introductory AI page
import GenAiPage from './GenAiPage'; // This is your AI generation page

// Import the UserContext and PredictedBudgetContext
import { UserProvider } from './UserContext';
import { PredictedBudgetProvider } from './PredictedBudgetContext';

// Import standard SQLite and SQLiteProvider
import * as SQLite from 'expo-sqlite';
import { SQLiteProvider } from 'expo-sqlite';

// Import InitializeDatabase - ensure this function uses standard SQLite methods
import { InitializeDatabase } from './RegisterPage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

// Define the database name
const databaseName = 'db.db';

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <UserProvider>
      <PredictedBudgetProvider>
        <SQLiteProvider databaseName={databaseName} onInit={InitializeDatabase}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="RegisterPage" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="RegisterPage" component={RegisterPage} />
              <Stack.Screen name="LoginPage" component={LoginPage} />
              <Stack.Screen name="HomePage" component={HomePage} />
              <Stack.Screen name="ListPage" component={ListPage} />
              <Stack.Screen name="SavingsPage" component={SavingsPage} />
              <Stack.Screen name="WalletPage" component={WalletPage} />
              {/* Map the introductory AiPage component to 'AiIntroPage' */}
              <Stack.Screen name="AiIntroPage" component={AiPage} />
              {/* Map the generation GenAiPage component to 'AiPage' */}
              <Stack.Screen name="AiPage" component={GenAiPage} />
            </Stack.Navigator>
          </NavigationContainer>
        </SQLiteProvider>
      </PredictedBudgetProvider>
    </UserProvider>
  );
}
