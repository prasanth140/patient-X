# ==========================================
# Premium XGBoost Fraud Detection Pipeline
# Corrected Version with Realistic Accuracy
# ==========================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import roc_auc_score, classification_report, accuracy_score
import xgboost as xgb
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import joblib
import warnings
warnings.filterwarnings("ignore")

# ==========================================
# 1. Create Synthetic Dataset (replace with your CSV)
# ==========================================
np.random.seed(42)
n_samples = 1000

df = pd.DataFrame({
    "transaction_amount": np.random.exponential(100, n_samples),
    "account_age": np.random.randint(1, 3650, n_samples),
    "avg_transaction_amount": np.random.exponential(80, n_samples),
    "transaction_frequency_last_24h": np.random.poisson(2, n_samples),
    "transaction_frequency_last_7d": np.random.poisson(10, n_samples),
    "time_since_last_transaction": np.random.randint(1, 100000, n_samples),
    "transaction_type": np.random.choice(["card", "bank_transfer", "online"], n_samples),
    "merchant_category": np.random.choice(["jewelry", "groceries", "clothing", "dining"], n_samples),
    "device_id": ["device_" + str(i) for i in range(n_samples)],
    "browser": np.random.choice(["chrome", "firefox", "safari"], n_samples),
    "ip_address_location": np.random.choice(["CA", "US", "UK"], n_samples),
    "is_vpn": np.random.randint(0, 2, n_samples),
    "unusual_location_flag": np.random.randint(0, 2, n_samples),
    "high_risk_merchant_flag": np.random.randint(0, 2, n_samples),
    "is_fraud": np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
})

print("Synthetic Dataset Created. Shape:", df.shape)
print(df['is_fraud'].value_counts())

# ==========================================
# 2. Define Features
# ==========================================
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

X = df[numerical_features + categorical_features]
y = df["is_fraud"]

# ==========================================
# 3. Train-Test Split
# ==========================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ==========================================
# 4. Preprocessing
# ==========================================
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numerical_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ]
)

# ==========================================
# 5. Handle Imbalance (SMOTE)
# ==========================================
smote = SMOTE(random_state=42, sampling_strategy=0.5)  # partial oversampling for realism

# ==========================================
# 6. XGBoost Model (reduced complexity)
# ==========================================
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=4,
    subsample=0.7,
    colsample_bytree=0.7,
    gamma=0.1,
    reg_alpha=0.5,
    reg_lambda=1.0,
    scale_pos_weight=1,
    random_state=42,
    n_jobs=-1,
    eval_metric="auc"
)

# ==========================================
# 7. Pipeline
# ==========================================
model_pipeline = ImbPipeline([
    ("preprocessor", preprocessor),
    ("smote", smote),
    ("classifier", xgb_model)
])

# ==========================================
# 8. Train
# ==========================================
model_pipeline.fit(X_train, y_train)

# ==========================================
# 9. Predict & Evaluate
# ==========================================
y_pred = model_pipeline.predict(X_test)
y_prob = model_pipeline.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred) * 100
roc_auc = roc_auc_score(y_test, y_prob)

print("\nTest Accuracy: {:.2f}%".format(accuracy))
print("Test ROC-AUC Score:", round(roc_auc, 4))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# ==========================================
# 10. Fraud Scores
# ==========================================
df_test = X_test.copy()
df_test["fraud_score"] = y_prob
df_test["fraud_prediction"] = y_pred

print("\nSample Fraud Scores:")
print(df_test[["fraud_score", "fraud_prediction"]].head(10))

# ==========================================
# 11. Save Pipeline
# ==========================================
joblib.dump(model_pipeline, "xgb_fraud_pipeline.pkl")
print("\nPipeline saved as 'xgb_fraud_pipeline.pkl' in current directory!")