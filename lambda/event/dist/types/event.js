"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceSystem = exports.EventStatus = exports.EventPriority = exports.EventSeverity = exports.EventCategory = void 0;
var EventCategory;
(function (EventCategory) {
    EventCategory["MAINTENANCE"] = "maintenance";
    EventCategory["FAULT"] = "fault";
    EventCategory["CERTIFICATION"] = "certification";
    EventCategory["ERROR_REPORT"] = "error_report";
    EventCategory["INSPECTION"] = "inspection";
    EventCategory["ACCIDENT"] = "accident";
    EventCategory["VIOLATION"] = "violation";
    EventCategory["FUEL"] = "fuel";
    EventCategory["DRIVER_REPORT"] = "driver_report";
    EventCategory["OTHER"] = "other";
})(EventCategory || (exports.EventCategory = EventCategory = {}));
var EventSeverity;
(function (EventSeverity) {
    EventSeverity["LOW"] = "low";
    EventSeverity["MEDIUM"] = "medium";
    EventSeverity["HIGH"] = "high";
    EventSeverity["CRITICAL"] = "critical";
})(EventSeverity || (exports.EventSeverity = EventSeverity = {}));
var EventPriority;
(function (EventPriority) {
    EventPriority["LOW"] = "low";
    EventPriority["MEDIUM"] = "medium";
    EventPriority["HIGH"] = "high";
    EventPriority["CRITICAL"] = "critical";
})(EventPriority || (exports.EventPriority = EventPriority = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus["CREATED"] = "created";
    EventStatus["ACKNOWLEDGED"] = "acknowledged";
    EventStatus["IN_PROGRESS"] = "in_progress";
    EventStatus["RESOLVED"] = "resolved";
    EventStatus["CLOSED"] = "closed";
    EventStatus["CANCELLED"] = "cancelled";
    EventStatus["ON_HOLD"] = "on_hold";
    EventStatus["ESCALATED"] = "escalated";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var SourceSystem;
(function (SourceSystem) {
    SourceSystem["TELEMATICS"] = "telematics";
    SourceSystem["DRIVER_APP"] = "driver_app";
    SourceSystem["MAINTENANCE_SYSTEM"] = "maintenance_system";
    SourceSystem["INSPECTION_APP"] = "inspection_app";
    SourceSystem["MANUAL_ENTRY"] = "manual_entry";
    SourceSystem["ELD"] = "eld";
    SourceSystem["DIAGNOSTIC_TOOL"] = "diagnostic_tool";
    SourceSystem["EXTERNAL_API"] = "external_api";
    SourceSystem["OTHER"] = "other";
})(SourceSystem || (exports.SourceSystem = SourceSystem = {}));
//# sourceMappingURL=event.js.map