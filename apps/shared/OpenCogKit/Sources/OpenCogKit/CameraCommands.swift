import Foundation

public enum OpenCogCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum OpenCogCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum OpenCogCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum OpenCogCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct OpenCogCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: OpenCogCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: OpenCogCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: OpenCogCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: OpenCogCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct OpenCogCameraClipParams: Codable, Sendable, Equatable {
    public var facing: OpenCogCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: OpenCogCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: OpenCogCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: OpenCogCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
