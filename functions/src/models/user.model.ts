import { NotificationChannel } from "./notification.model";

export enum UserAuthorizations {
    USERS = "USERS",
}

export type IUserNotificationPreference = Record<NotificationChannel, boolean>;
export type IUserAuthorizations = Record<UserAuthorizations, boolean>;

export interface IUser {
    uid: string;
    authorizations: IUserAuthorizations;
    // Not using an array for authorizations as it could cause
    // double permission which could be forgotten when removing permission
    displayName: string;
    email: string;
    emailVerified: boolean;
    phoneNumber: string;
    status: string;
    picture: string;
    disabled?: boolean | string;
    createdAt?: any;
    notifications?: IUserNotificationPreference;
}
