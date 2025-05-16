

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import os
import pickle
import time 
import numpy as np

CSV_FILENAME = os.environ.get('TRAINING_DATA_PATH', 'exported_training_data.csv')

MODEL_FILENAME = 'budget_model.pkl'
CATEGORIES_FILENAME = 'budget_categories.pkl'

EXPENSE_CATEGORIES = [
    'Bills',
    'Food',
    'Entertainment',
    'Transportation',
    'Personal Spending',
    'Healthcare',
    'Savings'
]

def fetch_and_process_data_from_csv(csv_path):
    """Reads data from a CSV file and prepares it for training."""
    print(f"Attempting to read training data from CSV: {csv_path}")
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found at {csv_path}. Cannot fetch data.")
        return pd.DataFrame()

    try:
        start_time = time.time()
        data = pd.read_csv(csv_path)
        end_time = time.time()
        print(f"CSV file read successfully in {end_time - start_time:.4f} seconds. Fetched {len(data)} rows.")

        if 'Income' not in data.columns:
            print(f"❌ Error: 'Income' column not found in CSV file '{csv_path}'. Cannot train.")
            return pd.DataFrame()

        for category in EXPENSE_CATEGORIES:
            if category not in data.columns:
                print(f"Warning: Category '{category}' not found in CSV. Adding with 0 values.")
                data[category] = 0.0

        feature_columns = ['Income']
        target_columns = EXPENSE_CATEGORIES

        required_columns = ['user_id', 'Month'] + feature_columns + target_columns
        data = data[[col for col in required_columns if col in data.columns]]
        for col in feature_columns + target_columns:
             if col in data.columns:
                 data[col] = pd.to_numeric(data[col], errors='coerce').fillna(0) # Convert to numeric, fill errors with 0


        print("Data processed successfully for training.")
        return data

    except Exception as e:
        print(f"An error occurred during CSV data processing: {e}")
        return pd.DataFrame() # Return empty on error


def train_model(csv_path):
    """Trains the model using data from a CSV file."""
    print("Starting model training...")
    monthly_data = fetch_and_process_data_from_csv(csv_path)

    if monthly_data is None or monthly_data.empty:
        print("❌ Training failed: Could not fetch data from CSV or dataset is empty.")
        return False

    # Define features (X) and targets (y)
    # Features: Income
    X = monthly_data[['Income']]
    # Targets: All expense categories defined in EXPENSE_CATEGORIES
    y = monthly_data[EXPENSE_CATEGORIES]

    # Handle cases where y might be empty if EXPENSE_CATEGORIES were not found in data
    if y.empty:
         print("❌ Training failed: No valid target (expense) data found based on EXPENSE_CATEGORIES.")
         return False

    # Check if there's enough data to train
    if len(X) < 2:
         print(f"❌ Not enough data in the CSV to train the model. Need at least 2 rows. Training skipped.")
         return False

    model = LinearRegression()
    model.fit(X, y)

    try:
        with open(MODEL_FILENAME, 'wb') as f:
            pickle.dump(model, f)
        with open(CATEGORIES_FILENAME, 'wb') as f:
             pickle.dump(EXPENSE_CATEGORIES, f)
        print(f"✅ Model trained and saved as {MODEL_FILENAME}")
        print(f"✅ Category names saved as {CATEGORIES_FILENAME}")
        return True
    except Exception as e:
        print(f"❌ Failed to save model or categories: {e}")
        return False

def load_model_and_categories():
    """Loads the trained model and category names."""
    model = None
    categories = None
    try:
        start_time = time.time()
        with open(MODEL_FILENAME, 'rb') as f:
            model = pickle.load(f)
        with open(CATEGORIES_FILENAME, 'rb') as f:
             categories = pickle.load(f)
        end_time = time.time()
        print(f"Model and categories loaded successfully in {end_time - start_time:.4f} seconds.")
        return model, categories
    except FileNotFoundError:
        print(f"❌ Model file '{MODEL_FILENAME}' or categories file '{CATEGORIES_FILENAME}' not found.")
        print("Please train the model first by sending a POST request to /train/ or running this script directly.")
        return None, None
    except Exception as e:
        print(f"❌ Failed to load model or categories: {e}")
        return None, None

LOADED_MODEL, LOADED_CATEGORIES = load_model_and_categories()


