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

export const InfoMarket = () => {
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

        <View>
          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginTop: 50,
            }}
          >
            <TouchableOpacity>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: "green",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome5 name="shopping-cart" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <BottomBar />
      </View>
    </View>
  );
};

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
