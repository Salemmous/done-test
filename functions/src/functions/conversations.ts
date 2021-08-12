import { IUser, NotificationChannel } from "../models";
import { admin, functions, sendNotification } from "../utils";

export const messageSent = functions.firestore
    .document("conversations/{conversationUid}/messages/{messageUid}")
    .onCreate(async (snapshot, context) => {
        const { content, author, silent } = snapshot.data() as any;
        const conversationDoc = admin
            .firestore()
            .collection("conversations")
            .doc(context.params.conversationUid);

        let authorProfile: IUser | null = null;
        if (author) {
            const authorDoc = await admin
                .firestore()
                .collection("users")
                .doc(author);
            authorProfile = (await authorDoc.get()).data() as IUser;
        }
        await conversationDoc.update({
            lastMessageDate: new Date(), // Could also user serverTimestamp
            lastMessage: content || "",
            lastMessageUser: author || null,
            seen: [author].filter((it) => it),
        });

        const conversation = (await conversationDoc.get()).data();

        if (!conversation) return;

        if (silent || !authorProfile) return;
        await sendNotification(
            conversation.users.filter((uid: string) => uid !== author),
            NotificationChannel.MESSAGE,
            {
                body: content,
                title: authorProfile.displayName,
                conversation: context.params.conversationUid,
            }
        );
    });
