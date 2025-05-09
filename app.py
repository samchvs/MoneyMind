# app.py

from flask import Flask, request, jsonify
import os
import time # Import time for timing
# Import the prediction and training functions from your budget_predictor.py
# Ensure budget_predictor.py is in the same directory
try:
    # Import predict_budget and train_model, and the CSV_FILENAME config
    from budget_predictor import predict_budget, train_model, CSV_FILENAME, MODEL_FILENAME, CATEGORIES_FILENAME, load_model_and_categories
except ImportError:
    print("Error: Could not import budget_predictor.py.")
    print("Please make sure budget_predictor.py is saved in the same directory as app.py.")
    # Exit is appropriate here as the app cannot run without the predictor logic
    exit()

app = Flask(__name__)

# --- Configuration ---
# The CSV_FILENAME is configured in budget_predictor.py
# which should read from the environment variable TRAINING_DATA_PATH or default to 'exported_training_data.csv'.
# Ensure the TRAINING_DATA_PATH environment variable is set correctly
# when you run this Flask app, pointing to your exported CSV file.


@app.route('/train/', methods=['POST'])
def train_route():
    """ Endpoint to trigger model training from CSV """
    # In a real app, you'd secure this endpoint or run training via a scheduled task
    print("Received request to trigger model training from CSV...")

    # Use the CSV_FILENAME path defined in budget_predictor.py
    if not os.path.exists(CSV_FILENAME):
         return jsonify({"error": f"Training data CSV file '{CSV_FILENAME}' not found on backend server. Cannot train."}), 500

    try:
        # Pass the CSV file path to the train_model function
        success = train_model(CSV_FILENAME)
        if success:
            # After successful training, attempt to reload the model and categories
            # This updates the globally loaded model/categories in app.py's memory
            global LOADED_MODEL, LOADED_CATEGORIES
            LOADED_MODEL, LOADED_CATEGORIES = load_model_and_categories()
            return jsonify({"message": "Model training completed successfully from CSV."}), 200
        else:
            return jsonify({"error": "Model training from CSV failed."}), 500
    except Exception as e:
        print(f"An error occurred during training endpoint: {e}")
        return jsonify({"error": f"An error occurred during training from CSV: {str(e)}"}), 500


@app.route('/predict/', methods=['POST'])
def predict_route():
    """ Endpoint to receive user_id and income and return budget prediction """
    start_request_time = time.time()
    print("Received POST request to /predict/")

    data = request.get_json()
    user_id = data.get('user_id')
    current_income = data.get('current_income')

    if user_id is None or current_income is None:
        end_request_time = time.time()
        print(f"Request to /predict/ failed (missing data) in {end_request_time - start_request_time:.4f} seconds.")
        return jsonify({"error": "Missing user_id or current_income in request."}), 400

    try:
        user_id = int(user_id)
        current_income = float(current_income)
        if user_id <= 0 or current_income < 0:
             end_request_time = time.time()
             print(f"Request to /predict/ failed (invalid data values) in {end_request_time - start_request_time:.4f} seconds.")
             return jsonify({"error": "Invalid user_id or current_income values."}), 400
    except (ValueError, TypeError):
         end_request_time = time.time()
         print(f"Request to /predict/ failed (invalid data types) in {end_request_time - start_request_time:.4f} seconds.")
         return jsonify({"error": "Invalid data types for user_id or current_income."}), 400

    # Check if model and categories files exist before attempting prediction
    if not os.path.exists(MODEL_FILENAME):
         end_request_time = time.time()
         print(f"Request to /predict/ failed (model file not found) in {end_request_time - start_request_time:.4f} seconds.")
         return jsonify({"error": f"Model file '{MODEL_FILENAME}' not found on backend server. Train the model first."}), 500
    if not os.path.exists(CATEGORIES_FILENAME):
         end_request_time = time.time()
         print(f"Request to /predict/ failed (categories file not found) in {end_request_time - start_request_time:.4f} seconds.")
         return jsonify({"error": f"Categories file '{CATEGORIES_FILENAME}' not found on backend server. Train the model first."}), 500


    print(f"Received prediction request for user {user_id} with income {current_income}. Starting prediction process...")

    try:
        # Call the predict_budget function from budget_predictor.py
        # predict_budget no longer needs the db_path
        predicted_budget = predict_budget(user_id, current_income)

        if predicted_budget is not None:
            end_request_time = time.time()
            print(f"Request to /predict/ completed successfully in {end_request_time - start_request_time:.4f} seconds.")
            # Return the prediction details to the frontend
            return jsonify(predicted_budget), 200
        else:
            end_request_time = time.time()
            print(f"Request to /predict/ failed (prediction function returned None) in {end_request_time - start_request_time:.4f} seconds.")
            return jsonify({"error": "Failed to generate budget prediction."}), 500
    except Exception as e:
        end_request_time = time.time()
        print(f"An error occurred during prediction endpoint after {end_request_time - start_request_time:.4f} seconds: {e}")
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500


@app.route('/status/', methods=['GET'])
def status_route():
    """ Simple endpoint to check backend status """
    # Check if the training data CSV exists
    csv_exists = os.path.exists(CSV_FILENAME)
    model_exists = os.path.exists(MODEL_FILENAME)
    categories_exists = os.path.exists(CATEGORIES_FILENAME)
    return jsonify({
        "status": "Backend running",
        "training_data_csv_accessible": csv_exists, # Indicate CSV accessibility for training
        "model_trained": model_exists,
        "categories_file_exists": categories_exists,
        "training_data_path_config": CSV_FILENAME, # Show configured CSV path
        "model_path": MODEL_FILENAME,
        "categories_path": CATEGORIES_FILENAME
    }), 200


if __name__ == '__main__':
    # Attempt to load model and categories on startup
    # This ensures the prediction endpoint is ready if model files exist
    LOADED_MODEL, LOADED_CATEGORIES = load_model_and_categories()

    if LOADED_MODEL is None or LOADED_CATEGORIES is None:
        print("Model or categories not loaded on startup. Prediction endpoint may not work until training is successful.")
        print(f"Ensure training data CSV '{CSV_FILENAME}' exists and send a POST request to /train/ to train the model.")


    # To allow connections from other devices on the network (like your physical phone),
    # set host to '0.0.0.0'.
    # For production, use a proper hosting solution and web server (like Gunicorn/Waitress).
    print("\nStarting Flask server...")
    # Use 0.0.0.0 to listen on all interfaces, allowing connections from your physical device
    app.run(debug=True, host='0.0.0.0', port=5001) # Ensure port matches frontend
