import React, { useState, useEffect, useRef } from 'react';
 import { StyleSheet, TextInput, Text, Image, Animated, TouchableOpacity, Vibration, Alert, Pressable } from 'react-native';
 import { Ionicons } from '@expo/vector-icons';
 import { LinearGradient } from 'expo-linear-gradient';
 import { useSQLiteContext } from 'expo-sqlite';

 export const InitializeDatabase = async (db) => {
   try {
     await db.execAsync(`
       PRAGMA journal_mode = WAL;
       CREATE TABLE IF NOT EXISTS users (
         user_id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT NOT NULL UNIQUE,
         password TEXT NOT NULL
       );

       CREATE TABLE IF NOT EXISTS savings_goals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         target_amount REAL NOT NULL,
         target_date TEXT NOT NULL,
         FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
       );

       CREATE TABLE IF NOT EXISTS savings_contributions (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         savings_goal_id INTEGER NOT NULL,
         amount REAL NOT NULL,
         FOREIGN KEY (savings_goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
       );
     `);
     console.log('Database tables initialized successfully');
   } catch (error) {
     console.error('Failed to initialize database tables:', error);
   }
 };
 import { useUser } from './UserContext'; // Assuming UserContext.js is in the same directory

 export default function RegisterPage({ navigation }) {
   const db = useSQLiteContext();
   // Destructure loggedInUser as well to watch for changes in the useEffect
   const { loggedInUser, setLoggedInUser } = useUser();

   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const [dbReady, setDbReady] = useState(false); // Add state for database readiness

   const logoMoveUp = useRef(new Animated.Value(0)).current;
   const moneyMindMoveUp = useRef(new Animated.Value(0)).current;
   const inputOpacity = useRef(new Animated.Value(0)).current;
   const buttonOpacity = useRef(new Animated.Value(0)).current;
   const buttonMoveUp = useRef(new Animated.Value(100)).current;

   useEffect(() => {
     const initialize = async () => {
        if (db) {
            await InitializeDatabase(db); // Initialize database when component mounts and db is available
            setDbReady(true);
        }

        Animated.parallel([
           Animated.spring(logoMoveUp, {
             toValue: -100,
             friction: 20,
             tension: 30,
             useNativeDriver: true,
           }),
           Animated.spring(moneyMindMoveUp, {
             toValue: -100,
             friction: 10,
             tension: 50,
             useNativeDriver: true,
           }),
         ]).start(() => {
           Animated.timing(inputOpacity, {
             toValue: 1,
             duration: 500,
             useNativeDriver: true,
           }).start(() => {
             Animated.parallel([
               Animated.timing(buttonOpacity, {
                 toValue: 1,
                 duration: 500,
                 useNativeDriver: true,
               }),
               Animated.spring(buttonMoveUp, {
                 toValue: 0,
                 friction: 6,
                 tension: 50,
                 useNativeDriver: true,
               }),
             ]).start();
           });
         });
     };

     initialize();
   }, [db]); // Depend on db to ensure it's available before initializing

   const handleRegister = async () => {
        if (!dbReady) {
            setError('Database is not ready. Please try again later.');
            return;
        }

     if (username.length === 0 || password.length === 0 || confirmPassword.length === 0) {
       setError('Please enter all fields.');
       Vibration.vibrate();
       return;
     }

     if (username.length > 15) {
       setError('Username cannot exceed 15 characters.');
       Vibration.vibrate();
       return;
     }

     if (password !== confirmPassword) {
       setError('Passwords do not match.');
       Vibration.vibrate();
       return;
     }

     try {
       const existingUser = await db.getFirstAsync(
         'SELECT * FROM users WHERE username = ?',
         [username]
       );

       if (existingUser) {
         setError('Username already exists.');
         Vibration.vibrate();
         return;
       }

       // Insert the new user
       const result = await db.runAsync(
         'INSERT INTO users (username, password) VALUES (?, ?)',
         [username, password]
       );

       // Check if insertion was successful and get the last inserted row ID (user_id)
       if (result.changes > 0) {
         const userId = result.lastInsertRowId;
         const userData = { user_id: userId, username: username };
         setLoggedInUser(userData); // Set the user in the context
         console.log('RegisterPage - User registered and set in context:', userData);
         // The useEffect below will handle navigation
       } else {
         setError('Registration failed.');
         Vibration.vibrate();
       }
     } catch (err) {
       console.error('Registration failed:', err);
       setError('Registration failed. Please try again.');
     }
   };

   // This useEffect watches for changes in loggedInUser and navigates
   useEffect(() => {
     if (loggedInUser) {
       console.log('RegisterPage - Navigating to HomePage');
       navigation.navigate('HomePage', { username: loggedInUser.username });
     }
   }, [loggedInUser, navigation]); // Depend on loggedInUser and navigation

   return (
     <LinearGradient
       colors={['#000000', '#171717', '#171717', '#232323', '#3b3b3b', '#3b3b3b', '#4f4f4f']}
       style={styles.container}
     >
       <Animated.View style={[styles.logoWrapper, { transform: [{ translateY: logoMoveUp }] }]}>
         <Image source={require('./assets/logo.png')} style={styles.logo} />
       </Animated.View>

       <Animated.Image
         source={require('./assets/MoneyMind.png')}
         style={[styles.moneyMind, { transform: [{ translateY: moneyMindMoveUp }] }]}
       />

       <Animated.View style={[styles.inputWrapper, { opacity: inputOpacity }]}>
         <TextInput
           style={styles.input}
           placeholder="Enter Username"
           placeholderTextColor="#808080"
           value={username}
           onChangeText={(text) => {
             if (text.length > 15) {
               setError('Username cannot exceed 15 characters.');
               Vibration.vibrate();
               return;
             }
             setUsername(text);
             setError('');
           }}
         />
         <TextInput
           style={styles.input}
           placeholder="Enter Password"
           placeholderTextColor="#808080"
           value={password}
           secureTextEntry
           onChangeText={setPassword}
         />
         <TextInput
           style={styles.input}
           placeholder="Confirm Password"
           placeholderTextColor="#808080"
           value={confirmPassword}
           secureTextEntry
           onChangeText={setConfirmPassword}
         />
          {/* Consider adding a checkmark icon logic for username length or availability if desired */}
         <Ionicons
           name="checkmark-circle"
           size={20}
           color={username && username.length <= 15 ? '#00ff00' : 'transparent'} // Only show if username is entered and within limit
           style={styles.icon}
         />
         {error ? <Text style={styles.errorText}>{error}</Text> : null}
       </Animated.View>

       <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonMoveUp }] }}>
         <TouchableOpacity style={styles.buttonContainer} onPress={handleRegister} activeOpacity={0.8}>
           <Text style={styles.buttonText}>Register</Text>
         </TouchableOpacity>
         <Pressable style={styles.link} onPress={() => navigation.navigate('LoginPage')}>
         <Text style={styles.linkText}>
           Already have an account? <Text style={styles.underline}>Login</Text>.
         </Text>
         </Pressable>
       </Animated.View>
     </LinearGradient>
   );
 }

 // Styles remain the same as provided, assuming they are correct for styling.
 // Removed the calculator grid styles as they seem unrelated to the login/register pages.
 const styles = StyleSheet.create({
   container: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 20,
   },
   logoWrapper: {
     marginBottom: 10,
   },
   logo: {
     width: 350,
     height: 350,
     resizeMode: 'contain',
     marginTop: -100,
   },
   moneyMind: {
     width: 200,
     height: 100,
     resizeMode: 'contain',
     marginTop: -90,
   },
   inputWrapper: {
     width: '100%',
     position: 'relative',
     marginTop: -100,
     marginBottom: -10,
     marginLeft: 7,
     paddingHorizontal: 20,
   },
   input: {
     height: 50,
     width: '100%',
     borderColor: '#fff',
     borderWidth: 1,
     borderRadius: 30,
     paddingHorizontal: 20,
     paddingRight: 40,
     padding: 10,
     fontSize: 16,
     color: '#fff',
     marginTop: -9,
     marginBottom: 25,
     paddingTop: 15,
     fontWeight: 'bold',
     marginVertical: 5,
   },
   icon: {
     position: 'absolute',
     right: 35,
     top: 9, // Adjust top position based on input height and margin
   },
   errorText: {
     color: 'red',
     fontSize: 12,
     marginTop: -15,
     fontWeight: 'bold',
     textAlign: 'center',
     flexWrap: 'wrap',
     width: 250,
     left: 20,
     marginBottom: 10,
   },
   buttonContainer: {
     width: 250,
     height: 50,
     backgroundColor: '#fff',
     borderRadius: 30,
     justifyContent: 'center',
     alignItems: 'center',
     marginTop: 10,
     borderColor: '#fff',
     borderWidth: 1,
   },
   buttonText: {
     fontSize: 16,
     color: '#000000',
     fontWeight: 'bold',
   },
   link: {
     marginTop: 10,
   },
   linkText: {
     color: '#fff',
     textAlign: 'center',
   },
   underline: {
     textDecorationLine: 'underline',
     color: '#fff',
   },
 });