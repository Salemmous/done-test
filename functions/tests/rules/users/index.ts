import { user1Testing, USER_1, USER_2 } from "../utils/apps";

describe("Rules - Users", () => {
    it("should fail to modify the `users` document", (done) => {
        user1Testing
            .firestore()
            .collection("users")
            .doc(USER_1.uid)
            .set({ displayName: "Thomasito" }, { merge: true })
            .then(() => done(new Error("Should not be able to modify")))
            .catch(() => done());
    });
    it("should fail to read the `users` document from another user", (done) => {
        user1Testing
            .firestore()
            .collection("users")
            .doc(USER_2.uid)
            .get()
            .then(() => done(new Error("Should not be able to read")))
            .catch(() => done());
    });
    it("should fail to modify the `users` document from another user", (done) => {
        user1Testing
            .firestore()
            .collection("users")
            .doc(USER_2.uid)
            .set({ displayName: "Thomasito" }, { merge: true })
            .then(() => done(new Error("Should not be able to modify")))
            .catch(() => done());
    });
    it("should fail to modify the `publicUsers` document from another user", (done) => {
        user1Testing
            .firestore()
            .collection("publicUsers")
            .doc(USER_2.uid)
            .set({ displayName: "Thomasito" }, { merge: true })
            .then(() => done(new Error("Should not be able to modify")))
            .catch(() => done());
    });

    it("should modify the `publicUsers` document", (done) => {
        user1Testing
            .firestore()
            .collection("publicUsers")
            .doc(USER_1.uid)
            .set({ displayName: "Thomasito" }, { merge: true })
            .then(() => done())
            .catch(done);
    });
    it("should read the `users` document from itself", (done) => {
        user1Testing
            .firestore()
            .collection("users")
            .doc(USER_1.uid)
            .get()
            .then(() => done())
            .catch(done);
    });
    it("should read the `publicUsers` document from itself", (done) => {
        user1Testing
            .firestore()
            .collection("publicUsers")
            .doc(USER_1.uid)
            .get()
            .then(() => done())
            .catch(done);
    });
    it("should read the `publicUsers` document from another user", (done) => {
        user1Testing
            .firestore()
            .collection("publicUsers")
            .doc(USER_2.uid)
            .get()
            .then(() => done())
            .catch(done);
    });
});
