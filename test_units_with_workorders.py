#!/usr/bin/env python3
import os
import requests
import json
import subprocess

# Configuration
APPSYNC_URL = "https://bhb4mxo4ajdifnkiivqe6v4aey.appsync-api.us-west-2.amazonaws.com/graphql"
ACCOUNT_ID = "38c14370-a081-70c1-80e7-900c418472e5"

# Get ID token
try:
    id_token = subprocess.check_output("./get_token.sh", shell=True).decode('utf-8').strip()
except Exception as e:
    print(f"Error getting token: {e}")
    print("Please ensure get_token.sh exists and is executable")
    exit(1)

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {id_token}"
}

# Test getUnitWithWorkOrders query
def test_get_units_with_workorders():
    query = """
    query GetUnitsWithWorkOrders($cursor: String, $limit: Int) {
      getUnitWithWorkOrders(cursor: $cursor, limit: $limit) {
        items {
          id
          accountId
          locationId
          suggestedVin
          model
          modelYear
          make
          manufacturerName
          vehicleType
          unitType
          createdAt
          updatedAt
          workOrders {
            workOrderId
            accountId
            unitId
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
    
    response = requests.post(
        APPSYNC_URL,
        headers=headers,
        json={"query": query, "variables": variables}
    )
    
    result = response.json()
    print("\n========== GET UNITS WITH WORKORDERS TEST ==========")
    print(f"Response Status: {response.status_code}")
    
    if "errors" in result:
        print("\nErrors:")
        print(json.dumps(result["errors"], indent=2))
    
    if "data" in result and result["data"]:
        data = result["data"]["getUnitWithWorkOrders"]
        print(f"\nFound {len(data['items'])} units")
        print(f"Has more results: {data.get('hasMore', False)}")
        if data.get('cursor'):
            print(f"Next cursor: {data['cursor']}")
        
        for unit in data["items"]:
            print(f"\n--- Unit {unit['id']} ---")
            print(f"  Make: {unit.get('make', 'N/A')}")
            print(f"  Model: {unit.get('model', 'N/A')}")
            print(f"  Model Year: {unit.get('modelYear', 'N/A')}")
            print(f"  VIN: {unit.get('suggestedVin', 'N/A')}")
            print(f"  Vehicle Type: {unit.get('vehicleType', 'N/A')}")
            print(f"  Unit Type: {unit.get('unitType', 'N/A')}")
            print(f"  Work Orders: {len(unit.get('workOrders', []))}")
            
            for wo in unit.get('workOrders', []):
                print(f"    - WO ID {wo['workOrderId']}: {wo['description']} (Status: {wo['status']})")

if __name__ == "__main__":
    test_get_units_with_workorders()