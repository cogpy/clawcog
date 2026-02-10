import Foundation
import Testing
@testable import OpenCog

@Suite(.serialized)
struct OpenCogConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("opencog-config-\(UUID().uuidString)")
            .appendingPathComponent("opencog.json")
            .path

        await TestIsolation.withEnvValues(["OPENCOG_CONFIG_PATH": override]) {
            #expect(OpenCogConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("opencog-config-\(UUID().uuidString)")
            .appendingPathComponent("opencog.json")
            .path

        await TestIsolation.withEnvValues(["OPENCOG_CONFIG_PATH": override]) {
            OpenCogConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(OpenCogConfigFile.remoteGatewayPort() == 19999)
            #expect(OpenCogConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(OpenCogConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(OpenCogConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("opencog-config-\(UUID().uuidString)")
            .appendingPathComponent("opencog.json")
            .path

        await TestIsolation.withEnvValues(["OPENCOG_CONFIG_PATH": override]) {
            OpenCogConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            OpenCogConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = OpenCogConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("opencog-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "OPENCOG_CONFIG_PATH": nil,
            "OPENCOG_STATE_DIR": dir,
        ]) {
            #expect(OpenCogConfigFile.stateDirURL().path == dir)
            #expect(OpenCogConfigFile.url().path == "\(dir)/opencog.json")
        }
    }
}
