import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GEMINI_API_KEY = "AIzaSyAwqPgz7tC3FZIaKMHPlvHVK8rYSYCwbrE";

const ChatbotPage = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const [greeting, setGreeting] = useState("Hi! I am Budgie! Your Financial Assistant");

  const handleAskGemini = async () => {
    setLoading(true);
    setResponse('');
    Keyboard.dismiss(); 
    try {
      const promptText = `Analyze the monthly income of ${prompt} and provide a concise, single-line estimate for each of the following categories as a percentage or a fixed amount. Use the Philippine Peso sign (₱) and do not use the dollar sign. Format the response with each category on a new line like this: "Bills: <value>", "Food: <value>", etc.
    Always acknowledge the user's input!
    
    Follow this format:

    General Information (Dont display the word prompt):
    Income: 
    Expenses: 

    
    If the user inputed expenses that is aligned with the following categories, display these:
    - Bills: <value>
    - Food: <value>
    - Transportation: <value>
    - Personal Spending: <value>
    - Savings: <value>
    - Healthcare: <value>
    - Entertainment: <value>

    Financial Advice based on Expenses(If the user said anything about spent, expenses, spend, then that is expenses if none, leave it blank):

    - Provide a brief summary of how the income compares to the expenses and whether there are areas for improvement.

    Saving Tips:

    - Offer general advice on how to save more effectively, possibly suggesting adjustments to spending based on the categories.

    The 50/30/20 rule:

    - Explain how the 50/30/20 rule can be applied based on the user’s input: 50% for Needs (Bills, Healthcare, Transportation), 30% for Wants (Food, Entertainment, Personal Spending), and 20% for Savings. Based on the user’s input, suggest a budget breakdown according to this rule.
    - Explain how this works and where it could be applied to:

    New Budget Created by Budgie:
        Create a budget that will fix the budget inputted by the user. Make the budgeting smart and financially wise. 
    
    State a conclusion and remind them of smart budgeting and financial choices
        `
    ;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
          }),
        }
      );

      const json = await res.json();

      if (json.candidates && json.candidates.length > 0) {
        const rawResponse = json.candidates[0].content.parts[0].text;
        const plainResponse = rawResponse.replace(/\*\*/g, '');
        setResponse(plainResponse);
      } else {
        setResponse("No response from Gemini.");
      }
    } catch (error) {
      setResponse("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTapGreeting = () => {
    // List of greetings/messages to display
    const messages = [
      "Hi! I am Budgie! Your AI Financial Assistant",
      "I will guide you to make wise spending choices",
      "Let's analyze your income and expenses!",
      "Ready to take control of your finances? Let's start!",
      "Budgie here! Let's set some financial goals together",
      "Hey there, superstar! 🌟 Ready to take control of your budget?",
    ];

    // Randomly pick a greeting from the list
    const randomIndex = Math.floor(Math.random() * messages.length);
    setGreeting(messages[randomIndex]);
  };

  return (
    <LinearGradient
      colors={['#000000', '#171717', '#232323', '#3b3b3b', '#4f4f4f']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.heading}>
              <Text style={styles.headingText}>
                <Text style={{ color: '#5BFF66' }}>Money</Text>
                <Text style={{ color: 'white' }}>Mind AI</Text>
              </Text>
              <Image 
                source={require('./assets/Budgie.png')} 
                style={styles.image}
              />
            </View>

            {/* Greetings Container */}
            <View style={styles.greetingsContainer}>
              <TouchableOpacity onPress={handleTapGreeting}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <Text style={styles.greetingText1}>Tap for more...</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your monthly income or ask about any financial concerns..."
                value={prompt}
                onChangeText={setPrompt}
                //keyboardType="numeric"
                multiline
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                style={[styles.button, (!prompt || loading) && styles.buttonDisabled]}
                onPress={handleAskGemini}
                disabled={!prompt || loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Processing...' : 'Generate Budgie'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Response Box */}
            {response ? (
              <View style={styles.responseBox}>
                <Text style={styles.responseText}>{response}</Text>
              </View>
            ) : null}
          </ScrollView>
           </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Add extra padding at the bottom
  },
  heading: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#2c2c2c',
    fontSize: 16,
    color: '#fff',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#5BFF66',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseBox: {
    marginTop: -1,
    borderColor: '#888',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#2c2c2c',
  },
  responseText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  image: {
    marginTop: 10, 
    width: 250, 
    height: 250, 
    resizeMode: 'contain', 
  },
  greetingsContainer: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  greetingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  greetingText1: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
  },
});

export default ChatbotPage;