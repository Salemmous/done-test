import { admin, functions } from "../utils/functions";
import { expect } from "chai";
import { publicUserChanged } from "../../../src";
import { initUser } from "../utils/users";

describe("Functions - Users", () => {
    it("should create a new user in database", async () => {
        const user = await initUser();
        const doc = await admin
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get();
        const publicDoc = await admin
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get();
        expect(doc.exists).to.be.true;
        expect(publicDoc.exists).to.be.true;
    });
    it("should update new user in database", async () => {
        const NEW_NAME = "George";
        // Init user
        const user = await initUser();

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

        // Check if change has been made
        const doc = await admin
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get();
        const newData = doc.data();
        expect(newData).to.be.an("object");
        expect(newData).to.have.property("displayName");
        expect(newData!.displayName).to.equal(NEW_NAME);
    });
});
