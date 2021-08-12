import { admin, functions } from "../utils/functions";
import { userCreated, messageSent } from "../../../src";
import { expect } from "chai";

describe("Functions - Users", () => {
    it("should update conversation", async () => {
        const DISPLAY_NAME = "George";
        // Init user
        const newUserWrapped = functions.wrap(userCreated);
        const user = functions.auth.exampleUserRecord();
        user.displayName = DISPLAY_NAME;
        await newUserWrapped(user, {});

        // Create conversation
        const conversationDoc = await admin
            .firestore()
            .collection("conversations")
            .add({ createdAt: new Date(), users: [user.uid], seen: [] });

        // Send message event
        const messageData = {
            content: "Hello",
            author: user.uid,
            date: new Date(),
        };
        const message = functions.firestore.makeDocumentSnapshot(
            messageData,
            `conversations/${conversationDoc.id}/messages/test`
        );
        const newMessageWrapped = functions.wrap(messageSent);
        await newMessageWrapped(message, {
            params: { conversationUid: conversationDoc.id, messageUid: "test" },
        });

        // Check if conversation has been updated
        const conversation = (await conversationDoc.get()).data();
        expect(conversation).to.exist;
        expect(conversation!.lastMessage).to.equal(messageData.content);
        expect(conversation!.lastMessageUser).to.equal(messageData.author);
    });
});
