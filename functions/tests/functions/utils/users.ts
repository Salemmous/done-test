import { auth } from "firebase-admin";
import { functions } from "./functions";
import { userCreated } from "../../../src";

export async function initUser(record: Partial<auth.UserRecord> = {}) {
    const user = functions.auth.exampleUserRecord();
    const wrapped = functions.wrap(userCreated);
    const finalRecord = { ...user, ...record };
    await wrapped(finalRecord, {});
    return finalRecord;
}
