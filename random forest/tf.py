# ----------------------------
# 1. Import Libraries
# ----------------------------

import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

import joblib

# ----------------------------
# 2. Load Dataset
# ----------------------------

data = pd.read_csv(r"C:\Users\PRASANTH\Desktop\hackathon\backend\dataset\rf_dataset.csv")

print("Dataset Shape:", data.shape)
print("\nFirst 5 rows:")
print(data.head())

# ----------------------------
# 3. Features and Target
# ----------------------------

X = data.drop(["fraud", "transaction_id"], axis=1)
y = data["fraud"]

feature_names = X.columns

# ----------------------------
# 4. Train-Test Split
# ----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("\nTraining Size:", X_train.shape)
print("Testing Size:", X_test.shape)

# ----------------------------
# 5. Missing Value Handling
# ----------------------------

imputer = SimpleImputer(strategy="mean")

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

# ----------------------------
# 6. Feature Scaling
# ----------------------------

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ----------------------------
# 7. Random Forest Model
# ----------------------------

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)

# ----------------------------
# 8. Predictions
# ----------------------------

y_pred = rf_model.predict(X_test)
y_prob = rf_model.predict_proba(X_test)[:,1]

# ----------------------------
# 9. Model Evaluation
# ----------------------------

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print("\nModel Performance")
print("----------------------")
print("Accuracy :", round(accuracy,4))
print("Precision:", round(precision,4))
print("Recall   :", round(recall,4))
print("F1 Score :", round(f1,4))
print("ROC AUC  :", round(roc_auc,4))

print("\nConfusion Matrix")
print(confusion_matrix(y_test, y_pred))

# ----------------------------
# 10. Feature Importance
# ----------------------------

importance = rf_model.feature_importances_

feature_importance = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importance
}).sort_values(by="Importance", ascending=False)

print("\nFeature Importance")
print(feature_importance)

# ----------------------------
# 11. Save Model and Preprocessors
# ----------------------------

# Save in current folder (no need for ../models)
joblib.dump(rf_model, "rf_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(imputer, "imputer.pkl")

print("\nModel and preprocessors saved successfully in current directory!")

# ----------------------------
# 12. Example Prediction
# ----------------------------

# Example new transaction
# Columns: amount, transaction_time, device_id, location,
# transactions_last_hour, is_new_device, is_foreign_transaction
new_transaction = np.array([[5000, 20, 3, 2, 6, 1, 1]])

# Apply same preprocessing
new_transaction = imputer.transform(new_transaction)
new_transaction = scaler.transform(new_transaction)

prediction = rf_model.predict(new_transaction)
probability = rf_model.predict_proba(new_transaction)

print("\nNew Transaction Prediction")
print("Fraud:", prediction[0])
print("Fraud Probability:", probability[0][1])