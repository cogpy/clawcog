import OpenCogKit
import OpenCogProtocol
import Foundation

// Prefer the OpenCogKit wrapper to keep gateway request payloads consistent.
typealias AnyCodable = OpenCogKit.AnyCodable
typealias InstanceIdentity = OpenCogKit.InstanceIdentity

extension AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: AnyCodable]? { self.value as? [String: AnyCodable] }
    var arrayValue: [AnyCodable]? { self.value as? [AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}

extension OpenCogProtocol.AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: OpenCogProtocol.AnyCodable]? { self.value as? [String: OpenCogProtocol.AnyCodable] }
    var arrayValue: [OpenCogProtocol.AnyCodable]? { self.value as? [OpenCogProtocol.AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: OpenCogProtocol.AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [OpenCogProtocol.AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}
