import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib
import os # Import os module to check for the data file

DATA_FILENAME = 'moneymind_data.csv'
MODEL_FILENAME = 'budget_predictor.pkl'


if not os.path.exists(DATA_FILENAME):
    print(f"❌ Error: Dataset file '{DATA_FILENAME}' not found.")
    print("Please create a CSV file named 'moneymind_data.csv' with 'Income (₱)' and your budget category columns.")
    print("Example structure:")
    print("Income (₱),Bills (₱),Food (₱),Transportation (₱),Entertainment (₱),Savings (₱),Personal Spending (₱), Healthcare (₱)")
    print("30000,8000,6000,3000,2000,5000,1000")
    print("50000,12000,8000,4000,3000,10000,3000")
    exit()

try:
    data = pd.read_csv(DATA_FILENAME)

    if 'Income' not in data.columns:
        print(f"❌ Error: Column 'Income' not found in '{DATA_FILENAME}'.")
        exit()
    if data.shape[1] < 2:
        print(f"❌ Error: '{DATA_FILENAME}' must contain 'Income' and at least one budget category column.")
        exit()

    X = data[['Income']]
    y = data.drop(columns=['Income'])

    if len(data) < 2:
         print(f"❌ Error: Not enough data in '{DATA_FILENAME}' to train the model. Need at least 2 rows.")
         exit()
    if len(data) < 5:
        print(f"⚠️ Warning: Very limited data in '{DATA_FILENAME}'. The model may not be accurate. Consider adding more data.")


    test_size = 0.2 if len(data) > 5 else 0.5
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

    print("Training the budget generation model...")
    model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)) # Added parameters for potentially better performance
    model.fit(X_train, y_train)
    print("Training complete.")

    y_pred = model.predict(X_test)
    y_pred[y_pred < 0] = 0

    mae = mean_absolute_error(y_test, y_pred)
    print(f"Mean Absolute Error on test data: ₱{mae:.2f}")
    print(f"(Lower MAE indicates better accuracy in predicting budget amounts)")

    # Save the trained model
    joblib.dump(model, MODEL_FILENAME)
    print(f"Model saved as '{MODEL_FILENAME}'")

except FileNotFoundError:
     # This case is already handled by the os.path.exists check, but good to have a general catch
    print(f"❌ Error: Could not find the data file '{DATA_FILENAME}'.")
    exit()
except Exception as e:
    print(f"❌ An error occurred during data processing or model training: {e}")
    exit()


# --- Prediction using the trained model ---

print("\n--- Generate Budget ---")

# Check if model file exists before trying to load
if not os.path.exists(MODEL_FILENAME):
     print(f"❌ Error: Model file '{MODEL_FILENAME}' not found. Please run the training part first.")
     exit()

try:
    # Load the trained model
    loaded_model = joblib.load(MODEL_FILENAME)

    # Get user input
    user_income_str = input("Enter your monthly income (₱): ")
    try:
        user_income = float(user_income_str)
        if user_income < 0:
             print("❌ Income cannot be negative.")
             exit()
    except ValueError:
        print("❌ Invalid input. Please enter a valid number for income.")
        exit()

    user_income_df = pd.DataFrame([[user_income]], columns=['Income'])
    predicted_budget_array = loaded_model.predict(user_income_df)[0]

    predicted_budget_array[predicted_budget_array < 0] = 0

    budget_categories = y.columns.tolist() # Use the columns from the original y dataframe

    print(f"\n--- Predicted budget breakdown for ₱{user_income:,.2f} ---")
    total_predicted_budget = 0
    budget_details = {}

    for category, amount in zip(budget_categories, predicted_budget_array):
        budget_details[category] = round(amount, 2)
        total_predicted_budget += round(amount, 2)
        print(f"{category}: ₱{round(amount, 2):,.2f}")

    print("-" * 30)
    print(f"Total Predicted Budget: ₱{total_predicted_budget:,.2f}")
    print("-" * 30)


    # Provide feedback
    if total_predicted_budget > user_income:
        print("⚠️ Warning: Your total predicted budget exceeds your income. You may need to adjust spending.")
        print(f"Difference: ₱{total_predicted_budget - user_income:,.2f}")
    elif total_predicted_budget < user_income:
        remaining_income = user_income - total_predicted_budget
        print(f"✅ Your predicted budget is within your income. Remaining: ₱{remaining_income:,.2f} (Consider saving or allocating elsewhere)")
    else:
         print("✅ Your predicted budget exactly matches your income.")


except FileNotFoundError:
     # This case is already handled by the os.path.exists check, but good to have a general catch
    print(f"❌ Error: Could not load the model file '{MODEL_FILENAME}'.")
    exit()
except Exception as e:
    print(f"❌ An error occurred during prediction: {e}")