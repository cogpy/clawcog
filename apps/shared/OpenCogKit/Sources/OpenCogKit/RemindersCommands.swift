import Foundation

public enum OpenCogRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum OpenCogReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct OpenCogRemindersListParams: Codable, Sendable, Equatable {
    public var status: OpenCogReminderStatusFilter?
    public var limit: Int?

    public init(status: OpenCogReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct OpenCogRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct OpenCogReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct OpenCogRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [OpenCogReminderPayload]

    public init(reminders: [OpenCogReminderPayload]) {
        self.reminders = reminders
    }
}

public struct OpenCogRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: OpenCogReminderPayload

    public init(reminder: OpenCogReminderPayload) {
        self.reminder = reminder
    }
}
