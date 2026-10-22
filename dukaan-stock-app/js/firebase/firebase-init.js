let FS = null;
let AUTH = null;

export function firebaseConfigOk() {
  return !!(
    window.FIREBASE_CONFIG &&
    window.FIREBASE_CONFIG.apiKey &&
    !/YAHAN/.test(window.FIREBASE_CONFIG.apiKey) &&
    window.firebase
  );
}

export async function initializeFirebase() {
  if (!firebaseConfigOk()) {
    return { enabled: false, auth: null, firestore: null };
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  AUTH = firebase.auth();
  FS = firebase.firestore();

  try {
    await FS.enablePersistence({ synchronizeTabs: true });
  } catch (_) {}

  return {
    enabled: true,
    auth: AUTH,
    firestore: FS
  };
}

export function getAuth() {
  return AUTH;
}

export function getFirestore() {
  return FS;
}
