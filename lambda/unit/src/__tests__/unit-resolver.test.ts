import { UnitResolver } from "../handlers/unit-resolver";
import { AppSyncResolverEvent, GetUnitArguments, GetUnitWithWorkOrdersArguments } from "../types";
import { UnitsApiService } from "../services/units-api.service";

// Mock the UnitsApiService
jest.mock("../services/units-api.service");

describe("UnitResolver", () => {
  const mockEvent: AppSyncResolverEvent<GetUnitArguments> = {
    arguments: {
      id: "test-unit-id",
    },
    identity: {
      sub: "test-account-id",
      issuer: "test-issuer",
      sourceIp: ["127.0.0.1"],
      defaultAuthStrategy: "ALLOW",
      claims: {},
    },
    source: null,
    request: {
      headers: {
        authorization: "Bearer test-token",
      },
    },
    info: {
      fieldName: "getUnit",
      parentTypeName: "Query",
      variables: {},
      selectionSetList: ["id", "suggestedVin"],
      selectionSetGraphQL: "{ id suggestedVin }",
    },
    prev: {
      result: null,
    },
    stash: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUnit", () => {
    it("should successfully get a unit", async () => {
      const mockUnit = {
        id: "test-unit-id",
        accountId: "test-account-id",
        locationId: "test-location-id",
        suggestedVin: "TEST123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: 0,
      };

      const mockGetUnit = jest.fn().mockResolvedValue(mockUnit);
      (UnitsApiService as jest.MockedClass<typeof UnitsApiService>).mockImplementation(() => ({
        getUnit: mockGetUnit,
      } as any));

      const result = await UnitResolver.getUnit(mockEvent);

      expect(mockGetUnit).toHaveBeenCalledWith({
        accountId: "test-account-id",
        id: "test-unit-id",
      });
      expect(result).toEqual(mockUnit);
    });

    it("should throw UnauthorizedError when authorization header is missing", async () => {
      const eventWithoutAuth = {
        ...mockEvent,
        request: {
          headers: {},
        },
      };

      await expect(UnitResolver.getUnit(eventWithoutAuth)).rejects.toThrow(
        "Authorization header is missing"
      );
    });

    it("should throw ValidationError when unit ID is missing", async () => {
      const eventWithoutId = {
        ...mockEvent,
        arguments: {},
      } as AppSyncResolverEvent<GetUnitArguments>;

      await expect(UnitResolver.getUnit(eventWithoutId)).rejects.toThrow(
        "Unit ID is required"
      );
    });
  });

  describe("getUnitWithWorkOrders", () => {
    const mockEventWithWorkOrders: AppSyncResolverEvent<GetUnitWithWorkOrdersArguments> = {
      arguments: {
        limit: 10,
      },
      identity: {
        sub: "test-account-id",
        issuer: "test-issuer",
        sourceIp: ["127.0.0.1"],
        defaultAuthStrategy: "ALLOW",
        claims: {},
      },
      source: null,
      request: {
        headers: {
          authorization: "Bearer test-token",
        },
      },
      info: {
        fieldName: "getUnitWithWorkOrders",
        parentTypeName: "Query",
        variables: {},
        selectionSetList: ["items"],
        selectionSetGraphQL: "{ items { id workOrders { workOrderId } } }",
      },
      prev: {
        result: null,
      },
      stash: {},
    };

    it("should successfully get units with work orders", async () => {
      const mockResponse = {
        items: [
          {
            id: "unit-1",
            accountId: "test-account-id",
            locationId: "test-location-id",
            suggestedVin: "TEST123",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deletedAt: 0,
            workOrders: [
              {
                workOrderId: "wo-1",
                accountId: "test-account-id",
                contactId: "contact-1",
                unitId: "unit-1",
                status: "pending" as const,
                description: "Test work order",
                notes: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          },
        ],
      };

      const mockGetUnitsWithWorkOrders = jest.fn().mockResolvedValue(mockResponse);
      (UnitsApiService as jest.MockedClass<typeof UnitsApiService>).mockImplementation(() => ({
        getUnitsWithWorkOrders: mockGetUnitsWithWorkOrders,
      } as any));

      const result = await UnitResolver.getUnitWithWorkOrders(mockEventWithWorkOrders);

      expect(mockGetUnitsWithWorkOrders).toHaveBeenCalledWith(
        {
          accountId: "test-account-id",
          limit: 10,
        },
        "Bearer test-token"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use default limit when not provided", async () => {
      const eventWithoutLimit = {
        ...mockEventWithWorkOrders,
        arguments: {},
      };

      const mockGetUnitsWithWorkOrders = jest.fn().mockResolvedValue({ items: [] });
      (UnitsApiService as jest.MockedClass<typeof UnitsApiService>).mockImplementation(() => ({
        getUnitsWithWorkOrders: mockGetUnitsWithWorkOrders,
      } as any));

      await UnitResolver.getUnitWithWorkOrders(eventWithoutLimit);

      expect(mockGetUnitsWithWorkOrders).toHaveBeenCalledWith(
        {
          accountId: "test-account-id",
          limit: 20, // default limit
        },
        "Bearer test-token"
      );
    });
  });
});