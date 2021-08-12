import * as _admin from "firebase-admin";
import { functions } from "./functions";

export const CONFIG = functions.config();

_admin.initializeApp({});
const settings = { timestampsInSnapshots: true };
_admin.firestore().settings(settings);

export const admin = _admin;
