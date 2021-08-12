import { adminTesting, user1Testing, USER_1, USER_2 } from "../utils/apps";
import { expect } from "chai";
import { initUser } from "../utils/users";

describe("Rules - Conversations", () => {
    async function initConversation(containsUser1: boolean = true) {
        const doc = adminTesting.firestore().collection("conversations").doc();
        await doc.set({
            seen: [],
            lastMessageDate: new Date(),
            lastMessageUser: USER_1.uid,
            lastMessage: "",
            createdAt: new Date(),
            users: containsUser1 ? [USER_1.uid, USER_2.uid] : [USER_2.uid],
        });
        return doc;
    }

    it("should allow to read conversation list for users", async () => {
        await initConversation();
        const conversations = await user1Testing
            .firestore()
            .collection("conversations")
            .where("users", "array-contains", USER_1.uid)
            .get();
        expect(conversations.docs.length).to.be.greaterThan(0);
    });

    it("should not allow to read all conversation list", async () => {
        await initConversation();
        try {
            await user1Testing.firestore().collection("conversations").get();
            new Error("Should not be able to read");
        } catch (_) {}
    });

    it("should not allow to read another user conversation list", async () => {
        await initConversation();
        try {
            await user1Testing
                .firestore()
                .collection("conversations")
                .where("users", "array-contains", USER_2.uid)
                .get();
            new Error("Should not be able to read");
        } catch (_) {}
    });

    it("should allow to send a message in conversation where the user is in", async () => {
        await initUser(USER_1);
        const doc = await initConversation();
        await user1Testing
            .firestore()
            .collection("conversations")
            .doc(doc.id)
            .collection("messages")
            .add({ content: "Hello", date: new Date(), author: USER_1.uid });
    });

    it("should not allow to send a fraudulent message", async () => {
        await initUser(USER_1);
        const doc = await initConversation();
        try {
            await user1Testing
                .firestore()
                .collection("conversations")
                .doc(doc.id)
                .collection("messages")
                .add({
                    content: "Hello",
                    date: new Date(),
                    author: USER_2.uid,
                });
            new Error("Should not send message");
        } catch (_) {}
    });

    it("should not allow to send a message if user is disabled", async () => {
        await initUser(USER_1, true);
        const doc = await initConversation();
        try {
            await user1Testing
                .firestore()
                .collection("conversations")
                .doc(doc.id)
                .collection("messages")
                .add({
                    content: "Hello",
                    date: new Date(),
                    author: USER_1.uid,
                });
            new Error("Should not send message");
        } catch (_) {}
    });

    it("should not allow to send a message in a conversation where the user is not", async () => {
        await initUser(USER_1, true);
        const doc = await initConversation();
        try {
            await user1Testing
                .firestore()
                .collection("conversations")
                .doc(doc.id)
                .collection("messages")
                .add({
                    content: "Hello",
                    date: new Date(),
                    author: USER_1.uid,
                });
            new Error("Should not send message");
        } catch (_) {}
    });
});
