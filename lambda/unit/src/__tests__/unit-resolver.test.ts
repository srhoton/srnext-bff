import { UnitResolver } from "../handlers/unit-resolver";
import { AppSyncResolverEvent, GetUnitArguments } from "../types";
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
});