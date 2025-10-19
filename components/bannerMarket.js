import { View, Image, Dimensions, StyleSheet, Text } from "react-native";

export const BannerMarket = ({ shop }) => {
  const image = require("../assets/menu/images.jpg");
  const { width } = Dimensions.get("window");

  const logoMarket = shop && shop.logo ? { uri: shop.logo } : require("../assets/Logo/fireRice.jpg");
  const shopName = shop && shop.name ? shop.name : "ร้านอาหารตามสั่ง";
  const shopDescription = shop && shop.tag ? shop.tag : "ประตู 3 หลังม.เกษตร";


  return (
    <View style={{ flex: 1 }}>
      {/* พื้นหลัง */}
      <Image
        source={image}
        style={{ width: width, height: "100%" }}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      {/* กล่องข้อมูลร้าน (ใช้ flexDirection: row) */}
      <View style={styles.infoBox}>
        <View style={{ flex: 1 }}>
          {/* โลโก้วงกลม */}
          <View style={styles.logoWrapper}>
            <Image source={logoMarket} style={styles.logo} resizeMode="cover" />
          </View>
        </View>

        <View style={{flex:2,paddingLeft:10}}>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.shopDescripton}>{shopDescription}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.7,
  },
  infoBox: {
    position: "absolute",
    top: 15,
    left: 20,
    right: 20,
    flexDirection: "row", // 🔑 แบ่งเป็นแนวนอน
    alignItems: "center", // จัดกึ่งกลางแนวตั้ง
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden", // ตัดรูปเป็นวงกลม
    borderWidth: 2,
    borderColor: "#B3B3B3",
    marginRight: 15,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  shopName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  shopDescripton:{
    color: "white",
    fontSize:12,
    paddingLeft:4
  }
});
