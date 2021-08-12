import { expect } from "chai";
import { IConversation, IUser } from "../../../src/models";
import { admin } from "./functions";

export async function initConversation(users: Partial<IUser>[]) {
    expect(users.length).to.be.greaterThan(0);
    const userNames: { [id: string]: string } = {};
    users.forEach((user) => {
        expect(user.displayName).to.exist;
        expect(user.uid).to.exist;
        userNames[user.uid!] = user.displayName!;
    });
    const conversationData: IConversation = {
        createdAt: new Date(),
        users: users.map(({ uid }) => uid!),
        userNames,
        lastMessage: "",
        lastMessageDate: new Date(),
        lastMessageUser: users[0].uid!,
        seen: [],
    };
    const conversationDoc = await admin
        .firestore()
        .collection("conversations")
        .add(conversationData);
    return conversationDoc;
}
