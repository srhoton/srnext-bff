/**
 * Types for Unit entities based on the commercialVehicleType schema
 */

export interface ExtendedAttribute {
  attributeName: string;
  attributeValue: string;
}

export interface AcesAttribute {
  attributeName: string;
  attributeValue: string;
  attributeKey: string;
}

export interface Unit {
  id: string;
  accountId: string;
  locationId: string;
  unitType?: "commercialVehicleType";
  suggestedVin: string;
  errorCode?: string;
  possibleValues?: string;
  additionalErrorText?: string | null;
  errorText?: string;
  vehicleDescriptor?: string;
  destinationMarket?: string | null;
  make?: string;
  manufacturerName?: string;
  model?: string;
  modelYear?: string;
  plantCity?: string;
  series?: string;
  trim?: string | null;
  vehicleType?: string;
  plantCountry?: string;
  plantCompanyName?: string | null;
  plantState?: string | null;
  trim2?: string | null;
  series2?: string | null;
  note?: string;
  basePrice?: string | null;
  nonLandUse?: string | null;
  bodyClass?: string;
  doors?: string;
  windows?: string | null;
  wheelBaseType?: string | null;
  trackWidthInches?: string | null;
  grossVehicleWeightRatingFrom?: string;
  bedLengthInches?: string | null;
  curbWeightPounds?: string | null;
  wheelBaseInchesFrom?: string;
  wheelBaseInchesTo?: string | null;
  grossCombinationWeightRatingFrom?: string | null;
  grossCombinationWeightRatingTo?: string | null;
  grossVehicleWeightRatingTo?: string;
  bedType?: string;
  cabType?: string;
  trailerTypeConnection?: string;
  trailerBodyType?: string;
  trailerLengthFeet?: string | null;
  otherTrailerInfo?: string | null;
  numberOfWheels?: string | null;
  wheelSizeFrontInches?: string | null;
  wheelSizeRearInches?: string | null;
  customMotorcycleType?: string;
  motorcycleSuspensionType?: string;
  motorcycleChassisType?: string;
  otherMotorcycleInfo?: string | null;
  fuelTankType?: string | null;
  fuelTankMaterial?: string | null;
  combinedBrakingSystem?: string | null;
  wheelieMitigation?: string | null;
  busLengthFeet?: string | null;
  busFloorConfigurationType?: string;
  busType?: string;
  otherBusInfo?: string | null;
  entertainmentSystem?: string | null;
  steeringLocation?: string | null;
  numberOfSeats?: string | null;
  numberOfSeatRows?: string | null;
  transmissionStyle?: string | null;
  transmissionSpeeds?: string | null;
  driveType?: string | null;
  axles?: string | null;
  axleConfiguration?: string | null;
  brakeSystemType?: string | null;
  brakeSystemDescription?: string | null;
  otherBatteryInfo?: string | null;
  batteryType?: string | null;
  numberOfBatteryCellsPerModule?: string | null;
  batteryCurrentAmpsFrom?: string | null;
  batteryVoltageVoltsFrom?: string | null;
  batteryEnergyKwhFrom?: string | null;
  evDriveUnit?: string | null;
  batteryCurrentAmpsTo?: string | null;
  batteryVoltageVoltsTo?: string | null;
  batteryEnergyKwhTo?: string | null;
  numberOfBatteryModulesPerPack?: string | null;
  numberOfBatteryPacksPerVehicle?: string | null;
  chargerLevel?: string | null;
  chargerPowerKw?: string | null;
  engineNumberOfCylinders?: string;
  displacementCc?: string;
  displacementCi?: string;
  displacementL?: string;
  engineStrokeCycles?: string | null;
  engineModel?: string | null;
  enginePowerKw?: string | null;
  fuelTypePrimary?: string;
  valveTrainDesign?: string | null;
  engineConfiguration?: string | null;
  fuelTypeSecondary?: string | null;
  fuelDeliveryFuelInjectionType?: string | null;
  engineBrakeHpFrom?: string;
  coolingType?: string | null;
  engineBrakeHpTo?: string | null;
  electrificationLevel?: string | null;
  otherEngineInfo?: string | null;
  turbo?: string | null;
  topSpeedMph?: string | null;
  engineManufacturer?: string | null;
  pretensioner?: string | null;
  seatBeltType?: string;
  otherRestraintSystemInfo?: string;
  curtainAirBagLocations?: string | null;
  seatCushionAirBagLocations?: string | null;
  frontAirBagLocations?: string;
  kneeAirBagLocations?: string | null;
  sideAirBagLocations?: string | null;
  antiLockBrakingSystem?: string | null;
  electronicStabilityControl?: string | null;
  tractionControl?: string | null;
  tirePressureMonitoringSystemType?: string | null;
  activeSafetySystemNote?: string | null;
  autoReverseSystemForWindowsAndSunroofs?: string | null;
  automaticPedestrianAlertingSound?: string | null;
  eventDataRecorder?: string | null;
  keylessIgnition?: string | null;
  saeAutomationLevelFrom?: string | null;
  saeAutomationLevelTo?: string | null;
  adaptiveCruiseControl?: string | null;
  crashImminentBraking?: string | null;
  forwardCollisionWarning?: string | null;
  dynamicBrakeSupport?: string | null;
  pedestrianAutomaticEmergencyBraking?: string | null;
  blindSpotWarning?: string | null;
  laneDepartureWarning?: string | null;
  laneKeepingAssistance?: string | null;
  blindSpotIntervention?: string | null;
  laneCenteringAssistance?: string | null;
  backupCamera?: string | null;
  parkingAssist?: string | null;
  rearCrossTrafficAlert?: string | null;
  rearAutomaticEmergencyBraking?: string | null;
  automaticCrashNotification?: string | null;
  daytimeRunningLight?: string | null;
  headlampLightSource?: string | null;
  semiautomaticHeadlampBeamSwitching?: string | null;
  adaptiveDrivingBeam?: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number;
  extendedAttributes?: ExtendedAttribute[];
  acesAttributes?: AcesAttribute[];
}

export interface CreateUnitInput extends Omit<Unit, "id"> {}
export interface UpdateUnitInput extends Partial<Unit> {
  id: string;
}

/**
 * API Response types
 */
export interface PaginatedResponse<T = Unit> {
  items: T[];
  cursor?: string;
  hasMore?: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, string>;
  requestId?: string;
}

/**
 * API Request parameters
 */
export interface ListUnitsParams {
  accountId: string;
  cursor?: string;
  limit?: number;
}

export interface GetUnitParams {
  accountId: string;
  id: string;
}

export interface CreateUnitParams {
  accountId: string;
  unit: CreateUnitInput;
}

export interface UpdateUnitParams {
  accountId: string;
  id: string;
  unit: UpdateUnitInput;
}

export interface DeleteUnitParams {
  accountId: string;
  id: string;
}

/**
 * WorkOrder types (subset needed for units with work orders)
 */
export type WorkOrderStatus = 'draft' | 'pending' | 'inProgress' | 'completed';

export interface WorkOrder {
  workOrderId: string;
  accountId: string;
  contactId: string;
  unitId: string;
  status: WorkOrderStatus;
  description: string;
  notes: string[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

/**
 * Unit with associated work orders
 */
export interface UnitWithWorkOrders extends Unit {
  workOrders: WorkOrder[];
}