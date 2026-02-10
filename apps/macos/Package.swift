// swift-tools-version: 6.2
// Package manifest for the OpenCog macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "OpenCog",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "OpenCogIPC", targets: ["OpenCogIPC"]),
        .library(name: "OpenCogDiscovery", targets: ["OpenCogDiscovery"]),
        .executable(name: "OpenCog", targets: ["OpenCog"]),
        .executable(name: "opencog-mac", targets: ["OpenCogMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/OpenCogKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "OpenCogIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OpenCogDiscovery",
            dependencies: [
                .product(name: "OpenCogKit", package: "OpenCogKit"),
            ],
            path: "Sources/OpenCogDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "OpenCog",
            dependencies: [
                "OpenCogIPC",
                "OpenCogDiscovery",
                .product(name: "OpenCogKit", package: "OpenCogKit"),
                .product(name: "OpenCogChatUI", package: "OpenCogKit"),
                .product(name: "OpenCogProtocol", package: "OpenCogKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/OpenCog.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "OpenCogMacCLI",
            dependencies: [
                "OpenCogDiscovery",
                .product(name: "OpenCogKit", package: "OpenCogKit"),
                .product(name: "OpenCogProtocol", package: "OpenCogKit"),
            ],
            path: "Sources/OpenCogMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "OpenCogIPCTests",
            dependencies: [
                "OpenCogIPC",
                "OpenCog",
                "OpenCogDiscovery",
                .product(name: "OpenCogProtocol", package: "OpenCogKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
