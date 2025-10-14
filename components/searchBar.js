import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export const SearchBar = () => {
  return (
    <View style={{ flex: 1,backgroundColor:'#FA4A0C' }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <TextInput
            style={{
              height: 40,
              width: "80%",
              borderRadius: 20,
              backgroundColor: "white",
              paddingLeft:20,
            }}
          ></TextInput>
          <TouchableOpacity onPress={()=>alert("Search")}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="search" size={30} color={"black"} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
