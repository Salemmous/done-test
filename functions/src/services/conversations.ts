import { admin } from "../utils/admin";
import { chunkArray } from "../utils/arrays";

export async function updateUserNameInConversations(
    uid: string,
    displayName: string
) {
    const query = await admin
        .firestore()
        .collection("conversations")
        .where("users", "array-contains", uid)
        .select() // making sure we retrieve only the id
        .get();
    const chunks = chunkArray(query.docs, 500);
    return await Promise.all(
        chunks.map(async (docs) => {
            let batch = admin.firestore().batch();
            docs.forEach((doc) => {
                batch = batch.update(doc.ref, {
                    [`userNames.${uid}`]: displayName,
                });
            });
            return await batch.commit();
        })
    );
}
