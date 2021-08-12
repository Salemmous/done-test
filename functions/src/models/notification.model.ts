export interface INotification {
    body: string;
    title: string;
    [prop: string]: any;
}
export enum NotificationChannel {
    ADMIN = "ADMIN",
    MESSAGE = "MESSAGE",
    REPORTS = "REPORTS",
}
