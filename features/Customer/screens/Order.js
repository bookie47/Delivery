import { View, Text, TouchableOpacity } from "react-native";
import { BottomBar } from "../../../components/bottomBar";
export const Ordermenu = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#334443" }}></View>
      <View style={{ flex: 10 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "90%",
              height: 120,
              backgroundColor: "#C5C5C5",
              marginTop: 20,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flex: 2,
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 15,
              }}
            >
              <View
                style={{
                  width: "40%",
                  height: 90,
                  backgroundColor: "#5423",
                  borderRadius: 10,
                }}
              ></View>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "space-between",
                    marginLeft: 10,
                    marginVertical: 15,
                  }}
                >
                  <View>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      ข้าวผัดหมู
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 12 }}>รวมค่าอาหาร</Text>
                    <Text style={{ fontSize: 12 }}>ค่าจัดส่ง</Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "flex-end",
                marginRight: 10,
                marginVertical: 15,
              }}
            >
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <View>
                  <Text style={{ textAlign: "right" }}>x1</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12 }}>฿70</Text>
                  <Text style={{ fontSize: 12 }}>฿10</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={()=>{alert("Buy Now!!!!")}}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 200,
                height: 50,
                backgroundColor: "#01C257",
                marginBottom: 30,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "white", fontSize: 20 }}>Buy Now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <BottomBar />
      </View>
    </View>
  );
};
