import Foundation

public enum OpenCogDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum OpenCogBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum OpenCogThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum OpenCogNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum OpenCogNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct OpenCogBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: OpenCogBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: OpenCogBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct OpenCogThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: OpenCogThermalState

    public init(state: OpenCogThermalState) {
        self.state = state
    }
}

public struct OpenCogStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct OpenCogNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: OpenCogNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [OpenCogNetworkInterfaceType]

    public init(
        status: OpenCogNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [OpenCogNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct OpenCogDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: OpenCogBatteryStatusPayload
    public var thermal: OpenCogThermalStatusPayload
    public var storage: OpenCogStorageStatusPayload
    public var network: OpenCogNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: OpenCogBatteryStatusPayload,
        thermal: OpenCogThermalStatusPayload,
        storage: OpenCogStorageStatusPayload,
        network: OpenCogNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct OpenCogDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
