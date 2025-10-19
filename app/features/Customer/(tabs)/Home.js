import { View, Text, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { BottomBar } from "../../../../components/bottomBar";
import { SearchBar } from "../../../../components/searchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import AnimatedStoreCard from '../../../../components/AnimatedStoreCard';
import FocusFade from "../../../../components/FocusFade";

import { auth, db } from "../../../../firebase/connect";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";

const placeholder = require("../../../../assets/profile/default.jpg");

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchable, setSearchable] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "info"));
        const data = querySnapshot.docs.map((doc) => ({
          id: Number(doc.id), // แปลง id ให้เป็นตัวเลข
          ...doc.data(),
        }));

        // ✅ เรียง id จากน้อยไปมาก
        data.sort((a, b) => a.id - b.id);

        setStores(data);

        const searchableItems = [];
        data.forEach(store => {
          searchableItems.push({ id: store.id, name: store.name, type: 'store' });
          if (store.menu) {
            store.menu.forEach(menuItem => {
              searchableItems.push({ id: menuItem.id, name: menuItem.name, type: 'menu', storeId: store.id, storeName: store.name });
            });
          }
        });
        setSearchable(searchableItems);

        setLoading(false);
      } catch (error) {
        console.error("Error loading Firestore data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            setBalance(docSnap.data().wallet);
          } else {
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
      } else {
        // User is signed out
        setBalance(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredSearch = searchQuery ? searchable.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSelect = (item) => {
    if (item.type === 'store') {
      router.push(`/features/Customer/InfoMarket?id=${item.id}`);
    } else if (item.type === 'menu') {
      router.push(`/features/Customer/InfoMarket?id=${item.storeId}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <FocusFade style={{ flex: 1 }}>
        <View style={{ flex: 1, zIndex: 1 }}>
          <SearchBar onSearch={setSearchQuery} suggestions={filteredSearch} onSelect={handleSelect} />
        </View>
        <View style={{ flex: 10 }}>
             <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {stores.slice(0, 9).map((item, idx) => {
              return (
                <AnimatedStoreCard
                  key={idx}
                  item={item}
                  index={idx}
                  onPress={() => {
                    if (item)
                      router.push(
                        `/features/Customer/InfoMarket?id=${item.id}`
                      );
                  }}
                />
              );
            })}
          </View>
          
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                width: "90%",
                height: 50,
                backgroundColor: "#D9D9D9",
                marginTop: 20,
                borderRadius: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
             
              <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                <Ionicons name="wallet-outline" size={24} color="#000000ff" ></Ionicons>
                <Text>Wallet Balance</Text>
              </View>
              <View style={{}}>
                <Text style={{ textAlign: "left" }}>
                  {" "}
                  {balance.toFixed(2)} THB
                </Text>
              </View>
            </View>
          </View>
          </KeyboardAwareScrollView>
        </View>
      </FocusFade>
    </SafeAreaView>
  );
}
