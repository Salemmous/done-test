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
is not writable. The functions also updates the display name in the conversations
where the user is. Firestore rules are set accordingly. `publicUsers` only allow
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
Users' display names are also stored in the conversation. Once a user's name is
updated, the triggered Firebase Functions described above send chunked batch writes
to Firestore.

For this example I assumed we only needed to show the name. More info could be
stored into the conversation document too, but one should keep in mind the
object nesting limitations in Firestore.

## Example requests (dart)

-   Get conversations for user

```dart
final _db = FirebaseFirestore.instance;
final CollectionReference<Map<String, dynamic>> _conversations =
    _db.collection('conversations');
Stream<List<Conversation>> getConversations(String userUid) {
  return _conversations
      .where("users", arrayContains: userUid)
      .orderBy("lastMessageDate", descending: true)
      .snapshots()
      .map((snapshot) => snapshot.docs
          .map((doc) {
            final map = doc.data();
            map['uid'] = doc.id;
            return Conversation.fromMap(map);
          })
          .toList());
}
```

-   Get latest messages in conversations

```dart
final _db = FirebaseFirestore.instance;
final CollectionReference<Map<String, dynamic>> _conversations =
    _db.collection('conversations');
Stream<List<Message>> getConversations(String conversationUid) {
  return _conversations
      .doc(conversationUid)
      .collection("messages")
      .orderBy('date', descending: true)
      .snapshots()
      .map((snapshot) => snapshot.docs.map((doc) {
            final map = doc.data();
            map['uid'] = doc.id;
            return Message.fromMap(map);
          }).toList());
}
```

This could also be optimized by first fetching the messages and then
listening only to the latest one. When it changes, push it to an
array with the other messages.

To display the sender's name, the conversation document already contains it.

-   Get user public profile (in case complete profile is needed)

```dart
final _db = FirebaseFirestore.instance;
final CollectionReference<Map<String, dynamic>> _users =
    _db.collection('publicUsers');
Stream<PublicUser> getUser(String uid) {
  return _users.doc(uid)
      .snapshots()
      .map((snapshot) {
            final map = snapshot.data();
            return PublicUser.fromMap(map);
          });
}
```

-   Get user profile (in case we want to display their private info)

```dart
final _db = FirebaseFirestore.instance;
final CollectionReference<Map<String, dynamic>> _users =
    _db.collection('users');
Stream<User> getUser(String uid) {
  return _users.doc(uid)
      .snapshots()
      .map((snapshot) {
            final map = snapshot.data();
            return User.fromMap(map);
          });
}
```
