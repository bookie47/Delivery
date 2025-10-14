import { View, Text, Image, TouchableOpacity } from "react-native";
import { BottomBar } from "../../../../components/bottomBar";
import { SearchBar } from "../../../../components/searchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";

export default function Home() {
  const boxes = Array.from({ length: 9 });
  const [balnace, setBalance] = useState(500);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={{ flex: 1 }}>
        <SearchBar />
      </View>
      <View style={{ flex: 10 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          {boxes.map((_, index) => (
            <TouchableOpacity
              key={`box-${index}`}
              onPress={() => router.push("/features/Customer/InfoMarket")}
              style={{
                width: 110,
                height: 100,
                backgroundColor: "#D9D9D9",
                borderRadius: 20,
                margin: 5,
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {index === 0 ? (
                <Image
                  source={require("../../../../assets/Logo/Ped.jpg")}
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                />
              ) : null}
            </TouchableOpacity>
          ))}
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
            <View style={{}}>
              <Text>Wallet Balance</Text>
            </View>
            <View style={{}}>
              <Text style={{ textAlign: "left" }}>
                {" "}
                {balnace.toFixed(2)} THB
              </Text>
            </View>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View
              style={{
                width: 180,
                height: 200,
                backgroundColor: "#D9D9D9",
                marginTop: 20,
                marginHorizontal: 12,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            ></View>
            <View
              style={{
                width: 180,
                height: 200,
                backgroundColor: "#D9D9D9",
                marginTop: 20,
                borderRadius: 20,
                marginHorizontal: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            ></View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
