export enum EventCategory {
  MAINTENANCE = 'maintenance',
  FAULT = 'fault',
  CERTIFICATION = 'certification',
  ERROR_REPORT = 'error_report',
  INSPECTION = 'inspection',
  ACCIDENT = 'accident',
  VIOLATION = 'violation',
  FUEL = 'fuel',
  DRIVER_REPORT = 'driver_report',
  OTHER = 'other'
}

export enum EventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum EventStatus {
  CREATED = 'created',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  ESCALATED = 'escalated'
}

export enum SourceSystem {
  TELEMATICS = 'telematics',
  DRIVER_APP = 'driver_app',
  MAINTENANCE_SYSTEM = 'maintenance_system',
  INSPECTION_APP = 'inspection_app',
  MANUAL_ENTRY = 'manual_entry',
  ELD = 'eld',
  DIAGNOSTIC_TOOL = 'diagnostic_tool',
  EXTERNAL_API = 'external_api',
  OTHER = 'other'
}

export interface MaintenanceDetails {
  actionType?: string;
  description?: string;
  cost?: number;
  partNumbers?: string[];
  laborHours?: number;
  scheduledAt?: string;
  completedAt?: string;
  nextDueAt?: string;
  components?: Array<{
    name: string;
    action: string;
    notes?: string;
  }>;
}

export interface UnitEvent {
  accountId: string;
  eventId: string;
  unitId: string;
  eventType: string;
  eventCategory: EventCategory;
  severity?: EventSeverity;
  priority?: EventPriority;
  description?: string;
  summary?: string;
  sourceSystem?: SourceSystem;
  maintenanceDetails?: MaintenanceDetails;
  status: EventStatus;
  createdAt: string;
  updatedAt?: string;
  acknowledgedAt?: string;
  deletedAt?: string;
  extendedAttributes?: Record<string, unknown>;
}

export interface CreateEventInput {
  accountId: string;
  unitId: string;
  eventType: string;
  eventCategory: EventCategory;
  severity?: EventSeverity;
  priority?: EventPriority;
  description?: string;
  summary?: string;
  sourceSystem?: SourceSystem;
  maintenanceDetails?: MaintenanceDetails;
  extendedAttributes?: Record<string, unknown>;
}

export interface UpdateEventInput {
  eventType?: string;
  eventCategory?: EventCategory;
  severity?: EventSeverity;
  priority?: EventPriority;
  description?: string;
  summary?: string;
  sourceSystem?: SourceSystem;
  maintenanceDetails?: MaintenanceDetails;
  status?: EventStatus;
  extendedAttributes?: Record<string, unknown>;
}

export interface ListEventsParams {
  accountId: string;
  unitId?: string;
  eventCategory?: EventCategory;
  status?: EventStatus;
  severity?: EventSeverity;
  priority?: EventPriority;
  sourceSystem?: SourceSystem;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export interface GetEventParams {
  accountId: string;
  eventId: string;
}

export interface UpdateEventParams {
  accountId: string;
  eventId: string;
}

export interface DeleteEventParams {
  accountId: string;
  eventId: string;
}

export interface PagedEventResponse {
  items: UnitEvent[];
  nextCursor?: string;
  limit: number;
  count: number;
}

export interface DeleteEventResponse {
  success: boolean;
  accountId: string;
  eventId: string;
  message?: string;
}

export interface UnitInfo {
  model?: string;
  modelYear?: string;
  suggestedVin: string;
}

export interface EventWithUnitInfo extends UnitEvent {
  unitInfo: UnitInfo;
}

export interface EventsByStatusConnection {
  items: EventWithUnitInfo[];
  nextCursor?: string;
  limit: number;
  count: number;
}