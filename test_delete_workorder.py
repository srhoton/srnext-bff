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

# Step 1: Create a workorder to delete
print("Step 1: Creating a workorder to delete...")
print("=" * 40)

create_mutation = """
mutation CreateWorkOrder($accountId: ID!, $input: CreateWorkOrderInput!) { 
  createWorkOrder(accountId: $accountId, input: $input) { 
    workOrderId accountId contactId unitId status description notes createdAt updatedAt 
  } 
}
"""

create_variables = {
    "accountId": ACCOUNT_ID,
    "input": {
        "contactId": "550e8400-e29b-41d4-a716-446655440001",
        "unitId": "550e8400-e29b-41d4-a716-446655440002",
        "status": "pending",
        "description": "Coolant system flush - TO BE DELETED",
        "notes": ["Test workorder for deletion", "This will be removed"]
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

# Step 2: Verify the workorder exists by getting it
print("\n\nStep 2: Verifying workorder exists...")
print("=" * 40)

get_query = """
query GetWorkOrder($accountId: ID!, $workOrderId: ID!) {
  getWorkOrder(accountId: $accountId, workOrderId: $workOrderId) {
    workOrderId
    status
    description
  }
}
"""

get_variables = {
    "accountId": ACCOUNT_ID,
    "workOrderId": workorder_id
}

get_payload = {
    "query": get_query,
    "variables": get_variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=get_payload)
get_result = response.json()

print("Get response:")
print(json.dumps(get_result, indent=2))

if "data" in get_result and get_result["data"]["getWorkOrder"]:
    print("\n✅ WorkOrder verified to exist")
else:
    print("\n❌ Failed to verify workorder")
    exit(1)

# Step 3: Delete the workorder
print("\n\nStep 3: Deleting the workorder...")
print("=" * 40)

delete_mutation = """
mutation DeleteWorkOrder($accountId: ID!, $workOrderId: ID!) {
  deleteWorkOrder(accountId: $accountId, workOrderId: $workOrderId)
}
"""

delete_variables = {
    "accountId": ACCOUNT_ID,
    "workOrderId": workorder_id
}

delete_payload = {
    "query": delete_mutation,
    "variables": delete_variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=delete_payload)
delete_result = response.json()

print("Delete response:")
print(json.dumps(delete_result, indent=2))

if "errors" in delete_result:
    print("\n❌ Failed to delete workorder")
    exit(1)

if delete_result["data"]["deleteWorkOrder"] == True:
    print(f"\n✅ WorkOrder {workorder_id} deleted successfully")
else:
    print(f"\n❌ Failed to delete workorder {workorder_id}")
    exit(1)

# Step 4: Verify the workorder is deleted by trying to get it
print("\n\nStep 4: Verifying workorder is deleted...")
print("=" * 40)

response = requests.post(APPSYNC_URL, headers=headers, json=get_payload)
verify_result = response.json()

print("Verification response:")
print(json.dumps(verify_result, indent=2))

# The workorder might still exist but with a deletedAt timestamp
# or it might return an error - both are valid behaviors
if "errors" in verify_result:
    print("\n✅ Confirmed: WorkOrder no longer accessible (returned error)")
elif "data" in verify_result and verify_result["data"]["getWorkOrder"]:
    wo = verify_result["data"]["getWorkOrder"]
    if wo.get("deletedAt"):
        deleted_at = datetime.fromtimestamp(wo["deletedAt"]).strftime('%Y-%m-%d %H:%M:%S')
        print(f"\n✅ Confirmed: WorkOrder marked as deleted at {deleted_at}")
    else:
        print("\n⚠️  Warning: WorkOrder still exists without deletedAt timestamp")
else:
    print("\n✅ Confirmed: WorkOrder no longer exists")

# Step 5: Test error handling - try to delete non-existent workorder
print("\n\nStep 5: Testing error handling (deleting non-existent workorder)...")
print("=" * 40)

fake_workorder_id = "00000000-0000-0000-0000-000000000000"

delete_fake_variables = {
    "accountId": ACCOUNT_ID,
    "workOrderId": fake_workorder_id
}

delete_fake_payload = {
    "query": delete_mutation,
    "variables": delete_fake_variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=delete_fake_payload)
error_result = response.json()

print("Error test response:")
print(json.dumps(error_result, indent=2))

if "errors" in error_result:
    print("\n✅ Correctly returned error for non-existent workorder")
else:
    print("\n⚠️  Warning: No error returned for non-existent workorder")

print("\n\n" + "=" * 50)
print("Delete WorkOrder Testing Complete!")
print("=" * 50)