import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from imblearn.over_sampling import SMOTE  # optional for imbalanced dataset
import joblib

# -----------------------------
# 1. Load the CSV dataset
# -----------------------------
df = pd.read_csv(r"C:\Users\PRASANTH\Desktop\hackathon\backend\dataset\svm_dataset.csv")  # replace with your CSV file

# -----------------------------
# 2. Inspect and preprocess
# -----------------------------
# Encode categorical features
categorical_features = ['Payment_Method', 'User_Location', 'Device_Type']
for col in categorical_features:
    df[col] = LabelEncoder().fit_transform(df[col])

# Split independent and dependent variables
X = df.drop("Transaction_Status", axis=1)
y = df["Transaction_Status"]

# Handle class imbalance with SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
)

# Scale features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# -----------------------------
# 3. Set up SVM with hyperparameter tuning
# -----------------------------
param_grid = {
    'C': [0.1, 1, 10, 50],
    'gamma': ['scale', 0.01, 0.1, 1],
    'kernel': ['rbf', 'poly']  # RBF and Polynomial
}

svm = SVC(class_weight='balanced', probability=True)  # probability=True for ROC-AUC
grid = GridSearchCV(svm, param_grid, refit=True, cv=5, scoring='f1', verbose=2)
grid.fit(X_train, y_train)

# -----------------------------
# 4. Evaluate the model
# -----------------------------
y_pred = grid.predict(X_test)
y_prob = grid.predict_proba(X_test)[:, 1]

print("Best SVM Parameters:", grid.best_params_)
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("ROC-AUC Score:", roc_auc_score(y_test, y_prob))

# -----------------------------
# 5. Save the model and scaler locally
# -----------------------------

# Save in current directory (no ../models needed)
joblib.dump(grid.best_estimator_, "svm_payment_model.pkl")
joblib.dump(scaler, "svm_scaler.pkl")

print("\nSVM model saved as 'svm_payment_model.pkl'")
print("Scaler saved as 'svm_scaler.pkl' in current directory!")