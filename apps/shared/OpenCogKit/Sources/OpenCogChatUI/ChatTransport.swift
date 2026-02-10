import Foundation

public enum OpenCogChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(OpenCogChatEventPayload)
    case agent(OpenCogAgentEventPayload)
    case seqGap
}

public protocol OpenCogChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> OpenCogChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [OpenCogChatAttachmentPayload]) async throws -> OpenCogChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> OpenCogChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<OpenCogChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension OpenCogChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "OpenCogChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> OpenCogChatSessionsListResponse {
        throw NSError(
            domain: "OpenCogChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
