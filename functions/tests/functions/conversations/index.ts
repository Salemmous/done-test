import { functions } from "../utils/functions";
import { messageSent, publicUserChanged } from "../../../src";
import { expect } from "chai";
import { initUser } from "../utils/users";
import { initConversation } from "../utils/conversations";

describe("Functions - Conversations", () => {
    it("should update conversation when a message is sent", async () => {
        const DISPLAY_NAME = "George";
        // Init user
        const user = await initUser({ displayName: DISPLAY_NAME });

        // Create conversation
        const conversationDoc = await initConversation([user]);

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

    it("should update conversation when a user profile is updated", async () => {
        const DISPLAY_NAME = "Thomas";
        const OTHER_USER = "Mari";
        // Init user
        const NEW_NAME = "George";
        // Init user
        const user = await initUser({
            displayName: DISPLAY_NAME,
            uid: "thomas",
        });
        const user2 = await initUser({ displayName: OTHER_USER, uid: "mari" });

        // Create conversation
        const conversationDoc = await initConversation([user, user2]);

        // Send change to user
        const publicUserChangedWrapped = functions.wrap(publicUserChanged);
        const snapshotBefore = functions.firestore.makeDocumentSnapshot(
            { displayName: user.displayName },
            `publicUsers/${user.uid}`
        );
        const snapshotAfter = functions.firestore.makeDocumentSnapshot(
            { displayName: NEW_NAME },
            `publicUsers/${user.uid}`
        );
        const change = functions.makeChange(snapshotBefore, snapshotAfter);
        await publicUserChangedWrapped(change, {
            params: { userUid: user.uid },
        });

        // Check if conversation has been updated
        const conversation = (await conversationDoc.get()).data();
        expect(conversation).to.exist;
        expect(conversation!.userNames).to.be.an("object");
        expect(conversation!.userNames[user.uid]).to.be.a("string");
        expect(conversation!.userNames[user.uid]).to.equal(NEW_NAME);
    });
});
