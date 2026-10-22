export function login(auth, email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

export function logout(auth) {
  if (auth) return auth.signOut();
}

export function onAuthChanged(auth, callback) {
  return auth.onAuthStateChanged(callback);
}
