# Report for test exam

## Users

Users sign up using Firebase auth. When a new user is created in Firebase auth,
it automatically creates two documents for them. One in the `users` collection
and one in the `publicUsers` collection. The `publicUser` document is basically
just a duplicate of the `users` document minus all the fields that should not be
exposed (e.g. email, authorizations, etc). It also acts as a protection layer for what the
user is able to change themselves, they can only update the `publicUsers` document.
A Firebase Function is triggered when the `publicUsers` document is updated.
This function updates the `users` document accordingly, making sure some data
is not writable. Firestore rules are set accordingly. `publicUsers` only allow
`get` but not `list`, to make sure the list of all users cannot be fetched. Users
can be disabled from the database.

## Conversations

The database contains a `conversations` collection. Each document in there also
has a child collection called `messages`. The `messages` collection is create-allowed
for all users that are listed in the conversation through the `users` field of the document.
Once a message is sent, a Firebase Function is triggered, which updates info in the
`conversations` document. The info contains data about when the last message was sent,
who sent the last message, when was the last message sent. The Firestore rules
make sure that the info the message contains checks out, so that a user could not send
a fraudulent message. A conversation can be reported, so that people in charge of the
reporting can then read it and take action.

## Tests

Tests are done using Mocha and Chai. They cover function execution and
firestore rules. They are both done on the local emulator suite.

## Reduplication of data

Data is duplicated between the `users` and `publicUsers` collection.
The last message is also stored in its parent document.
Message author data is not stored directly in the message itself. This means that
when analyzing a message to get the name of the sender, one should fetch the user from
`publicUsers`. This problem however, can be tackled with local cache on the client side.
This sacrifices reads to save writes. The user data could also be saved at the `conversations`
document-level, but it would also require writes every time a user updates their profile. While
this has the advantage to save reads, Firestore writes are most costly and limited in matter of
bulk writing. Batches have a limit of 500 operations. If however the reads were to be minimized
completely, or if we wanted to make sure there would not be latency between loading the conversations
and the users in it, the profiles could also be included in the `conversations` documents. The best
way to then be able to modify the user's name in their conversations would be to make a batch
write that would modify a `map` field in the document containing the user info map based on their uid.
E.g.

```
{
    "userInfo": {
        "ox268Jj3gpQXsQR9716e": {
            "displayName": "Thomas"
        }
    }
}
```

If we only need the name, we could just store that directly there too instead of a whole object. One
must keep in mind the object nesting limitations in Firestore.
