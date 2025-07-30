# Task API UUID Validation Issue

## Issue Summary
The backend task API has a validation constraint that only accepts UUID v1-5 for the `pk` field (account ID), but the JWT tokens from Cognito contain UUID v7 account IDs.

## Technical Details

### Backend Validation Pattern
The backend API validates the `pk` field with this regex pattern:
```
^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

This pattern specifically checks for UUID versions 1-5 in the third group `[1-5]`.

### JWT Account ID Format
The account ID from the JWT token is:
```
38c14370-a081-70c1-80e7-900c418472e5
```

This is a UUID v7 (note the `7` in `70c1`), which doesn't match the backend's validation pattern.

### Error Response
When attempting to create a task with the actual JWT account ID:
```json
{
  "error": "ValidationError",
  "message": "Task validation failed",
  "details": [
    {
      "field": "pk",
      "message": "$.pk: does not match the regex pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    }
  ]
}
```

## Current Implementation Status

### What Works
1. ✅ Task resolver Lambda is deployed and functional
2. ✅ JWT authentication and extraction works correctly
3. ✅ Account ID validation (matching JWT sub claim) is implemented
4. ✅ All GraphQL operations are implemented (create, get, update, delete, list)
5. ✅ The backend API works correctly with UUID v4 account IDs
6. ✅ DynamoDB key structure confirmed: PK=accountId, SK={workOrderId}#{taskId}

### What's Blocked
- Cannot create tasks using real account IDs from JWT tokens due to UUID version mismatch

## Test Results

### Successful Test with UUID v4
When using a mock UUID v4 account ID (`550e8400-e29b-41d4-a716-446655440000`), the backend API works correctly:
- Task creation: ✅ 201 Created
- Correct SK format: `{workOrderId}#{taskId}`
- All fields properly stored and returned

### Failed Test with JWT Account ID (UUID v7)
Using the actual JWT account ID (`38c14370-a081-70c1-80e7-900c418472e5`) results in validation error.

## Recommendations

1. **Backend Fix (Preferred)**: Update the backend validation regex to accept UUID v7:
   ```
   ^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
   ```
   Or use a more general UUID validation pattern.

2. **Alternative**: If UUID v7 support cannot be added, the account system needs to generate UUID v4 account IDs instead.

## Impact
Until this issue is resolved, the task functionality cannot be used in production as all real user accounts have UUID v7 identifiers that are rejected by the backend API.