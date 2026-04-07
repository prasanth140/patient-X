# ==========================================
# Hybrid Fraud Detection Ensemble System
# (Isolation Forest + Random Forest + SVM + XGBoost)
# ==========================================

import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder

# ----------------------------
# 1. Load Models
# ----------------------------
print("Loading models...")

iso_model = joblib.load("isolation/iso_model_premium.pkl")
rf_model = joblib.load("random forest/rf_model.pkl")
svm_model = joblib.load("SVM/svm_payment_model.pkl")
xgb_model = joblib.load("XG/xgb_fraud_pipeline.pkl")

# ----------------------------
# 2. Load Datasets
# ----------------------------
print("Loading datasets...")

iso_df = pd.read_csv("isolation/dataset_with_anomalies.csv")
rf_df = pd.read_csv("random forest/rf_dataset.csv")
svm_df = pd.read_csv("SVM/svm_dataset.csv")
xgb_df = pd.read_csv("XG/xg_dataset.csv")

# ----------------------------
# 3. Ensure transaction_id exists
# ----------------------------
for df in [iso_df, rf_df, svm_df, xgb_df]:
    if "transaction_id" not in df.columns:
        df["transaction_id"] = df.index

# ----------------------------
# 4. Merge transaction IDs
# ----------------------------
merged_df = pd.DataFrame({
    "transaction_id": pd.concat([
        iso_df["transaction_id"],
        rf_df["transaction_id"],
        svm_df["transaction_id"],
        xgb_df["transaction_id"]
    ]).unique()
})

# ----------------------------
# 5. Isolation Forest
# ----------------------------
print("Running Isolation Forest...")

iso_features = [
    "transaction_amount",
    "transaction_last_min",
    "failed_transaction",
    "account_age"
]

if "payment_method" in iso_df.columns:
    le_iso = LabelEncoder()
    iso_df["payment_method_enc"] = le_iso.fit_transform(iso_df["payment_method"])
    iso_features.append("payment_method_enc")

for f in iso_features:
    if f not in iso_df.columns:
        iso_df[f] = 0

X_iso = iso_df.set_index("transaction_id").reindex(merged_df["transaction_id"])[iso_features].fillna(0)

iso_scores = iso_model.decision_function(X_iso)

iso_scores_norm = (iso_scores - iso_scores.min()) / (iso_scores.max() - iso_scores.min())

# ----------------------------
# 6. Random Forest
# ----------------------------
print("Running Random Forest...")

rf_features = [
    "amount",
    "transaction_time",
    "device_id",
    "location",
    "transactions_last_hour",
    "is_new_device",
    "is_foreign_transaction"
]

for f in rf_features:
    if f not in rf_df.columns:
        rf_df[f] = 0

X_rf = rf_df.set_index("transaction_id").reindex(merged_df["transaction_id"])[rf_features].fillna(0)

rf_scores = rf_model.predict_proba(X_rf)[:,1]

# ----------------------------
# 7. SVM Model
# ----------------------------
print("Running SVM...")

svm_features = [
    "amount",
    "transaction_time",
    "device_id",
    "location",
    "transactions_last_hour",
    "is_new_device",
    "is_foreign_transaction",
    "Payment_Method",
    "User_Location",
    "Device_Type",
    "extra_feature"
]

for f in svm_features:
    if f not in svm_df.columns:
        svm_df[f] = 0

X_svm = svm_df.set_index("transaction_id").reindex(merged_df["transaction_id"])[svm_features].fillna(0)

categorical_cols = ["Payment_Method","User_Location","Device_Type"]

for col in categorical_cols:
    if col in X_svm.columns:
        le = LabelEncoder()
        X_svm[col] = le.fit_transform(X_svm[col].astype(str))

svm_scores = svm_model.predict_proba(X_svm)[:,1]

# ----------------------------
# 8. XGBoost Model
# ----------------------------
print("Running XGBoost...")

numerical_features = [
    "transaction_amount",
    "account_age",
    "avg_transaction_amount",
    "transaction_frequency_last_24h",
    "transaction_frequency_last_7d",
    "time_since_last_transaction"
]

categorical_features = [
    "transaction_type",
    "merchant_category",
    "device_id",
    "browser",
    "ip_address_location",
    "is_vpn",
    "unusual_location_flag",
    "high_risk_merchant_flag"
]

xgb_features = numerical_features + categorical_features

for f in xgb_features:
    if f not in xgb_df.columns:
        xgb_df[f] = 0

X_xgb = xgb_df.set_index("transaction_id").reindex(merged_df["transaction_id"])[xgb_features].fillna(0)

xgb_scores = xgb_model.predict_proba(X_xgb)[:,1]

# ----------------------------
# 9. Weighted Ensemble
# ----------------------------
print("Calculating Ensemble Score...")

ensemble_score = (
    0.20 * iso_scores_norm +
    0.30 * rf_scores +
    0.25 * svm_scores +
    0.25 * xgb_scores
)

ensemble_pred = (ensemble_score >= 0.5).astype(int)

# ----------------------------
# 10. Risk Classification
# ----------------------------
def risk_level(score):
    if score >= 0.7:
        return "HIGH RISK"
    elif score >= 0.4:
        return "MEDIUM RISK"
    else:
        return "LOW RISK"

ensemble_risk = [risk_level(s) for s in ensemble_score]

# ----------------------------
# 11. Build Result Table
# ----------------------------
ensemble_df = pd.DataFrame({
    "transaction_id": merged_df["transaction_id"],
    "iso_score": iso_scores_norm,
    "rf_score": rf_scores,
    "svm_score": svm_scores,
    "xgb_score": xgb_scores,
    "ensemble_score": ensemble_score,
    "fraud_prediction": ensemble_pred,
    "risk_level": ensemble_risk
})

# ----------------------------
# 12. Save Results
# ----------------------------
ensemble_df.to_csv("fraud_ensemble_results.csv", index=False)

print("\nEnsemble results saved -> fraud_ensemble_results.csv")

# ----------------------------
# 13. Model Contribution Summary
# ----------------------------
print("\nModel Contribution (Mean Scores):")

print("Isolation Forest:", np.mean(iso_scores_norm))
print("Random Forest:", np.mean(rf_scores))
print("SVM:", np.mean(svm_scores))
print("XGBoost:", np.mean(xgb_scores))

# ----------------------------
# 14. Show Sample Output
# ----------------------------
print("\nSample Predictions:\n")

print(ensemble_df.head(20))

# ----------------------------
# 15. Export Fraud Alerts
# ----------------------------
high_risk_df = ensemble_df[ensemble_df["risk_level"] == "HIGH RISK"]

high_risk_df.to_csv("fraud_alerts.csv", index=False)

print(f"\nTotal HIGH RISK transactions: {len(high_risk_df)}")

print("Fraud alerts exported -> fraud_alerts.csv")

