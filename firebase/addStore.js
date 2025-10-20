import { doc, setDoc } from "firebase/firestore";
import { db } from "./connect-node.js";

const store15 = {
  id: 15,
  name: "ครัวแล้วแต่ปุ๊",
  rate: 5.0,
  tag: "อาหารตามสั่ง",
  logo: "https://deliverystore.blob.core.windows.net/store15/%E0%B8%84%E0%B8%A3%E0%B8%B1%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B9%89%E0%B8%A7%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%9B%E0%B8%B8%E0%B9%8A.jpg",
  menu: [
    { id: "menu_001", name: "กะเพราหมูสับ", price: 50, category: "อาหารตามสั่ง" },
    { id: "menu_002", name: "ไข่เจียว", price: 40, category: "อาหารตามสั่ง" },
    { id: "menu_003", name: "ข้าวผัด", price: 50, category: "อาหารตามสั่ง" },
  ],
};

async function addStore15() {
  try {
    await setDoc(doc(db, "info", String(store15.id)), store15, { merge: true });
    console.log(`✅ Store ${store15.id} created/updated successfully.`);
  } catch (error) {
    console.error("❌ Failed to create store:", error);
    process.exitCode = 1;
  }
}

addStore15();
