import sys
import json
import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# --- Path Setup ---
# Always resolve models relative to THIS script's directory (hack/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_models():
    """Load all 4 ML models with absolute paths."""
    iso_model  = joblib.load(os.path.join(BASE_DIR, "isolation", "iso_model_premium.pkl"))
    rf_model   = joblib.load(os.path.join(BASE_DIR, "random forest", "rf_model.pkl"))
    svm_model  = joblib.load(os.path.join(BASE_DIR, "SVM", "svm_payment_model.pkl"))
    xgb_model  = joblib.load(os.path.join(BASE_DIR, "XG", "xgb_fraud_pipeline.pkl"))
    return iso_model, rf_model, svm_model, xgb_model

def extract_behavioral_features(data: dict) -> dict:
    """
    Build rich behavioral features from transaction context.
    This is where real fraud detection intelligence lives.
    """
    amount             = float(data.get('amount', 0))
    hour               = int(data.get('transaction_hour', datetime.now().hour))
    is_new_device      = int(data.get('is_new_device', 0))
    is_new_location    = int(data.get('is_new_location', 0))
    txn_velocity       = int(data.get('txn_last_5min', 1))     # Transactions in last 5 min
    avg_amount         = float(data.get('avg_user_amount', 500))
    account_age_days   = int(data.get('account_age_days', 180))
    past_fraud_count   = int(data.get('past_fraud_count', 0))

    # --- Derived Smart Features ---
    is_midnight        = 1 if (hour >= 0 and hour <= 5) else 0
    is_large_txn       = 1 if amount > avg_amount * 3 else 0
    amount_ratio       = min(amount / max(avg_amount, 1), 20.0)   # Cap at 20x
    high_velocity      = 1 if txn_velocity >= 3 else 0
    new_user           = 1 if account_age_days < 30 else 0

    return {
        'amount':               amount,
        'hour':                 hour,
        'is_new_device':        is_new_device,
        'is_new_location':      is_new_location,
        'txn_velocity':         txn_velocity,
        'avg_amount':           avg_amount,
        'account_age_days':     account_age_days,
        'past_fraud_count':     past_fraud_count,
        'is_midnight':          is_midnight,
        'is_large_txn':         is_large_txn,
        'amount_ratio':         amount_ratio,
        'high_velocity':        high_velocity,
        'new_user':             new_user,
    }

def rule_based_score(features: dict) -> tuple:
    """
    Rule-based fraud detection layer.
    Even major banks layer hard rules on top of ML.
    Returns (rule_score 0-1, triggered_rules list)
    """
    score  = 0.0
    rules  = []
    a      = features

    if a['amount'] > 50000 and a['is_new_device']:
        score += 0.40
        rules.append("HIGH_AMOUNT + NEW_DEVICE")

    if a['is_midnight'] and a['amount'] > 10000:
        score += 0.25
        rules.append("MIDNIGHT_HIGH_AMOUNT")

    if a['high_velocity']:
        score += 0.20
        rules.append(f"HIGH_VELOCITY ({a['txn_velocity']} txns/5min)")

    if a['is_new_device'] and a['is_new_location']:
        score += 0.20
        rules.append("NEW_DEVICE + NEW_LOCATION")

    if a['past_fraud_count'] > 0:
        score += 0.30
        rules.append(f"PAST_FRAUD_HISTORY ({a['past_fraud_count']})")

    if a['is_large_txn']:
        score += 0.15
        rules.append(f"LARGE_TXN ({a['amount_ratio']:.1f}x avg)")

    if a['new_user'] and a['amount'] > 5000:
        score += 0.15
        rules.append("NEW_ACCOUNT + HIGH_AMOUNT")

    return min(score, 1.0), rules

