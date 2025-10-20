import { setDoc, doc } from "firebase/firestore";
import { db } from "./connect-node.js";

// ตัวอย่างข้อมูลร้าน
const stores = [
  {
    id: 1,
    name: "ป.อ.เป็ด ณ อ่าวอุดม",
    rate: 4.8,
    tag: "อาหาร",
    logo: 'https://deliverystore.blob.core.windows.net/logoimage/Ped.jpg',
    menu: [
      { id: "menu_001", name: "ข้าวกะเพราเป็ด", price: 60, category: "เมนูหลัก" },
      { id: "menu_002", name: "ข้าวหน้าเป็ด", price: 50, category: "เมนูหลัก" },
      { id: "menu_003", name: "น้ำเปล่า", price: 10, category: "เครื่องดื่ม" },
    ]
  },
  {
    id: 2,
    name: "ทงทงหม่าล่า",
    rate: 4.6,
    tag: "ชาบู",
    logo: 'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760536944149.jpg',
    menu: [
      { id: "menu_001", name: "ชุดหม่าล่าหมู", price: 199, category: "เมนูหลัก" },
      { id: "menu_002", name: "ชุดหม่าล่าเนื้อ", price: 249, category: "เมนูหลัก" },
      { id: "menu_003", name: "น้ำซุปหม่าล่า", price: 49, category: "เพิ่มเติม" },
    ]
  },
  {
    id: 3, name: "ก๋วยเตี๋ยวเรือรีสอร์ต", rate: 4.7, tag: "อาหาร",logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760536659102.jpg',
    menu: [
        { id: "menu_001", name: "ก๋วยเตี๋ยวเรือหมู", price: 40, category: "เมนูหลัก" },
        { id: "menu_002", name: "ก๋วยเตี๋ยวเรือเนื้อ", price: 50, category: "เมนูหลัก" },
        { id: "menu_003", name: "น้ำเปล่า", price: 10, category: "เครื่องดื่ม" },
    ]
  },
  {
    id: 4, name: "ก๋วยเตี๋ยวเรือรังสิต", rate: 4.3, tag: "อาหาร",logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760536736160.jpg',
    menu: [
        { id: "menu_001", name: "ก๋วยเตี๋ยวเรือหมู", price: 45, category: "เมนูหลัก" },
        { id: "menu_002", name: "ก๋วยเตี๋ยวเรือเนื้อ", price: 55, category: "เมนูหลัก" },
        { id: "menu_003", name: "เป๊ปซี่", price: 20, category: "เครื่องดื่ม" },
    ]
  },
  {
    id: 5,
    name: "ผัดกะเพราอโยธา",
    rate: 4.9,
    tag: "อาหาร",
    logo: 'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760536797520.jpg',
    menu: [
      { id: "menu_001", name: "กะเพราหมูสับ", price: 50, category: "เมนูหลัก" },
      { id: "menu_002", name: "กะเพราไก่", price: 50, category: "เมนูหลัก" },
      { id: "menu_003", name: "ไข่ดาว", price: 10, category: "เพิ่มเติม" },
    ]
  },
  {
    id: 6, name: "ข้าวหมูแดงเจ๊แดง", rate: 4.5, tag: "อาหาร", logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760537142673.jpg',
    menu: [
        { id: "menu_001", name: "ข้าวหมูแดง", price: 50, category: "เมนูหลัก" },
        { id: "menu_002", name: "ข้าวหมูกรอบ", price: 60, category: "เมนูหลัก" },
        { id: "menu_003", name: "น้ำเก๊กฮวย", price: 15, category: "เครื่องดื่ม" },
    ]
  },
  {
    id: 7, name: "ตำแซ่บปากซอย", rate: 4.4, tag: "อาหาร" , logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760536877498.jpg',
    menu: [
        { id: "menu_001", name: "ส้มตำไทย", price: 50, category: "ส้มตำ" },
        { id: "menu_002", name: "ส้มตำปูปลาร้า", price: 50, category: "ส้มตำ" },
        { id: "menu_003", name: "ข้าวเหนียว", price: 10, category: "เพิ่มเติม" },
    ]
  },
  {
    id: 8, name: "บิงซูบอย", rate: 4.8, tag: "ของหวาน" , logo:'https://deliverystore.blob.core.windows.net/logoimage/%E0%B8%9A%E0%B8%B4%E0%B8%87%E0%B8%8B%E0%B8%B9.jpg',
    menu: [
        { id: "menu_001", name: "บิงซูสตรอว์เบอร์รี", price: 129, category: "บิงซู" },
        { id: "menu_002", name: "บิงซูมะม่วง", price: 139, category: "บิงซู" },
        { id: "menu_003", name: "บิงซูช็อกโกแลต", price: 119, category: "บิงซู" },
    ]
  },
  {
    id: 9, name: "โจ๊กบางพระ", rate: 4.2, tag: "อาหาร" , logo:'https://deliverystore.blob.core.windows.net/logoimage/%E0%B9%82%E0%B8%88%E0%B9%8A%E0%B8%81.jpg',
    menu: [
        { id: "menu_001", name: "โจ๊กหมู", price: 40, category: "โจ๊ก" },
        { id: "menu_002", name: "โจ๊กหมูใส่ไข่", price: 45, category: "โจ๊ก" },
        { id: "menu_003", name: "ปาท่องโก๋", price: 5, category: "ของทานเล่น" },
    ]
  },
  {
    id: 10, name: "ครัวนกกระจาบ อาหารป่า", rate: 4.6, tag: "อาหาร" , logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760537055564.jpg',
    menu: [
        { id: "menu_001", name: "ผัดเผ็ดหมูป่า", price: 80, category: "อาหารป่า" },
        { id: "menu_002", name: "ต้มยำไก่บ้าน", price: 100, category: "ต้มยำ" },
        { id: "menu_003", name: "ข้าวสวย", price: 10, category: "เพิ่มเติม" },
    ]
  },
  {
    id: 11, name: "โอเนะ ข้าวซอย", rate: 4.6, tag: "อาหาร" , logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760536790415.jpg',
    menu: [
        { id: "menu_001", name: "ข้าวซอยไก่", price: 60, category: "ข้าวซอย" },
        { id: "menu_002", name: "ข้าวซอยเนื้อ", price: 70, category: "ข้าวซอย" },
        { id: "menu_003", name: "ชามะนาว", price: 25, category: "เครื่องดื่ม" },
    ]
  },
  {
    id: 12, name: "ต้นไม้คาเฟ่", rate: 4.6, tag:"คาเฟ่", logo:'https://deliverystore.blob.core.windows.net/logoimage/CAF%C3%89-1.jpg',
    menu: [
        { id: "menu_001", name: "อเมริกาโน่", price: 50, category: "กาแฟ" },
        { id: "menu_002", name: "คาปูชิโน่", price: 55, category: "กาแฟ" },
        { id: "menu_003", name: "เค้กช็อกโกแลต", price: 80, category: "ของหวาน" },
    ]
  },
  {
    id: 13, name: "ป็อกป็อกโครตกาก", rate: 4.6, tag: "อาหาร", logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760537028788.jpg',
    menu: [
        { id: "menu_001", name: "ตำปูปลาร้า", price: 50, category: "ส้มตำ" },
        { id: "menu_002", name: "ไก่ย่าง", price: 120, category: "ของย่าง" },
        { id: "menu_003", name: "ข้าวเหนียว", price: 10, category: "เพิ่มเติม" },
    ]
  },
  {
    id: 14, name: "ครัวลุงแดง", rate: 4.6, tag: "อาหาร" , logo:'https://deliverystore.blob.core.windows.net/logoimage/messageImage_1760537095547.jpg',
    menu: [
        { id: "menu_001", name: "กะเพราหมูสับ", price: 50, category: "อาหารตามสั่ง" },
        { id: "menu_002", name: "ไข่เจียว", price: 40, category: "อาหารตามสั่ง" },
        { id: "menu_003", name: "ข้าวผัด", price: 50, category: "อาหารตามสั่ง" },
    ]
  },
  {
    id: 15, name: "ครัวแล้วแต่ปุ๊", rate: 5.0, tag: "อาหาร" , logo:'https://deliverystore.blob.core.windows.net/store15/%E0%B8%84%E0%B8%A3%E0%B8%B1%E0%B8%A7%E0%B9%81%E0%B8%A5%E0%B9%89%E0%B8%A7%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%9B%E0%B8%B8%E0%B9%8A.jpg',
    menu: [
        { id: "menu_001", name: "กะเพราหมูสับ", price: 50, category: "อาหารตามสั่ง" },
        { id: "menu_002", name: "ไข่เจียว", price: 40, category: "อาหารตามสั่ง" },
        { id: "menu_003", name: "ข้าวผัด", price: 50, category: "อาหารตามสั่ง" },
    ]
  },
];

// เพิ่มข้อมูลทั้งหมดเข้า Firestore
async function addAllStores() {
  for (const s of stores) {
    await setDoc(doc(db, "info", String(s.id)), s);
    console.log("✅ Added:", s.name);
  }
}

addAllStores();
