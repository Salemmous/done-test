import { ITestUser } from "../models/user";
import { adminTesting } from "./apps";

export async function initUser(user: ITestUser, disabled: boolean = false) {
    const publicData = { displayName: user.name, uid: user.uid, disabled };
    const data = { ...publicData, email: user.email };
    adminTesting
        .firestore()
        .collection("publicUsers")
        .doc(user.uid)
        .set(publicData);
    adminTesting.firestore().collection("users").doc(user.uid).set(data);
}
