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

# First, create a few workorders to list
print("Creating test workorders...")
print("=" * 40)

workorders_to_create = [
    {
        "description": "Oil change and filter replacement",
        "status": "pending",
        "notes": ["Customer requested synthetic oil", "Check tire pressure"]
    },
    {
        "description": "Transmission fluid check",
        "status": "inProgress",
        "notes": ["Fluid appears dark", "Schedule full service"]
    },
    {
        "description": "Battery test and replacement",
        "status": "completed",
        "notes": ["Battery failed load test", "Replaced with new battery"]
    }
]

create_mutation = """
mutation CreateWorkOrder($accountId: ID!, $input: CreateWorkOrderInput!) { 
  createWorkOrder(accountId: $accountId, input: $input) { 
    workOrderId 
  } 
}
"""

created_ids = []
for i, workorder in enumerate(workorders_to_create):
    create_variables = {
        "accountId": ACCOUNT_ID,
        "input": {
            "contactId": "550e8400-e29b-41d4-a716-446655440001",
            "unitId": "550e8400-e29b-41d4-a716-446655440002",
            "status": workorder["status"],
            "description": workorder["description"],
            "notes": workorder["notes"]
        }
    }
    
    create_payload = {
        "query": create_mutation,
        "variables": create_variables
    }
    
    response = requests.post(APPSYNC_URL, headers=headers, json=create_payload)
    result = response.json()
    
    if "data" in result and result["data"]["createWorkOrder"]:
        wo_id = result["data"]["createWorkOrder"]["workOrderId"]
        created_ids.append(wo_id)
        print(f"  ✅ Created workorder {i+1}: {wo_id}")
    else:
        print(f"  ❌ Failed to create workorder {i+1}")

print(f"\nCreated {len(created_ids)} test workorders")

# Now test listing workorders
print("\n\nTesting listWorkOrders query...")
print("=" * 40)

# Test 1: List without pagination
print("\nTest 1: List all workorders (default page size)")
list_query = """
query ListWorkOrders($accountId: ID!) {
  listWorkOrders(accountId: $accountId) {
    items {
      workOrderId
      status
      description
      createdAt
      updatedAt
    }
    nextCursor
    pageSize
    count
  }
}
"""

list_variables = {
    "accountId": ACCOUNT_ID
}

list_payload = {
    "query": list_query,
    "variables": list_variables
}

response = requests.post(APPSYNC_URL, headers=headers, json=list_payload)
result = response.json()

print("Response:")
print(json.dumps(result, indent=2))

if "data" in result and result["data"]["listWorkOrders"]:
    list_result = result["data"]["listWorkOrders"]
    print(f"\n✅ Successfully listed workorders")
    print(f"   Total items returned: {list_result['count']}")
    print(f"   Page size: {list_result['pageSize']}")
    if list_result.get('nextCursor'):
        print(f"   Next cursor: {list_result['nextCursor']}")
    
    print("\n   WorkOrders:")
    for wo in list_result["items"]:
        created = datetime.fromtimestamp(wo['createdAt']).strftime('%Y-%m-%d %H:%M:%S')
        print(f"   - {wo['workOrderId']}: {wo['status']} - {wo['description'][:50]}... (created: {created})")

# Test 2: List with custom page size
print("\n\nTest 2: List with custom page size (2)")
list_query_paginated = """
query ListWorkOrders($accountId: ID!, $pageSize: Int) {
  listWorkOrders(accountId: $accountId, pageSize: $pageSize) {
    items {
      workOrderId
      status
      description
    }
    nextCursor
    pageSize
    count
  }
}
"""

list_variables_paginated = {
    "accountId": ACCOUNT_ID,
    "pageSize": 2
}

list_payload_paginated = {
    "query": list_query_paginated,
    "variables": list_variables_paginated
}

response = requests.post(APPSYNC_URL, headers=headers, json=list_payload_paginated)
result = response.json()

print("Response:")
print(json.dumps(result, indent=2))

if "data" in result and result["data"]["listWorkOrders"]:
    list_result = result["data"]["listWorkOrders"]
    print(f"\n✅ Successfully listed workorders with page size 2")
    print(f"   Items returned: {list_result['count']}")
    print(f"   Has more pages: {'Yes' if list_result.get('nextCursor') else 'No'}")
    
    # Test 3: Use cursor for next page
    if list_result.get('nextCursor'):
        print("\n\nTest 3: Get next page using cursor")
        
        list_query_cursor = """
        query ListWorkOrders($accountId: ID!, $pageSize: Int, $cursor: String) {
          listWorkOrders(accountId: $accountId, pageSize: $pageSize, cursor: $cursor) {
            items {
              workOrderId
              status
              description
            }
            nextCursor
            pageSize
            count
          }
        }
        """
        
        list_variables_cursor = {
            "accountId": ACCOUNT_ID,
            "pageSize": 2,
            "cursor": list_result['nextCursor']
        }
        
        list_payload_cursor = {
            "query": list_query_cursor,
            "variables": list_variables_cursor
        }
        
        response = requests.post(APPSYNC_URL, headers=headers, json=list_payload_cursor)
        result = response.json()
        
        print("Response:")
        print(json.dumps(result, indent=2))
        
        if "data" in result and result["data"]["listWorkOrders"]:
            cursor_result = result["data"]["listWorkOrders"]
            print(f"\n✅ Successfully retrieved next page")
            print(f"   Items on this page: {cursor_result['count']}")