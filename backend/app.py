from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
import os
import pandas as pd
import io
from flask import send_file 

app = Flask(__name__)
CORS(app)


print("Training AI Model...")
try:
    
    df = pd.read_csv('real_student_data.csv')
    
    
    X = df[['attendance', 'assignments', 'quizzes', 'midterms', 'study_hours']]
    y = df['final_grade']
    
    
    model = LinearRegression()
    model.fit(X, y)
    print("✅ Success! AI Model trained successfully!")
except Exception as e:
    print(f"❌ Error: Could not load CSV or train model. ({e})")
    model = None


users_db = {}



# 1. SIGN UP ROUTE
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if email in users_db:
        return jsonify({"status": "error", "message": "Email is already registered!"}), 400
    
    users_db[email] = {"name": name, "password": password}
    return jsonify({"status": "success", "message": "Account created successfully!"})

# 2. LOGIN ROUTE
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if email in users_db:
        if users_db[email]['password'] == password:
            return jsonify({"status": "success", "message": "Login successful!", "name": users_db[email]['name']})
        else:
            return jsonify({"status": "error", "message": "Incorrect password!"}), 401
    else:
        return jsonify({"status": "error", "message": "Account not found!"}), 404

# 3. AI PREDICTION ROUTE
@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file uploaded'})
    
    file = request.files['file']
    try:
        df = pd.read_csv(file)
        # Predicting using the columns model expects
        predictions = model.predict(df[['attendance', 'assignments', 'quizzes', 'midterms', 'study_hours']])
        
        # Rounding predictions to 2 decimal places
        final_grades = [round(float(p), 2) for p in predictions]
        df['Predicted_Grade'] = final_grades
        
        # Convert updated dataframe to CSV string
        csv_data = df.to_csv(index=False)
        
        # Returning BOTH the file data and the list of predictions for the graph
        return jsonify({
            'status': 'success', 
            'csv_data': csv_data,
            'predictions': final_grades
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"status": "error", "message": "AI Model is not ready!"}), 500

    data = request.get_json() 
    
    try:
        # Convert incoming data to floats
        attendance = float(data.get('attendance', 0))
        assignments = float(data.get('assignments', 0))
        quizzes = float(data.get('quizzes', 0))
        midterms = float(data.get('midterms', 0))
        study_hours = float(data.get('study_hours', 0))

        # Format data for the AI Model
        input_data = pd.DataFrame([[attendance, assignments, quizzes, midterms, study_hours]],
                                  columns=['attendance', 'assignments', 'quizzes', 'midterms', 'study_hours'])
        
        # Generate prediction
        prediction = model.predict(input_data)[0]
        
        # Clamp the result between 0 and 100
        final_score = max(0, min(100, prediction))

        return jsonify({
            "status": "success", 
            "prediction": round(final_score, 2) # Limit to 2 decimal places
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)