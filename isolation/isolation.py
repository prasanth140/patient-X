import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import IsolationForest
import joblib

# =========================
# LOAD DATASET
# =========================
print("Loading Dataset...\n")
df = pd.read_csv(r"C:\Users\PRASANTH\Desktop\hackathon\backend\dataset\isolation_dataset.csv")
print(df.head())
print("\nTotal Records:", len(df))

# =========================
# FEATURE ENGINEERING
# =========================

# Encode categorical features
if 'payment_method' in df.columns:
    le = LabelEncoder()
    df['payment_method_enc'] = le.fit_transform(df['payment_method'])
else:
    print("No 'payment_method' column found. Skipping encoding.")

# Select features for Isolation Forest
features = [
    'transaction_amount',
    'transaction_last_min',
    'failed_transaction',
    'account_age'
]

# Include encoded payment method if exists
if 'payment_method_enc' in df.columns:
    features.append('payment_method_enc')

X = df[features].copy()

# Standardize numeric features
numeric_cols = ['transaction_amount', 'transaction_last_min', 'failed_transaction', 'account_age']
scaler = StandardScaler()
X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

# =========================
# TRAIN ISOLATION FOREST
# =========================
print("\nTraining Isolation Forest Model...\n")
iso = IsolationForest(
    n_estimators=200,
    max_samples='auto',
    contamination=0.05,
    random_state=42
)
iso.fit(X)
print("Model Training Completed\n")

# =========================
# PREDICT ANOMALIES
# =========================
df['anomaly_prediction'] = iso.predict(X)
df['anomaly_score'] = iso.decision_function(X)
df['anomaly_prediction'] = df['anomaly_prediction'].map({1: 'Normal', -1: 'Anomaly'})

# Define risk levels based on anomaly score
def risk_level(score):
    if score < -0.10:
        return "HIGH RISK"
    elif score < 0:
        return "MEDIUM RISK"
    else:
        return "LOW RISK"

df['risk_level'] = df['anomaly_score'].apply(risk_level)

# =========================
# DISPLAY RESULTS
# =========================
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 200)

print("\nANOMALY DETECTION RESULTS WITH ALL INDEPENDENT VARIABLES:\n")
print(df[features + ['anomaly_prediction', 'anomaly_score', 'risk_level']].head(20))

# =========================
# SAVE MODEL AND DATA
# =========================
joblib.dump(iso, "iso_model_premium.pkl")  # saves model in current folder
df.to_csv('dataset_with_anomalies.csv', index=False)  # saves dataset in current folder

print("\nPremium Model saved as 'iso_model_premium.pkl'")
print("Dataset with anomaly results saved as 'dataset_with_anomalies.csv'")