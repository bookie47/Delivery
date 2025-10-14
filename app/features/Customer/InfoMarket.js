import {
  View,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  Text,
} from "react-native";
import { BottomBar } from "../../../components/bottomBar";
import { BannerMarket } from "../../../components/bannerMarket";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import CheckoutSheet from "../../../components/CheckOut";

export default function InfoMarket() {
  const [numBox, setnumBox] = useState([0, 0, 0, 0]);
  useEffect(() => {
    console.log("numBox changed ->", numBox); // ✅ ค่านี้คือของจริงหลังอัปเดต
  }, [numBox]);

  const handleAdd = (index) => {
    const newBox = [...numBox];
    newBox[index] += 1;
    setnumBox(newBox);
  };

  const handleMinus = (index) => {
    const newBox = [...numBox];
    if (newBox[index] > 0) {
      newBox[index] -= 1;
      setnumBox(newBox);
    }
  };

   const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 2.5 }}>
        <BannerMarket />
      </View>
      <View style={{ flex: 10, margin: 20 }}>
        {numBox.map((item, index) => {
          return (
            <View key={index} style={styles.container}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={styles.boxPofile}></View>
              </View>
              <Text style={{ marginTop: 10, marginRight: 20 }}>
                ข้าววผัดหมู
              </Text>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  gap: 10,
                  margin: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    handleMinus(index);
                  }}
                >
                  <View style={styles.addButton}>
                    <AntDesign name="minus" size={19} color="white" />
                  </View>
                </TouchableOpacity>

                <Text>{item}</Text>

                <TouchableOpacity
                  onPress={() => {
                    handleAdd(index);
                  }}
                >
                  <View style={styles.addButton}>
                    <Ionicons name="add" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ flexDirection: "row",justifyContent:'space-between',marginTop:150 }}>
          <TouchableOpacity
            onPress={() => {
              router.push("./(tabs)/Home");
            }}
          >
            <View
              style={{
                backgroundColor: "#FA4A0C",
                width: 50,
                height: 50,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-back-outline" size={28} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOpen(true)}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#FA4A0C",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="shopping-cart" size={24} color="white" />
              <CheckoutSheet visible={open} onClose={() => setOpen(false)} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#DDDDDD",
    height: 110,
    marginTop: 15,
    borderRadius: 10,
    flexDirection: "row",
    //alignItems: "center",
    justifyContent: "space-between",
  },
  boxPofile: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff7c7cdd",
    height: 90,
    width: 100,
    borderRadius: 10,
    marginLeft: 15,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
