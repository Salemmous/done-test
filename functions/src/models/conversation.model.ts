export interface IConversation {
    createdAt: any; // Timestamp or date
    lastMessageDate: any; // Timestamp or date
    lastMessage: string;
    lastMessageUser: string;
    users: string[];
    seen: string[];
    reported?: boolean;
    userNames: { [id: string]: string };
}
