import { View, Text } from "react-native";
import { BottomBar } from "../../../components/bottomBar";
import { SearchBar } from "../../../components/searchBar";

export const Home = () => {
  const boxes = Array.from({ length: 9 });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#334443" }}>
        <SearchBar />
      </View>
      <View style={{ flex: 10, backgroundColor: "#FAF8F1" }}>
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
            <View
              key={index}
              style={{
                width: 110,
                height: 100,
                backgroundColor: "#D9D9D9",
                borderRadius: 20,
                margin: 5,
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ))}
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "90%",
              height: 70,
              backgroundColor: "#D9D9D9",
              marginTop: 20,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          ></View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View
              style={{
                width: 180,
                height: 200,
                backgroundColor: "#D9D9D9",
                marginTop: 20,
                marginHorizontal:12,
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
                marginHorizontal:12,
                justifyContent: "center",
                alignItems: "center",
              }}
            ></View>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <BottomBar />
      </View>
    </View>
  );
};
