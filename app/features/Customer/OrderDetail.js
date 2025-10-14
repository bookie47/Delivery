import { View, Text, Image ,TouchableOpacity} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function Detail() {
  const uri = require("../../../assets/Food/kfc.jpg");
  const kaitod = require("../../../assets/Food/kaitod.jpg");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "##F6F6F6" }}>
      <View style={{ flex: 1,flexDirection:'row' ,backgroundColor: "#FA4A0C" ,alignItems:'center'}}>
        <Text
          style={{ fontSize: 25, fontWeight: "bold",color:'white',paddingLeft:20}}
        >
          รายละเอียดคำสั่งซื้อ
        </Text>
      </View>
      <View style={{ flex: 10 }}>
        <View style={{ flex: 5 }}>
          <Image
            source={uri}
            style={{
              height: 125,
              width: 125,
              marginTop: 20,
              alignSelf: "center",
              resizeMode: "cover",
              borderRadius:60,
            }}
          />
          <View style={{ marginHorizontal: 30 }}>
            <Text style={{ fontSize: 25, marginTop: 15 }}>
              KFC(เคเอฟซี) - ตึกคอมศรีราชา
            </Text>
            <Text style={{ fontSize: 15 }}>21 ส.ค 2568 12:00 น</Text>
          </View>
        </View>
        <View style={{ flex: 4 }}>
          <View
            style={{
              alignSelf: "center",
              backgroundColor: "#fbefefff",
              borderRadius: 25,
              height: 175,
              width: 365,
              marginTop: 5,
            }}
          >
            <View style={{ marginTop: 15 }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 15 }}>
                <FontAwesome6
                  style={{ marginTop: 7 }}
                  name="location-dot"
                  size={15}
                  color="green"
                />
                <Text
                  style={{ color: "green", fontSize: 20, paddingHorizontal: 5 }}
                >
                  สถานที่ร้าน
                </Text>
              </View>
              <Text style={{ fontSize: 15, paddingHorizontal: 15 }}>
                9 ตำบล ศรีราชา อำเภอศรีราชา ชลบุรี 20230
              </Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 15 }}>
                <FontAwesome6
                  style={{ marginTop: 7 }}
                  name="location-dot"
                  size={15}
                  color="red"
                />
                <Text
                  style={{ color: "red", fontSize: 20, paddingHorizontal: 5 }}
                >
                  สถานที่จัดส่ง
                </Text>
              </View>
              <Text style={{ fontSize: 15, paddingHorizontal: 15 }}>
                100/75 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 7 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 25, paddingHorizontal: 30, marginTop: 5 }}>
              เมนู
            </Text>
          </View>
          <View
            style={{
              flex: 2,
              backgroundColor: "#fbefefff",
              borderRadius: 25,
              height: 10,
              width: 365,
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Image
                source={kaitod}
                style={{
                  width: 85,
                  height: 85,
                  borderRadius: 50,
                  marginTop: 10,
                  left: 15,
                }}
              ></Image>
              <Text
                style={{ fontSize: 20, paddingHorizontal: 30, marginTop: 35 }}
              >
                เซ็ตพอใจ + แป๊ปซี่
              </Text>
              <Text
                style={{ fontSize: 20, paddingHorizontal: 5, marginTop: 35 }}
              >
                ฿199
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 3,
              marginTop: 25,
              paddingHorizontal: 30,
              flexDirection: "row",
            }}
          >
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 20 }}>ค่าอาหารทั้งหมด</Text>
              <Text style={{ fontSize: 20 }}>ค่าส่ง</Text>
              <Text style={{ fontSize: 20, marginTop: 25, color: "red" }}>
                ทั้งหมด
              </Text>
            </View>
            <View style={{ marginTop: 18, paddingHorizontal: 145 }}>
              <Text style={{ fontSize: 20, left: 5 }}>฿199</Text>
              <Text style={{ fontSize: 20, left: 15 }}>฿10</Text>
              <Text style={{ fontSize: 20, marginTop: 25, color: "red" }}>
                ฿209
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              router.push("./(tabs)/orderHistory");
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
                marginLeft:20,
                marginTop:20,
              }}
            >
              <Ionicons name="chevron-back-outline" size={28} color="white" />
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}
