import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export const BottomBar = () => {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: "#34656D",
        }}
      >
        <TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <AntDesign name="home" size={30} color={"white"} />
            <Text style={{ color: "white" }}>Home</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <AntDesign name="history" size={30} color={"white"} />
            <Text style={{ color: "white" }}>History</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <AntDesign name="menu" size={30} color={"white"} />
            <Text style={{ color: "white" }}>Menu</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
