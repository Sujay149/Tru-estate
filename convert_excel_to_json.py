#!/usr/bin/env python3
import pandas as pd
import numpy as np
import json
from pathlib import Path

# Read the Excel file
excel_file = Path('truestate_assignment_dataset.csv.xlsx')
print(f"Reading {excel_file}...")

try:
    # Try reading with openpyxl first (for .xlsx files)
    df = pd.read_excel(excel_file, engine='openpyxl')
    print(f"Successfully read Excel file with {len(df)} rows")
except Exception as e:
    print(f"Error reading Excel file: {e}")
    exit(1)

# Display first few rows to understand structure
print("\nFirst few rows:")
print(df.head())
print("\nColumn names:")
print(df.columns.tolist())
print(f"\nDataFrame shape: {df.shape}")

# Sample the data - use first 10000 records for reasonable app performance
sample_size = min(10000, len(df))
print(f"\nSampling {sample_size} records for app performance...")
df = df.head(sample_size)

# Convert to JSON
output_path = Path('src/data/sales.json')
output_path.parent.mkdir(parents=True, exist_ok=True)

# Convert timestamps and NaN values
def convert_value(val):
    if pd.isna(val):
        return None
    elif isinstance(val, pd.Timestamp):
        return val.strftime('%Y-%m-%d')
    elif isinstance(val, (int, float, np.integer, np.floating)):
        # Convert numpy types to Python types
        return float(val) if isinstance(val, (float, np.floating)) else int(val)
    elif isinstance(val, list):
        return [str(v) for v in val]
    else:
        return str(val).strip() if isinstance(val, str) else val

# Normalize column names to match our interface
column_mapping = {
    'Transaction ID': 'transactionId',
    'Date': 'date',
    'Customer ID': 'customerId',
    'Customer Name': 'customerName',
    'Phone Number': 'phoneNumber',
    'Gender': 'gender',
    'Age': 'age',
    'Customer Region': 'customerRegion',
    'Customer Type': 'customerType',
    'Product ID': 'productId',
    'Product Name': 'productName',
    'Brand': 'brand',
    'Product Category': 'productCategory',
    'Tags': 'tags',
    'Quantity': 'quantity',
    'Price per Unit': 'pricePerUnit',
    'Discount Percentage': 'discountPercentage',
    'Total Amount': 'totalAmount',
    'Final Amount': 'finalAmount',
    'Payment Method': 'paymentMethod',
    'Order Status': 'orderStatus',
    'Delivery Type': 'deliveryType',
    'Store ID': 'storeId',
    'Store Location': 'storeLocation',
    'Salesperson ID': 'salespersonId',
    'Employee Name': 'employeeName'
}

# Rename columns
df = df.rename(columns=column_mapping)

# Convert all values properly
records = []
for _, row in df.iterrows():
    record = {}
    for col in df.columns:
        value = row[col]
        if col == 'tags' and pd.notna(value):
            # Split tags if they're comma-separated
            tags_str = str(value).strip()
            record[col] = [t.strip() for t in tags_str.split(',')] if tags_str else []
        else:
            record[col] = convert_value(value)
    records.append(record)

# Write to JSON file
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully converted to {output_path}")
print(f"Total records: {len(records)}")
print("\nSample record:")
print(json.dumps(records[0], indent=2, ensure_ascii=False))
