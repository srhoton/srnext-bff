#!/usr/bin/env python3

import json
import subprocess
import requests

# Get authentication token
print("Getting authentication token...")
result = subprocess.run(["/bin/bash", "./get_token.sh"], capture_output=True, text=True)
token = result.stdout.strip()

if not token:
    print("Failed to get authentication token")
    exit(1)

# Configuration
APPSYNC_URL = "https://bhb4mxo4ajdifnkiivqe6v4aey.appsync-api.us-west-2.amazonaws.com/graphql"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

# Test the new getUnitWithWorkOrders endpoint
print("\nTesting getUnitWithWorkOrders endpoint...")
print("=" * 50)

query = """
query GetUnitWithWorkOrders($limit: Int) {
  getUnitWithWorkOrders(limit: $limit) {
    items {
      id
      suggestedVin
      make
      model
      modelYear
      workOrders {
        workOrderId
        status
        description
        notes
        createdAt
        updatedAt
      }
    }
    cursor
    hasMore
  }
}
"""

variables = {
    "limit": 5
}

payload = {
    "query": query,
    "variables": variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=payload)
result = response.json()

print("Response:")
print(json.dumps(result, indent=2))

if "errors" in result:
    print("\n❌ Query failed with errors")
    for error in result["errors"]:
        print(f"Error: {error.get('message', 'Unknown error')}")
    exit(1)

data = result.get("data", {}).get("getUnitWithWorkOrders", {})
items = data.get("items", [])

print(f"\n✅ Query successful! Found {len(items)} units")

if items:
    print("\nUnit details:")
    print("=" * 30)
    for i, unit in enumerate(items, 1):
        print(f"\nUnit {i}:")
        print(f"  ID: {unit.get('id', 'N/A')}")
        print(f"  VIN: {unit.get('suggestedVin', 'N/A')}")
        print(f"  Make: {unit.get('make', 'N/A')}")
        print(f"  Model: {unit.get('model', 'N/A')}")
        print(f"  Year: {unit.get('modelYear', 'N/A')}")
        
        work_orders = unit.get('workOrders', [])
        print(f"  Work Orders: {len(work_orders)}")
        
        if work_orders:
            for j, wo in enumerate(work_orders, 1):
                print(f"    WO {j}: {wo.get('workOrderId', 'N/A')} - {wo.get('status', 'N/A')}")
                print(f"         Description: {wo.get('description', 'N/A')}")
else:
    print("\nNo units found.")

print(f"\nPagination info:")
print(f"  Has more: {data.get('hasMore', False)}")
print(f"  Cursor: {data.get('cursor', 'None')}")