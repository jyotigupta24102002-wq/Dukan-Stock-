export function subscribeCollection(firestore, collection, onData, onError) {
  return firestore
    .collection(collection)
    .onSnapshot(onData, onError);
}

export function setDocument(firestore, collection, object) {
  return firestore.collection(collection).doc(object.id).set(object);
}

export function deleteDocument(firestore, collection, id) {
  return firestore.collection(collection).doc(id).delete();
}
