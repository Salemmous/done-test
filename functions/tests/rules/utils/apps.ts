import * as firebase from "@firebase/rules-unit-testing";
import { ITestUser } from "../models/user";

export const USER_1: ITestUser = {
    uid: "thomas",
    email: "thomas.debluts@gmail.com",
    name: "Thomas",
};
export const USER_2: ITestUser = {
    uid: "mari",
    email: "mari.debluts@gmail.com",
    name: "Mari",
};

export const user1Testing = firebase.initializeTestApp({
    projectId: "my-test-project",
    auth: USER_1,
});

export const user2Testing = firebase.initializeTestApp({
    projectId: "my-test-project",
    auth: USER_2,
});

export const adminTesting = firebase.initializeAdminApp({
    projectId: "my-test-project",
});