def predict_budget(user_id, current_income):
    """
    Predicts budget allocation for a user based on their income.
    Reads model and categories from files. Does NOT use a database.
    """
    global LOADED_MODEL, LOADED_CATEGORIES

    # Check if model and categories are loaded
    if LOADED_MODEL is None or LOADED_CATEGORIES is None:
        print("Model or categories not loaded. Attempting to reload.")
        LOADED_MODEL, LOADED_CATEGORIES = load_model_and_categories()
        if LOADED_MODEL is None or LOADED_CATEGORIES is None:
             print("❌ Prediction failed: Model or categories could not be loaded.")
             return None

    # Prepare the input for prediction (must be a 2D array/DataFrame)
    # The model expects a feature array/DataFrame with the same number of features it was trained on.
    # In this case, the only feature is 'Income'.
    input_income = np.array([[current_income]]) # Reshape income to a 2D array

    try:
        start_time = time.time()
        # Make prediction
        predicted_amounts = LOADED_MODEL.predict(input_income)
        end_time = time.time()
        print(f"Prediction computed in {end_time - start_time:.4f} seconds.")

        # The prediction result is a 2D array, even for a single prediction.
        # We need to flatten it and map it to the category names.
        # Ensure the number of predicted amounts matches the number of categories
        if predicted_amounts.shape[1] != len(LOADED_CATEGORIES):
             print(f"❌ Prediction failed: Number of predicted outputs ({predicted_amounts.shape[1]}) does not match number of categories ({len(LOADED_CATEGORIES)}).")
             return None

        # Map predicted amounts to categories
        predicted_budget = {}
        for i, category in enumerate(LOADED_CATEGORIES):
            # Ensure predicted amounts are not negative (regression can predict negative values)
            predicted_budget[category] = max(0, predicted_amounts[0][i]) # Use max(0, ...) to ensure non-negative

        print(f"Predicted budget: {predicted_budget}")

        # Return the predicted budget dictionary
        return predicted_budget

    except Exception as e:
        print(f"An error occurred during budget prediction: {e}")
        return None


# Example of how to use the functions (for testing purposes)
if __name__ == '__main__':
    print("Running Budget Predictor Script (Manual Mode)")

    # --- Manual Training ---
    print("\n--- Attempting to Train Model from CSV ---")
    # Check if the CSV file exists before attempting to train
    if os.path.exists(CSV_FILENAME):
        train_model(CSV_FILENAME)
    else:
        print(f"❌ CSV file '{CSV_FILENAME}' not found. Skipping training.")
        print("Please export data from your app's List Page and save it as this file.")


    # --- Manual Prediction ---
    print("\n--- Attempting to Generate Budget ---")
    if os.path.exists(MODEL_FILENAME) and os.path.exists(CATEGORIES_FILENAME):
        user_income_str = input("Enter your monthly income (₱): ")
        user_id_str = input("Enter the user ID: ") # User ID is not used in prediction logic, but keeping for context

        try:
            user_income = float(user_income_str)
            user_id = int(user_id_str) # Convert to int, though not used in prediction
            if user_income < 0:
                 print("❌ Invalid input for income.")
            else:
                # Call predict_budget without db_path
                predicted_budget = predict_budget(user_id, user_income)
                if predicted_budget:
                    print(f"\n--- Predicted budget breakdown for ₱{user_income:,.2f} (User ID: {user_id}) ---")
                    total_predicted = 0
                    for category, amount in predicted_budget.items():
                        print(f"{category}: ₱{amount:,.2f}")
                        total_predicted += amount
                    print("-" * 30)
                    print(f"Total Predicted Budget: ₱{total_predicted:,.2f}")
                    print("-" * 30)
                else:
                    print("❌ Failed to generate predicted budget.")

        except ValueError:
            print("❌ Invalid input. Please enter a valid number for income.")
    else:
         if not os.path.exists(MODEL_FILENAME):
              print(f"❌ Model file '{MODEL_FILENAME}' not found. Cannot perform prediction.")
         if not os.path.exists(CATEGORIES_FILENAME):
              print(f"❌ Categories file '{CATEGORIES_FILENAME}' not found. Cannot perform prediction.")

    pass # Keep this pass if you don't want to run the examples automatically
