#!/usr/bin/env python3

import json
import subprocess
import requests
from datetime import datetime

# Get authentication token
print("Getting authentication token...")
result = subprocess.run(["/bin/bash", "./get_token.sh"], capture_output=True, text=True)
token = result.stdout.strip()

if not token:
    print("Failed to get authentication token")
    exit(1)

# Configuration
APPSYNC_URL = "https://bhb4mxo4ajdifnkiivqe6v4aey.appsync-api.us-west-2.amazonaws.com/graphql"
ACCOUNT_ID = "38c14370-a081-70c1-80e7-900c418472e5"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

# Step 1: Create a workorder
print("\nStep 1: Creating a workorder...")
print("=" * 40)

create_mutation = """
mutation CreateWorkOrder($accountId: ID!, $input: CreateWorkOrderInput!) { 
  createWorkOrder(accountId: $accountId, input: $input) { 
    workOrderId accountId contactId unitId status description notes createdAt updatedAt deletedAt 
  } 
}
"""

create_variables = {
    "accountId": ACCOUNT_ID,
    "input": {
        "contactId": "550e8400-e29b-41d4-a716-446655440001",
        "unitId": "550e8400-e29b-41d4-a716-446655440002",
        "status": "pending",
        "description": "Brake inspection and repair",
        "notes": ["Customer reports squeaking noise", "Check brake pads and rotors"]
    }
}

create_payload = {
    "query": create_mutation,
    "variables": create_variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=create_payload)
create_result = response.json()

print("Create response:")
print(json.dumps(create_result, indent=2))

if "errors" in create_result:
    print("\n❌ Failed to create workorder")
    exit(1)

workorder_id = create_result["data"]["createWorkOrder"]["workOrderId"]
print(f"\n✅ WorkOrder created successfully with ID: {workorder_id}")

# Step 2: Update the workorder
print("\n\nStep 2: Updating the workorder...")
print("=" * 40)

update_mutation = """
mutation UpdateWorkOrder($accountId: ID!, $workOrderId: ID!, $input: UpdateWorkOrderInput!) { 
  updateWorkOrder(accountId: $accountId, workOrderId: $workOrderId, input: $input) { 
    workOrderId accountId contactId unitId status description notes createdAt updatedAt deletedAt 
  } 
}
"""

update_variables = {
    "accountId": ACCOUNT_ID,
    "workOrderId": workorder_id,
    "input": {
        "status": "inProgress",
        "description": "Brake inspection in progress - removed wheels for inspection",
        "notes": [
            "Customer reports squeaking noise",
            "Check brake pads and rotors",
            "Front pads show 30% wear",
            "Rotors within spec"
        ]
    }
}

update_payload = {
    "query": update_mutation,
    "variables": update_variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=update_payload)
update_result = response.json()

print("Update response:")
print(json.dumps(update_result, indent=2))

if "errors" in update_result:
    print("\n❌ Failed to update workorder")
    exit(1)

print("\n✅ WorkOrder updated successfully")

# Display comparison
created_wo = create_result["data"]["createWorkOrder"]
updated_wo = update_result["data"]["updateWorkOrder"]

print("\nBefore update:")
print("=" * 20)
print(f"Status: {created_wo['status']}")
print(f"Description: {created_wo['description']}")
print(f"Notes: {', '.join(created_wo['notes'])}")

print("\nAfter update:")
print("=" * 20)
print(f"Status: {updated_wo['status']}")
print(f"Description: {updated_wo['description']}")
print(f"Notes: {', '.join(updated_wo['notes'])}")

# Convert timestamps
print("\nTimestamp info:")
print(f"Created at: {datetime.fromtimestamp(updated_wo['createdAt']).strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Updated at: {datetime.fromtimestamp(updated_wo['updatedAt']).strftime('%Y-%m-%d %H:%M:%S')}")