import { db } from "./connect";
import { collection, addDoc } from "firebase/firestore";

const addMenuItem = async (shopId, menuItem) => {
  try {
    if (!shopId || !menuItem || !menuItem.name || !menuItem.price) {
      throw new Error("Shop ID, menu item name, and price are required.");
    }

    const menuCollectionRef = collection(db, "info", shopId, "menu");
    const docRef = await addDoc(menuCollectionRef, menuItem);
    console.log("Menu item added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding menu item: ", error);
    throw error;
  }
};

export default addMenuItem;
