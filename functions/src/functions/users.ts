import { IUser } from "../models";
import { admin, functions } from "../utils";

export const userCreated = functions.auth.user().onCreate(async (user) => {
    const publicData = {
        displayName: user.displayName,
        disabled: user.disabled,
        uid: user.uid,
    };
    const data = {
        ...publicData,
        email: user.email || "",
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        phoneNumber: user.phoneNumber,
        uid: user.uid,
        createdAt: new Date(),
    };

    await admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set(data, { merge: true });

    await admin
        .firestore()
        .collection("publicUsers")
        .doc(user.uid)
        .set(publicData, { merge: true });
    // { merge: true }
    // Makes sure that if the document is created somewhere else asynchronously
    // the whole functions does not throw an error
});

export const publicUserChanged = functions.firestore
    .document("publicUsers/{userUid}")
    .onUpdate(async (snapshot, context) => {
        const { userUid } = context.params;
        const user = snapshot.after.data() as IUser;
        const data: Partial<IUser> = { displayName: user.displayName };

        await admin
            .firestore()
            .collection("users")
            .doc(userUid)
            .set(data, { merge: true });
    });
