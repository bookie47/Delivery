import React, { useMemo } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const backgroundFallback = require("../assets/Logo/bg_laewtaepu.jpg");
const logoFallback = require("../assets/profile/default.jpg");

export const BannerMarket = ({ shop }) => {
  const { width } = Dimensions.get("window");

  const bannerSource =
    typeof shop?.bannerImage === "string" && shop.bannerImage.length > 0
      ? { uri: shop.bannerImage }
      : typeof shop?.coverImage === "string" && shop.coverImage.length > 0
      ? { uri: shop.coverImage }
      : backgroundFallback;

  const logoSource = shop?.logo ? { uri: shop.logo } : logoFallback;

  const shopName =
    typeof shop?.name === "string" && shop.name.trim().length > 0
      ? shop.name
      : "Market";

  const description =
    (typeof shop?.description === "string" && shop.description.trim()) ||
    (typeof shop?.tag === "string" && shop.tag.trim()) ||
    "Fresh meals, delivered fast.";

  const ratingDisplay = useMemo(() => {
    const numeric = Number(shop?.rating);
    if (Number.isFinite(numeric)) {
      return numeric.toFixed(1);
    }
    return "4.8";
  }, [shop?.rating]);

  const deliveryEta = shop?.deliveryTime || shop?.eta || "20-30 mins";

  const distanceDisplay = useMemo(() => {
    const distanceNumber = Number(shop?.distance);
    if (Number.isFinite(distanceNumber)) {
      const decimals = distanceNumber >= 10 ? 0 : 1;
      return `${distanceNumber.toFixed(decimals)} km away`;
    }
    if (typeof shop?.address === "string" && shop.address.trim().length > 0) {
      return shop.address;
    }
    return null;
  }, [shop?.distance, shop?.address]);

  return (
    <View style={[{ width }]}>
      <ImageBackground
        source={bannerSource}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerTint} />
        <View style={styles.bannerShade} />
        <View style={styles.contentRow}>
          <View style={styles.logoWrapper}>
            <Image source={logoSource} style={styles.logo} resizeMode="cover" />
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.shopName} numberOfLines={1}>
              {shopName}
            </Text>
            <Text style={styles.shopDescription} numberOfLines={2}>
              {description}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.metaText}>{ratingDisplay} rating</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="time-outline" size={14} color="#F3F4F6" />
                <Text style={styles.metaText}>{deliveryEta}</Text>
              </View>
            </View>
          </View>
        </View>

        {distanceDisplay ? (
          <View style={styles.footerRow}>
            <View style={styles.footerDivider} />
            <View style={styles.footerChip}>
              <Ionicons name="location-outline" size={14} color="#F9FAFB" />
              <Text style={styles.footerText} numberOfLines={1}>
                {distanceDisplay}
              </Text>
            </View>
          </View>
        ) : null}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({

  banner: {
    height: 150,
    marginHorizontal: "10",
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  bannerImage: {
    borderRadius: 28,
  },
  bannerTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.35)",
  },
  bannerShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: "rgba(15,23,42,0.35)",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent:'center',
    alignItems: "center",
    gap: 18,
  },
  logoWrapper: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textColumn: {
    flex: 1,
    gap: 8,
  },
  categoryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(249,115,22,0.18)",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FCD34D",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  shopName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  shopDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  footerDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 18,
  },
  footerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "600",
  },
});
