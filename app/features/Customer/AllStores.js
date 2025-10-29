import React, { useEffect, useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AnimatedStoreCard from "../../../components/AnimatedStoreCard";
import { SearchBar } from "../../../components/searchBar";
import { db } from "../../../firebase/connect";

const DEFAULT_TAG = "All";
const SORT_OPTIONS = [
  { id: "top", label: "Top Picks", helper: "Best rated" },
  { id: "recent", label: "Newest", helper: "Recently added" },
  { id: "name", label: "Name", helper: "A-Z" },
];
const fallbackLogo = require("../../../assets/profile/default.jpg");

export default function AllStores() {
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(DEFAULT_TAG);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]?.id ?? "top");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  useEffect(() => {
    async function fetchStores() {
      try {
        setLoadingStores(true);
        const querySnapshot = await getDocs(collection(db, "info"));
        const data = querySnapshot.docs.map((d) => ({
          id: Number(d.id),
          ...d.data(),
        }));
        data.sort((a, b) => a.id - b.id);
        setStores(data);
      } catch (error) {
        console.error("Error loading Firestore data:", error);
      } finally {
        setLoadingStores(false);
      }
    }
    fetchStores();
  }, []);

  const tagOptions = useMemo(() => {
    const foundTags = stores
      .map((store) => {
        if (typeof store?.tag === "string" && store.tag.trim().length) {
          return store.tag.trim();
        }
        return null;
      })
      .filter(Boolean);

    const unique = Array.from(new Set(foundTags));
    return unique.length ? [DEFAULT_TAG, ...unique] : [DEFAULT_TAG];
  }, [stores]);

  useEffect(() => {
    if (!tagOptions.includes(activeTag)) {
      setActiveTag(DEFAULT_TAG);
    }
  }, [activeTag, tagOptions]);

  const processedStores = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const asRating = (value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = parseFloat(value.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    let working = stores.filter(Boolean);

    if (normalizedQuery) {
      working = working.filter((store) => {
        const name =
          typeof store?.name === "string"
            ? store.name
            : store?.name
            ? String(store.name)
            : "";
        const tag =
          typeof store?.tag === "string"
            ? store.tag
            : store?.tag
            ? String(store.tag)
            : "";
        return (
          name.toLowerCase().includes(normalizedQuery) ||
          tag.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    if (activeTag !== DEFAULT_TAG) {
      working = working.filter((store) => store?.tag === activeTag);
    }

    const sorted = [...working];

    if (sortOption === "recent") {
      sorted.sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0));
    } else if (sortOption === "name") {
      sorted.sort((a, b) => {
        const nameA =
          typeof a?.name === "string" ? a.name : a?.name ? String(a.name) : "";
        const nameB =
          typeof b?.name === "string" ? b.name : b?.name ? String(b.name) : "";
        return nameA.localeCompare(nameB, "th");
      });
    } else {
      sorted.sort((a, b) => asRating(b?.rate) - asRating(a?.rate));
    }

    return sorted;
  }, [stores, searchQuery, activeTag, sortOption]);

  useEffect(() => {
    setSpotlightIndex(0);
  }, [processedStores.length, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim().length > 0 || processedStores.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setSpotlightIndex((prev) => {
        if (processedStores.length <= 1) {
          return 0;
        }
        let next = Math.floor(Math.random() * processedStores.length);
        if (next === prev) {
          next = (next + 1) % processedStores.length;
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [processedStores, searchQuery]);

  const spotlightStore = useMemo(() => {
    if (searchQuery.trim().length > 0 || !processedStores.length) return null;
    const safeIndex = Math.min(spotlightIndex, processedStores.length - 1);
    return processedStores[safeIndex];
  }, [processedStores, searchQuery, spotlightIndex]);

  const listStores = useMemo(() => {
    if (!spotlightStore) return processedStores;
    return processedStores.filter((store) => store?.id !== spotlightStore?.id);
  }, [processedStores, spotlightStore]);

  const storeStats = useMemo(() => {
    if (!stores.length) {
      return { total: 0, curated: 0, average: "0.0" };
    }
    const ratings = stores.map((store) => {
      if (typeof store?.rate === "number") return store.rate;
      if (typeof store?.rate === "string") {
        const parsed = parseFloat(store.rate.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    });
    const curatedCount = ratings.filter((rate) => rate >= 4.5).length;
    const average =
      ratings.reduce((sum, rate) => sum + rate, 0) / ratings.length || 0;
    return {
      total: stores.length,
      curated: curatedCount,
      average: average.toFixed(1),
    };
  }, [stores]);

  const formatEta = (store) => {
    const numericId = Number(store?.id) || 0;
    const base = 18 + (numericId % 6) * 3;
    return `${base}-${base + 6} min`;
  };

  const formatPriceBand = (store) => {
    const numericId = Number(store?.id) || 0;
    const levels = ["$", "$$", "$$$"];
    return levels[numericId % levels.length];
  };

  const handleSelect = (item) => {
    router.push(`/features/Customer/InfoMarket?id=${item.id}`);
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
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
            Curated {storeStats.total} places for every craving
          </Text>
        </View>
        <View style={styles.topBarAction}>
          <Ionicons name="location-outline" size={20} color="#FA4A0C" />
        </View>
      </View>

      {/*
      <View style={styles.heroCard}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroEyebrow}>What are you craving?</Text>
          <Text style={styles.heroTitle}>Discover standout spots nearby</Text>
          <Text style={styles.heroSubtitle}>Fresh picks for quick bites and slow dinners</Text>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStatChip}>
            <Text style={styles.heroStatValue}>{storeStats.total}</Text>
            <Text style={styles.heroStatLabel}>Total stores</Text>
          </View>
          <View style={styles.heroStatChip}>
            <Text style={styles.heroStatValue}>{storeStats.curated}</Text>
            <Text style={styles.heroStatLabel}>Rated 4.5+</Text>
          </View>
          <View style={styles.heroStatChip}>
            <Text style={styles.heroStatValue}>{storeStats.average}</Text>
            <Text style={styles.heroStatLabel}>Avg rating</Text>
          </View>
        </View>
      </View>
      */}

      <SearchBar
        onSearch={setSearchQuery}
        placeholder="Search stores, menus, or cuisine"
        style={styles.searchBar}
      />

      {tagOptions.length > 1 ? (
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
                style={[styles.filterPill, isActive && styles.filterPillActive]}
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
      ) : null}

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

      {spotlightStore ? (
        <View style={styles.spotlightSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="flame-outline" size={18} color="#FA4A0C" />
              <Text style={styles.sectionTitle}>Recommended today</Text>
            </View>
            <TouchableOpacity onPress={() => handleSelect(spotlightStore)}>
              <Text style={styles.sectionAction}>See details</Text>
            </TouchableOpacity>
          </View>
          <AnimatedStoreCard
            item={spotlightStore}
            index={0}
            onPress={() => handleSelect(spotlightStore)}
            variant="banner"
          />
        </View>
      ) : null}

      <View style={[styles.sectionHeader, styles.sectionHeaderSpacing]}>
        <View style={styles.sectionTitleWrap}>
          <Ionicons name="storefront-outline" size={18} color="#111827" />
          <Text style={styles.sectionTitle}>All restaurants</Text>
        </View>
        <Text style={styles.sectionCount}>{processedStores.length} stores</Text>
      </View>
    </View>
  );

  const renderStoreItem = ({ item }) => {
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
              {typeof item?.rate === "number"
                ? item.rate.toFixed(1)
                : Number.parseFloat(item?.rate)?.toFixed(1) || "0.0"}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item?.name || "House Special"}
          </Text>
          {item?.tag ? (
            <View style={styles.cardTagRow}>
              <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
              <Text style={styles.cardTagText} numberOfLines={1}>
                {item.tag}
              </Text>
            </View>
          ) : null}
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
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      {loadingStores ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#FA4A0C" />
          <Text style={styles.loaderTitle}>Loading stores...</Text>
          <Text style={styles.loaderText}>
            Fetching curated restaurants for you
          </Text>
        </View>
      ) : (
        <FlatList
          data={listStores}
          keyExtractor={(item) =>
            item?.id ? item.id.toString() : Math.random().toString()
          }
          numColumns={isGrid ? 2 : 1}
          columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
          renderItem={renderStoreItem}
          contentContainerStyle={[
            styles.listContent,
            isGrid ? styles.listContentGrid : styles.listContentSingle,
            !listStores.length && !spotlightStore
              ? styles.listEmptyPadding
              : undefined,
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={<View style={{ height: 28 }} />}
          ListEmptyComponent={!spotlightStore ? renderEmptyState : null}
        />
      )}
    </SafeAreaView>
  );
}

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
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
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
  heroCard: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  heroTextBlock: {
    gap: 6,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.78)",
  },
  heroStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  heroStatChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "flex-start",
    minWidth: 92,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    marginTop: 2,
  },
  searchBar: {
    marginTop: -8,
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
