const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAWwqaPGt1daPvTXy-I335H_oHq7VrexJs",
  authDomain: "delivery-d48cc.firebaseapp.com",
  projectId: "delivery-d48cc",
  storageBucket: "delivery-d48cc.firebasestorage.app",
  messagingSenderId: "1060852126985",
  appId: "1:1060852126985:web:7ec6bbd191ddb0f0a0afd8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Allow overriding specific menu images when the default pattern is not correct.
// Example:
// const customUriOverrides = {
//   "15": {
//     menu_001: "https://deliverystore.blob.core.windows.net/menuimage/store15/menu_001.jpg",
//   },
// };
const customUriOverrides = {};

const DEFAULT_BASE_URI = "https://deliverystore.blob.core.windows.net/menuimage";

/**
 * Returns the URI to assign to a menu item.
 * The fallback uses store id and menu id so each entry receives a predictable path.
 */
const resolveMenuUri = (storeId, menuItem) => {
  const overrides = customUriOverrides[String(storeId)] || {};
  if (overrides[menuItem.id]) {
    return overrides[menuItem.id];
  }
  return `${DEFAULT_BASE_URI}/store_${storeId}/${menuItem.id}.jpg`;
};

const addUriToMenus = async () => {
  try {
    const infoCollection = collection(db, "info");
    const snapshot = await getDocs(infoCollection);

    if (snapshot.empty) {
      console.log("No stores found in collection `info`.");
      return;
    }

    let updateCount = 0;

    for (const docSnap of snapshot.docs) {
      const storeData = docSnap.data();
      const { menu } = storeData || {};

      if (!Array.isArray(menu) || menu.length === 0) {
        continue;
      }

      let hasChanges = false;
      const updatedMenu = menu.map((menuItem) => {
        if (!menuItem || typeof menuItem !== "object") {
          return menuItem;
        }

        if (menuItem.uri && typeof menuItem.uri === "string" && menuItem.uri.length) {
          return menuItem;
        }

        const uri = resolveMenuUri(docSnap.id, menuItem);
        hasChanges = true;
        return { ...menuItem, uri };
      });

      if (hasChanges) {
        await updateDoc(docSnap.ref, { menu: updatedMenu });
        updateCount += 1;
        console.log(`Updated menu URIs for store ${docSnap.id}`);
      }
    }

    if (updateCount === 0) {
      console.log("All store menus already contain a uri field.");
    } else {
      console.log(`Completed. Updated ${updateCount} store(s).`);
    }
  } catch (error) {
    console.error("Failed to append menu URIs:", error);
    process.exit(1);
  }
};

addUriToMenus();
