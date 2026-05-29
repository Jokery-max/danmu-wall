/**
 * Demo mode: uses BroadcastChannel for local testing (no Firebase needed).
 * Set USE_FIREBASE = true and configure firebase.js to switch to production.
 */
const USE_FIREBASE = true;

let sendFn = null;
let onMsgFn = null;

// ====== Firebase mode ======
async function initFirebase(since) {
  const { db } = await import("./firebase");
  const {
    collection, addDoc, serverTimestamp,
    query, where, orderBy, limit, onSnapshot,
    getDocs, deleteDoc, writeBatch,
  } = await import("firebase/firestore");

  sendFn = async (msg) => {
    await addDoc(collection(db, "messages"), {
      text: msg.text,
      type: msg.type || "normal",
      nickname: msg.nickname || "观众",
      time: serverTimestamp(),
    });
  };

  // Delete messages older than `since`
  if (since) {
    const oldQuery = query(
      collection(db, "messages"),
      where("time", "<", new Date(since))
    );
    const oldSnap = await getDocs(oldQuery);
    if (!oldSnap.empty) {
      const batch = writeBatch(db);
      oldSnap.forEach((doc) => batch.delete(doc.ref));
      await batch.commit().catch(() => {});
    }
  }

  let messageCount = 0;
  const MAX_MESSAGES = 200;

  onMsgFn = (cb) => {
    let q;
    if (since) {
      q = query(
        collection(db, "messages"),
        where("time", ">=", new Date(since)),
        orderBy("time", "desc"),
        limit(50)
      );
    } else {
      q = query(
        collection(db, "messages"),
        orderBy("time", "desc"),
        limit(50)
      );
    }

    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          cb({ text: data.text, type: data.type || "normal", nickname: data.nickname || "观众" });
          messageCount++;
          if (messageCount > MAX_MESSAGES) {
            deleteDoc(change.doc.ref).catch(() => {});
          }
        }
      });
    });
  };
}

// ====== Demo mode (BroadcastChannel) ======
function initDemo() {
  const channel = new BroadcastChannel("danmu-wall");

  sendFn = (msg) => {
    channel.postMessage({
      text: msg.text, type: msg.type || "normal",
      nickname: msg.nickname || "观众", time: Date.now(),
    });
  };

  onMsgFn = (cb) => {
    channel.onmessage = (e) => {
      cb({ text: e.data.text, type: e.data.type || "normal", nickname: e.data.nickname || "观众" });
    };
  };
}

// ====== Public API ======
let ready = false;
let savedSince = 0;

export async function init(since = 0) {
  if (ready) return;
  ready = true;
  savedSince = since;
  if (USE_FIREBASE) {
    await initFirebase(since);
  } else {
    initDemo();
  }
}

export async function send(text, type = "normal", nickname = "观众") {
  if (!sendFn) await init();
  return sendFn({ text, type, nickname });
}

export function onMessage(cb, since = 0) {
  if (!onMsgFn) {
    init(since).then(() => onMsgFn(cb));
  } else {
    onMsgFn(cb);
  }
}
