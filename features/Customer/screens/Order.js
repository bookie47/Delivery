import { View } from "react-native";
import { BottomBar } from "../../../components/bottomBar";
export const Ordermenu = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#334443" }}></View>
      <View style={{ flex: 10 }}>
        <View style={{flex:1}}>
          <View
            style={{ width: "100%", height: 50, backgroundColor: "#C5C5C5", margin:30 }}
          ></View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <BottomBar />
      </View>
    </View>
  );
};
