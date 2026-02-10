import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-opencog writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.opencog.mac"
let gatewayLaunchdLabel = "ai.opencog.gateway"
let onboardingVersionKey = "opencog.onboardingVersion"
let onboardingSeenKey = "opencog.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "opencog.pauseEnabled"
let iconAnimationsEnabledKey = "opencog.iconAnimationsEnabled"
let swabbleEnabledKey = "opencog.swabbleEnabled"
let swabbleTriggersKey = "opencog.swabbleTriggers"
let voiceWakeTriggerChimeKey = "opencog.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "opencog.voiceWakeSendChime"
let showDockIconKey = "opencog.showDockIcon"
let defaultVoiceWakeTriggers = ["opencog"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "opencog.voiceWakeMicID"
let voiceWakeMicNameKey = "opencog.voiceWakeMicName"
let voiceWakeLocaleKey = "opencog.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "opencog.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "opencog.voicePushToTalkEnabled"
let talkEnabledKey = "opencog.talkEnabled"
let iconOverrideKey = "opencog.iconOverride"
let connectionModeKey = "opencog.connectionMode"
let remoteTargetKey = "opencog.remoteTarget"
let remoteIdentityKey = "opencog.remoteIdentity"
let remoteProjectRootKey = "opencog.remoteProjectRoot"
let remoteCliPathKey = "opencog.remoteCliPath"
let canvasEnabledKey = "opencog.canvasEnabled"
let cameraEnabledKey = "opencog.cameraEnabled"
let systemRunPolicyKey = "opencog.systemRunPolicy"
let systemRunAllowlistKey = "opencog.systemRunAllowlist"
let systemRunEnabledKey = "opencog.systemRunEnabled"
let locationModeKey = "opencog.locationMode"
let locationPreciseKey = "opencog.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "opencog.peekabooBridgeEnabled"
let deepLinkKeyKey = "opencog.deepLinkKey"
let modelCatalogPathKey = "opencog.modelCatalogPath"
let modelCatalogReloadKey = "opencog.modelCatalogReload"
let cliInstallPromptedVersionKey = "opencog.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "opencog.heartbeatsEnabled"
let debugPaneEnabledKey = "opencog.debugPaneEnabled"
let debugFileLogEnabledKey = "opencog.debug.fileLogEnabled"
let appLogLevelKey = "opencog.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
