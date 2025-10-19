import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/connect';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CircularCountdown from '../../../../components/CircularCountdown';
import FocusFade from "../../../../components/FocusFade";

const placeholder = require("../../../../assets/profile/default.jpg");

const OrderList = ({ orders, shops }) => {
  const renderOrderItem = ({ item }) => {
    const shop = shops[item.shopId];
    const itemCount = Object.values(item.items).reduce((acc, val) => acc + val, 0);

    if (!shop) {
      return null; // Don't render if shop data is not yet available
    }

    const remainingTime = 60 - (new Date().getTime() - new Date(item.createdAt?.toDate()).getTime()) / 1000;

    return (
      <TouchableOpacity
        style={styles.orderItem}
      >
        <Image
          source={shop.logo ? { uri: shop.logo } : placeholder}
          style={styles.shopImage}
        />
        <View style={styles.orderDetails}>
          <Text>{shop.name}</Text>
          <Text style={{ color: 'green' }}>{item.total}$</Text>
          <Text>{itemCount} รายการ</Text>
          <Text>{new Date(item.createdAt?.toDate()).toLocaleString()}</Text>
        </View>
        <View style={styles.rightContainer}>
          {item.status === 'pending' && remainingTime > 0 && (
            <CircularCountdown duration={remainingTime} />
          )}
          {item.status !== 'pending' && (
            <TouchableOpacity
              style={styles.orderAgainButton}
            >
              <Text style={{ justifyContent:'center',alignItems:'center',color:'white' }}>สั่งอีกครั้ง</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default function History() {
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [shops, setShops] = useState({});
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'inProgress', title: 'ดำเนินการ' },
    { key: 'history', title: 'ประวัติการสั่งซื้อ' },
  ]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData = [];
        querySnapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });
        
        const pending = ordersData.filter(order => order.status === 'pending').sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        const completed = ordersData.filter(order => order.status === 'completed').sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        setInProgressOrders(pending);
        setHistoryOrders(completed);

        // Fetch shop data for each order
        ordersData.forEach(async (order) => {
          if (!shops[order.shopId]) {
            const shopDocRef = doc(db, "info", order.shopId);
            const shopDoc = await getDoc(shopDocRef);
            if (shopDoc.exists()) {
              setShops((prevShops) => ({
                ...prevShops,
                [order.shopId]: shopDoc.data(),
              }));
            }
          }
        });
      });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const checkPendingOrders = async () => {
      let pendingOrders = JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
      const now = new Date();

      for (const order of pendingOrders) {
        const orderDocRef = doc(db, "orders", order.orderId);
        const orderDoc = await getDoc(orderDocRef);

        if (!orderDoc.exists()) {
          // Order doesn't exist in Firestore, remove from AsyncStorage
          pendingOrders = pendingOrders.filter(p => p.orderId !== order.orderId);
          await AsyncStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));
          continue;
        }

        const orderTime = new Date(order.createdAt);
        const diff = now.getTime() - orderTime.getTime();

        if (diff >= 60000) { // 1 minute
          await updateDoc(orderDocRef, { status: "completed" });
          pendingOrders = pendingOrders.filter(p => p.orderId !== order.orderId);
          await AsyncStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));
        } else {
          setTimeout(async () => {
            await updateDoc(orderDocRef, { status: "completed" });
            const updatedPendingOrders = JSON.parse(await AsyncStorage.getItem("pendingOrders")) || [];
            const filtered = updatedPendingOrders.filter(p => p.orderId !== order.orderId);
            await AsyncStorage.setItem("pendingOrders", JSON.stringify(filtered));
          }, 60000 - diff);
        }
      }
    };

    checkPendingOrders();
  }, []);

  const renderScene = SceneMap({
    inProgress: () => <OrderList orders={inProgressOrders} shops={shops} />,
    history: () => <OrderList orders={historyOrders} shops={shops} />,
  });

  return (
    <SafeAreaView style={styles.container}>
      <FocusFade style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            History
          </Text>
        </View>
        <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={props => 
          <TabBar 
            {...props} 
            style={{backgroundColor: '#F6F6F6'}} 
            indicatorStyle={{backgroundColor: '#FA4A0C'}} 
            activeColor={"#FA4A0C"}
            inactiveColor={"black"}
          />}
      />
      </FocusFade>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6'
  },
  header: {
    backgroundColor: '#FA4A0C',
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: 'white'
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 375,
    height: 130,
    marginTop:10,    alignSelf: 'center'
  },
  shopImage: {
    height: 75,
    width: 75,
    marginTop: 25,
    left: 25,
    resizeMode: 'cover'
  },
  orderDetails: {
    marginTop: 25,
    left: 50
  },
  rightContainer: {
    flex: 1,
    paddingLeft:50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderAgainButton: {
    borderRadius: 20,
    backgroundColor: '#FA4A0C',
    height: 35,
    width: 75,
    justifyContent:'center',
    alignItems:'center',
  }
});

