import CoreLocation
import Foundation
import OpenCogKit
import UIKit

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: OpenCogCameraSnapParams) async throws -> (format: String, base64: String, width: Int, height: Int)
    func clip(params: OpenCogCameraClipParams) async throws -> (format: String, base64: String, durationMs: Int, hasAudio: Bool)
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: OpenCogLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: OpenCogLocationGetParams,
        desiredAccuracy: OpenCogLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
}

protocol DeviceStatusServicing: Sendable {
    func status() async throws -> OpenCogDeviceStatusPayload
    func info() -> OpenCogDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: OpenCogPhotosLatestParams) async throws -> OpenCogPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: OpenCogContactsSearchParams) async throws -> OpenCogContactsSearchPayload
    func add(params: OpenCogContactsAddParams) async throws -> OpenCogContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: OpenCogCalendarEventsParams) async throws -> OpenCogCalendarEventsPayload
    func add(params: OpenCogCalendarAddParams) async throws -> OpenCogCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: OpenCogRemindersListParams) async throws -> OpenCogRemindersListPayload
    func add(params: OpenCogRemindersAddParams) async throws -> OpenCogRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: OpenCogMotionActivityParams) async throws -> OpenCogMotionActivityPayload
    func pedometer(params: OpenCogPedometerParams) async throws -> OpenCogPedometerPayload
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
