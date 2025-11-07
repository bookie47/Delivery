import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SearchBar } from "../../../components/searchBar";
import { db } from "../../../firebase/connect";

const DEFAULT_TAG = "All";
const SORT_OPTIONS = [
  { id: "top", label: "Top Picks", helper: "Best rated" },
  { id: "recent", label: "Newest", helper: "Recently added" },
  { id: "name", label: "Name", helper: "A-Z" },
];
const fallbackLogo = require("../../../assets/profile/default.jpg");
const HEADER_HEIGHT = 140;

export default function AllStores() {
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(DEFAULT_TAG);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]?.id ?? "top");

  // ────────────────────────────────
  // 🔹 โหลดข้อมูลร้านจาก Firestore
  // ────────────────────────────────
  useEffect(() => {
    async function fetchStores() {
      try {
        setLoadingStores(true);
        const querySnapshot = await getDocs(collection(db, "info"));
        const data = querySnapshot.docs.map((d) => {
          const docData = d.data();
          return {
            ...docData,
            id: docData.id,
            docId: d.id,
          };
        });
        data.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
        setStores(data);
      } catch (error) {
        console.error("Error loading Firestore data:", error);
      } finally {
        setLoadingStores(false);
      }
    }
    fetchStores();
  }, []);

  // ────────────────────────────────
  // 🔹 ดึง Tag ทั้งหมดจากร้าน
  // ────────────────────────────────
  const tagOptions = useMemo(() => {
    const foundTags = stores
      .map((store) =>
        typeof store?.tag === "string" && store.tag.trim().length
          ? store.tag.trim()
          : null
      )
      .filter(Boolean);
    const unique = Array.from(new Set(foundTags));
    return unique.length ? [DEFAULT_TAG, ...unique] : [DEFAULT_TAG];
  }, [stores]);

  // รีเซ็ต tag ถ้าไม่เจอในร้าน
  useEffect(() => {
    if (!tagOptions.includes(activeTag)) setActiveTag(DEFAULT_TAG);
  }, [activeTag, tagOptions]);

  // ────────────────────────────────
  // 🔹 ประมวลผลร้าน (filter + sort)
  // ────────────────────────────────
  const processedStores = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const asRating = (v) =>
      typeof v === "number"
        ? v
        : typeof v === "string"
        ? parseFloat(v.replace(",", ".")) || 0
        : 0;

    let working = stores.filter(Boolean);

    // filter จาก search
    if (normalizedQuery) {
      working = working.filter((store) => {
        const name = String(store?.name || "").toLowerCase();
        const tag = String(store?.tag || "").toLowerCase();
        return (
          name.includes(normalizedQuery) || tag.includes(normalizedQuery)
        );
      });
    }

    // filter จาก tag
    if (activeTag !== DEFAULT_TAG) {
      working = working.filter((s) => s?.tag === activeTag);
    }

    // sort
    const sorted = [...working];
    if (sortOption === "recent")
      sorted.sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0));
    else if (sortOption === "name")
      sorted.sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""), "th")
      );
    else sorted.sort((a, b) => asRating(b?.rate) - asRating(a?.rate));

    return sorted;
  }, [stores, searchQuery, activeTag, sortOption]);

  // ✅ listStores ต้องมาหลัง processedStores
  const listStores = useMemo(() => processedStores, [processedStores]);

  // ────────────────────────────────
  // 🔹 Suggestion สำหรับ SearchBar
  // ────────────────────────────────
  const searchSuggestionsMemo = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matched = [];

    const add = (s) => {
      if (!s?.id) return;
      if (!matched.some((m) => m.id === s.id && m.type === s.type))
        matched.push(s);
    };

    stores.forEach((store) => {
      const storeName = String(store?.name || "");
      const storeTag = String(store?.tag || "");
      const storeId = store?.id;

      if (storeName.toLowerCase().includes(normalizedQuery))
        add({ id: `store-${storeId}`, storeId, name: storeName, type: "store" });

      if (storeTag.toLowerCase().includes(normalizedQuery))
        add({ id: `tag-${storeId}-${storeTag}`, storeId, name: storeTag, type: "tag" });

      store?.menu?.forEach((menu) => {
        const menuName = String(menu?.name || "");
        if (menuName.toLowerCase().includes(normalizedQuery))
          add({
            id: `menu-${storeId}-${menuName}`,
            storeId,
            name: menuName,
            type: "menu",
            storeName,
          });
      });
    });

    return matched;
  }, [stores, searchQuery]);

  // ────────────────────────────────
  // 🔹 Helper ฟังก์ชัน
  // ────────────────────────────────
  const formatEta = (store) => {
    const n = Number(store?.id) || 0;
    const base = 18 + (n % 6) * 3;
    return `${base}-${base + 6} min`;
  };
  const formatPriceBand = (store) => {
    const n = Number(store?.id) || 0;
    return ["$", "$$", "$$$"][n % 3];
  };
  const handleSelect = useCallback(
    (item) => router.push(`/features/Customer/InfoMarket?id=${item.id}`),
    []
  );

  // ────────────────────────────────
  // 🔹 Header ของ FlatList
  // ────────────────────────────────
  const renderListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* filter tags */}
        {tagOptions.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPills}
          >
            {tagOptions.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setActiveTag(tag)}
                  style={[
                    styles.filterPill,
                    isActive && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive && styles.filterPillTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* sort options */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const isActive = sortOption === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSortOption(option.id)}
                style={[styles.sortChip, isActive && styles.sortChipActive]}
              >
                <Text
                  style={[
                    styles.sortChipLabel,
                    isActive && styles.sortChipLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.sortChipHelper,
                    isActive && styles.sortChipHelperActive,
                  ]}
                >
                  {option.helper}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.sectionHeader, styles.sectionHeaderSpacing]}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="storefront-outline" size={18} color="#111827" />
            <Text style={styles.sectionTitle}>All restaurants</Text>
          </View>
          <Text style={styles.sectionCount}>{listStores.length} stores</Text>
        </View>
      </View>
    ),
    [activeTag, sortOption, listStores.length, tagOptions]
  );

  // ────────────────────────────────
  // 🔹 render รายการร้าน
  // ────────────────────────────────
  const renderStoreItem = useCallback(
    ({ item }) => {
      const logoSource =
        typeof item?.logo === "string" && item.logo.length
          ? { uri: item.logo }
          : fallbackLogo;

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect(item)}
          activeOpacity={0.94}
        >
          <View style={styles.cardImageWrapper}>
            <Image source={logoSource} style={styles.cardImage} />
            <View style={styles.cardOverlay} />
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {parseFloat(item?.rate || 0).toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardName} numberOfLines={2}>
              {item?.name || "House Special"}
            </Text>
            {item?.tag && (
              <View style={styles.cardTagRow}>
                <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
                <Text style={styles.cardTagText}>{item.tag}</Text>
              </View>
            )}
            <View style={styles.cardMetaRow}>
              <View style={styles.metaChip}>
                <Ionicons name="time-outline" size={12} color="#FA4A0C" />
                <Text style={styles.metaChipText}>{formatEta(item)}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="cash-outline" size={12} color="#FA4A0C" />
                <Text style={styles.metaChipText}>{formatPriceBand(item)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelect]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="search-outline" size={22} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No matches found</Text>
      <Text style={styles.emptySubtitle}>
        Try a different keyword or pick another category to explore new spots.
      </Text>
    </View>
  );

  const isGrid = listStores.length > 1;

  // ────────────────────────────────
  // 🔹 Render UI
  // ────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      {loadingStores ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#FA4A0C" />
          <Text style={styles.loaderTitle}>Loading stores...</Text>
          <Text style={styles.loaderText}>
            Fetching curated restaurants for you
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            key={`stores-${isGrid ? "grid" : "single"}`}
            data={listStores}
            extraData={{ sortOption, activeTag, searchQuery }}
            keyExtractor={(i) => i?.docId || String(i.id)}
            numColumns={isGrid ? 2 : 1}
            columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
            renderItem={renderStoreItem}
            contentContainerStyle={[
              styles.listContent,
              { paddingTop: HEADER_HEIGHT },
              isGrid ? styles.listContentGrid : styles.listContentSingle,
              !listStores.length ? styles.listEmptyPadding : undefined,
            ]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={<View style={{ height: 28 }} />}
            ListEmptyComponent={renderEmptyState}
          />

          {/* 🔹 Floating Search Header */}
          <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={20} color="#111827" />
              </TouchableOpacity>
              <View style={styles.topBarText}>
                <Text style={styles.pageTitle}>Discover Restaurants</Text>
                <Text style={styles.pageSubtitle}>
                  Curated {stores.length} places for every craving
                </Text>
              </View>
              <View style={styles.topBarAction}>
                <Ionicons name="location-outline" size={20} color="#FA4A0C" />
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// (styles เดิมทั้งหมดคงไว้ ไม่ต้องแก้)


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loaderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
    backgroundColor: "#F9FAFB",
  },
  loaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  loaderText: {
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 20,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  topBarText: {
    flex: 1,
    marginHorizontal: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  pageSubtitle: {
    color: "#6B7280",
    marginTop: 2,
  },
  topBarAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(250,74,12,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    // No specific style overrides needed now
  },
  filterPills: {
    gap: 12,
    paddingRight: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },
  filterPillActive: {
    backgroundColor: "#FA4A0C",
  },
  filterPillText: {
    color: "#4338CA",
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sortChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  sortChipActive: {
    borderColor: "rgba(250,74,12,0.35)",
    backgroundColor: "rgba(250,74,12,0.08)",
  },
  sortChipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  sortChipLabelActive: {
    color: "#FA4A0C",
  },
  sortChipHelper: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  sortChipHelperActive: {
    color: "#FA4A0C",
  },
  spotlightSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionAction: {
    fontSize: 13,
    color: "#FA4A0C",
    fontWeight: "600",
  },
  sectionHeaderSpacing: {
    marginTop: 4,
  },
  sectionCount: {
    color: "#6B7280",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 16,
  },
  listContentGrid: {
    paddingHorizontal: 0,
  },
  listContentSingle: {
    paddingHorizontal: 20,
  },
  listEmptyPadding: {
    paddingHorizontal: 20,
  },
  columnWrapper: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageWrapper: {
    height: 140,
    width: "100%",
    backgroundColor: "#E5E7EB",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(17,24,39,0.72)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  cardTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTagText: {
    flex: 1,
    color: "#6B7280",
  },
  cardMetaRow: {
    flexDirection: "row",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(250,74,12,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FA4A0C",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
