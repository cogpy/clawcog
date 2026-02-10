// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "OpenCogKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "OpenCogProtocol", targets: ["OpenCogProtocol"]),
        .library(name: "OpenCogKit", targets: ["OpenCogKit"]),
        .library(name: "OpenCogChatUI", targets: ["OpenCogChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "OpenCogProtocol",
            path: "Sources/OpenCogProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OpenCogKit",
            dependencies: [
                "OpenCogProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/OpenCogKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OpenCogChatUI",
            dependencies: [
                "OpenCogKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/OpenCogChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "OpenCogKitTests",
            dependencies: ["OpenCogKit", "OpenCogChatUI"],
            path: "Tests/OpenCogKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
