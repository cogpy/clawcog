import Foundation

public struct OpenCogCanvasNavigateParams: Codable, Sendable, Equatable {
    public var url: String

    public init(url: String) {
        self.url = url
    }
}

public struct OpenCogCanvasPlacement: Codable, Sendable, Equatable {
    public var x: Double?
    public var y: Double?
    public var width: Double?
    public var height: Double?

    public init(x: Double? = nil, y: Double? = nil, width: Double? = nil, height: Double? = nil) {
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    }
}

public struct OpenCogCanvasPresentParams: Codable, Sendable, Equatable {
    public var url: String?
    public var placement: OpenCogCanvasPlacement?

    public init(url: String? = nil, placement: OpenCogCanvasPlacement? = nil) {
        self.url = url
        self.placement = placement
    }
}

public struct OpenCogCanvasEvalParams: Codable, Sendable, Equatable {
    public var javaScript: String

    public init(javaScript: String) {
        self.javaScript = javaScript
    }
}

public enum OpenCogCanvasSnapshotFormat: String, Codable, Sendable {
    case png
    case jpeg

    public init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        let raw = try c.decode(String.self).trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        switch raw {
        case "png":
            self = .png
        case "jpeg", "jpg":
            self = .jpeg
        default:
            throw DecodingError.dataCorruptedError(in: c, debugDescription: "Invalid snapshot format: \(raw)")
        }
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        try c.encode(self.rawValue)
    }
}

public struct OpenCogCanvasSnapshotParams: Codable, Sendable, Equatable {
    public var maxWidth: Int?
    public var quality: Double?
    public var format: OpenCogCanvasSnapshotFormat?

    public init(maxWidth: Int? = nil, quality: Double? = nil, format: OpenCogCanvasSnapshotFormat? = nil) {
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
    }
}