def get_ml_scores(features: dict, iso_model, rf_model, svm_model, xgb_model) -> dict:
    iso_score, rf_score, svm_score, xgb_score = 0.0, 0.0, 0.0, 0.0

    try:
        iso_input = pd.DataFrame([{
            "transaction_amount":  features['amount'],
            "transaction_last_min": features['txn_velocity'],
            "failed_transaction":  features['past_fraud_count'],
            "account_age":         features['account_age_days'],
            "payment_method_enc":  1
        }], dtype=float)
        raw_iso = iso_model.decision_function(iso_input.values)[0]
        iso_score = max(0.0, min(1.0, (raw_iso + 0.5) / 1.0))
    except Exception as e:
        print(f"ISO ERR: {e}", file=sys.stderr)

    try:
        rf_input = pd.DataFrame([{
            "amount":                   features['amount'],
            "transaction_time":         features['hour'],
            "device_id":                2 if features['is_new_device'] else 1,
            "location":                 2 if features['is_new_location'] else 1,
            "transactions_last_hour":   features['txn_velocity'] * 4,
            "is_new_device":            features['is_new_device'],
            "is_foreign_transaction":   features['is_new_location']
        }], dtype=float)
        rf_score = float(rf_model.predict_proba(rf_input.values)[0][1])
    except Exception as e:
        print(f"RF ERR: {e}", file=sys.stderr)

    try:
        svm_input = pd.DataFrame([{
            "amount":                   features['amount'],
            "transaction_time":         features['hour'],
            "device_id":                2 if features['is_new_device'] else 1,
            "location":                 2 if features['is_new_location'] else 1,
            "transactions_last_hour":   features['txn_velocity'] * 4,
            "is_new_device":            features['is_new_device'],
            "is_foreign_transaction":   features['is_new_location'],
            "Payment_Method":           1,
            "User_Location":            2 if features['is_new_location'] else 1,
            "Device_Type":              2 if features['is_new_device'] else 1,
            "extra_feature":            0
        }], dtype=float)
        svm_score = float(svm_model.predict_proba(svm_input.values)[0][1])
    except Exception as e:
        print(f"SVM ERR: {e}", file=sys.stderr)

    try:
        xgb_input = pd.DataFrame([{
            "transaction_amount":              float(features['amount']),
            "account_age":                     int(features['account_age_days']),
            "avg_transaction_amount":          float(features['avg_amount']),
            "transaction_frequency_last_24h":  int(features['txn_velocity'] * 12),
            "transaction_frequency_last_7d":   int(features['txn_velocity'] * 84),
            "time_since_last_transaction":     300 if features['high_velocity'] else 3600,
            "transaction_type":                "online",
            "merchant_category":               "pharmacy",  # OHE handles unknown gracefully
            "device_id":                       "device_new" if features['is_new_device'] else "device_1",
            "browser":                         "chrome",
            "ip_address_location":             "US",
            "is_vpn":                          int(features['is_new_location']),
            "unusual_location_flag":           int(features['is_new_location']),
            "high_risk_merchant_flag":         1 if features['is_large_txn'] else 0
        }])
        
        xgb_score = float(xgb_model.predict_proba(xgb_input)[0][1])
    except Exception as e:
        print(f"XGB ERR: {e}", file=sys.stderr)

    return {
        "iso":  iso_score,
        "rf":   rf_score,
        "svm":  svm_score,
        "xgb":  xgb_score
    }

def predict():
    try:
        input_data = json.loads(sys.stdin.read())
        features   = extract_behavioral_features(input_data)

        # Load ML models
        iso_model, rf_model, svm_model, xgb_model = load_models()

        # Run ML ensemble
        ml_scores  = get_ml_scores(features, iso_model, rf_model, svm_model, xgb_model)

        # Weighted ML ensemble score (50% of final)
        ml_ensemble = (
            0.20 * ml_scores['iso'] +
            0.30 * ml_scores['rf']  +
            0.25 * ml_scores['svm'] +
            0.25 * ml_scores['xgb']
        )

        # Rule-based score (50% of final — very powerful)
        rule_score, triggered_rules = rule_based_score(features)

        # Final combined score
        final_score = (0.50 * ml_ensemble) + (0.50 * rule_score)

        # Adaptive threshold: lower threshold for high-risk signals
        threshold_high = 0.55 if (features['is_new_device'] or features['is_new_location']) else 0.65

        if final_score >= threshold_high:
            risk_level = "HIGH RISK"
        elif final_score >= 0.35:
            risk_level = "MEDIUM RISK"
        else:
            risk_level = "LOW RISK"

        result = {
            "ensemble_score":   round(final_score, 4),
            "ml_score":         round(ml_ensemble, 4),
            "rule_score":       round(rule_score, 4),
            "risk_level":       risk_level,
            "fraud_prediction": int(final_score >= threshold_high),
            "triggered_rules":  triggered_rules,
            "behavioral_flags": {
                "is_midnight":      bool(features['is_midnight']),
                "is_large_txn":     bool(features['is_large_txn']),
                "is_new_device":    bool(features['is_new_device']),
                "is_new_location":  bool(features['is_new_location']),
                "high_velocity":    bool(features['high_velocity']),
                "amount_ratio":     round(features['amount_ratio'], 2)
            },
            "models": ml_scores
        }

        print(json.dumps(result))

    except Exception as e:
        # If models fail to load, use rule-based only
        try:
            input_data = json.loads(sys.stdin.read()) if 'input_data' not in dir() else input_data
            features   = extract_behavioral_features(input_data)
        except:
            features = extract_behavioral_features({})

        rule_score, triggered_rules = rule_based_score(features)

        if rule_score >= 0.5:
            risk_level = "HIGH RISK"
        elif rule_score >= 0.3:
            risk_level = "MEDIUM RISK"
        else:
            risk_level = "LOW RISK"

        print(json.dumps({
            "ensemble_score":   round(rule_score, 4),
            "ml_score":         0.0,
            "rule_score":       round(rule_score, 4),
            "risk_level":       risk_level,
            "fraud_prediction": int(rule_score >= 0.5),
            "triggered_rules":  triggered_rules,
            "note":             "ML unavailable — rule-based only",
            "error_detail":     str(e),
            "models":           {"iso": 0.0, "rf": 0.0, "svm": 0.0, "xgb": 0.0}
        }))

if __name__ == "__main__":
    predict()
