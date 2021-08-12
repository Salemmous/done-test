import { NotificationChannel, IUser, INotification } from "../models";
import { admin } from "./admin";

export async function sendNotification(
    users: string[],
    channel: NotificationChannel,
    { body, title, ...data }: INotification
) {
    if (!users.length) return;
    const userCollection = admin.firestore().collection("users");

    const userTokens: string[] = [];

    const devices = await Promise.all(
        users
            .filter((it) => it)
            .map(async (user: string) => {
                const userDoc = userCollection.doc(user);
                const userDocFetched = await userDoc.get();
                const userData = userDocFetched.data() as IUser;
                if (!userData || userData.notifications?.[channel] === false)
                    return [];
                const { docs } = await userDoc.collection("devices").get();
                return docs.map((it) => (it.data() || {}).messaging_token);
            })
    );

    devices.forEach((tokenList) => userTokens.push(...tokenList));

    const tokens = userTokens.filter((it) => it);

    if (!tokens.length) return;

    await admin.messaging().sendMulticast({
        tokens,
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            id: "1",
            status: "done",
            ...data,
        },
        notification: { body, title },
    });
}
