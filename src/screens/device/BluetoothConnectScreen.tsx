// 蓝牙连接
import React, {useEffect, useState, useRef} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {BleManager, Device} from "react-native-ble-plx";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import PermissionPopup from "@/components/common/PermissionPopup";
import {check, requestMultiple, PERMISSIONS, RESULTS} from "react-native-permissions";
import {StackNavigationProp} from "@react-navigation/stack";
import {showCustomToast} from "@/components/common/CustomToast";

const manager = new BleManager();

type BluetoothConnectStackParamList = {
  CurrentConnect: {imei: string};
};

const BluetoothConnectScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<BluetoothConnectStackParamList>>();
  const [blueDeviceList, setBlueDeviceList] = useState<Device[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [hasBluetoothPermission, setHasBluetoothPermission] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // 初始化蓝牙
  const initBluetooth = () => {
    manager.startDeviceScan(["0000ffe0-0000-1000-8000-00805f9b34fb"], {scanMode: 1}, (error, device) => {
      if (error) {
        console.log("蓝牙初始化失败", error);
        showCustomToast("error", "蓝牙初始化失败");
        return;
      }
      if (device && device.name) {
        setBlueDeviceList(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });
  };

  // 开始扫描
  const startDiscovery = () => {
    initBluetooth();
  };

  // 停止扫描
  const stopDiscovery = () => {
    manager.stopDeviceScan();
  };

  // 单次扫描
  const scanOnce = () => {
    stopDiscovery();
    startDiscovery();
    setTimeout(stopDiscovery, 5000);
  };

  // 自动扫描
  const startAutoScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const id = setInterval(() => {
      scanOnce();
    }, 3000);
    intervalRef.current = id as unknown as number;
  };

  // 停止自动扫描
  const stopAutoScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 获取权限列表
  const getPermissionList = () => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        return [PERMISSIONS.ANDROID.BLUETOOTH_SCAN, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT];
      } else {
        return [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
      }
    }
    return [];
  };

  // 检查权限
  const checkPermissionsOnStart = async () => {
    try {
      const permissions = getPermissionList();
      const results = await Promise.all(permissions.map(p => check(p)));
      const allGranted = results.every(r => r === RESULTS.GRANTED);

      if (allGranted) {
        setHasBluetoothPermission(true);
        scanOnce();
        startAutoScan();
      } else {
        setHasBluetoothPermission(false);
        setShowPermissionPopup(true); // 没权限 -> 弹窗
      }
    } catch (err) {
      console.warn("检查权限失败:", err);
      setShowPermissionPopup(true);
    }
  };

  // 接受权限
  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    try {
      const permissions = getPermissionList();
      const results = await requestMultiple(permissions);
      const allGranted = Object.values(results).every(r => r === RESULTS.GRANTED);

      if (allGranted) {
        setHasBluetoothPermission(true);
        scanOnce();
        startAutoScan();
      } else {
        setHasBluetoothPermission(false);
      }
    } catch (err) {
      console.warn("请求权限失败:", err);
      setHasBluetoothPermission(false);
    }
  };

  // 拒绝权限
  const handleRejectPermission = () => {
    setShowPermissionPopup(false);
    setHasBluetoothPermission(false);
    stopDiscovery();
    stopAutoScan();
  };

  // 连接蓝牙
  const connectBluetooth = async (device: Device) => {
    try {
      console.log("连接设备:", device.name);
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      stopDiscovery();
      console.log("连接成功:", connectedDevice.id);
    } catch (err) {
      console.log("连接失败:", err);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // 刷新
  const refresh = () => {
    setBlueDeviceList([]);
    scanOnce();
    if (isRotating) return;

    setIsRotating(true);
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setIsRotating(false);
      rotateAnim.setValue(0);
    });
  };

  useEffect(() => {
    checkPermissionsOnStart();

    return () => {
      stopDiscovery();
      stopAutoScan();
      manager.destroy();
    };
  }, []);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.manualInput}>
        <CustomStatusBar navTitle="蓝牙连接" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          {/* 顶部操作区 */}
          <View style={styles.topAction}>
            <Text style={styles.text}>可用设备</Text>
            <TouchableOpacity style={styles.refresh} onPress={refresh}>
              <Animated.Image
                source={require("@/assets/images/device/icon-refresh.png")}
                style={[styles.refreshIcon, isRotating ? {transform: [{rotate}]} : null]}
              />
            </TouchableOpacity>
          </View>

          {/* 蓝牙列表 / 加载中 */}
          {hasBluetoothPermission ? (
            blueDeviceList.length > 0 ? (
              <FlatList
                data={blueDeviceList}
                keyExtractor={item => item.id}
                style={styles.bluetoothList}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.bluetoothItem} onPress={() => connectBluetooth(item)}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.type}>({item.rssi ? item.rssi : "N/A"} dBm)</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color="#08ae3c" />
                <Text style={{marginTop: 8, fontSize: 16, color: "#666"}}>加载中</Text>
              </View>
            )
          ) : null}
        </View>

        {/* 权限弹窗 */}
        <PermissionPopup
          visible={showPermissionPopup}
          onAccept={handleAcceptPermission}
          onReject={handleRejectPermission}
          title={"开启蓝牙权限"}
          message={"开启蓝牙权限将用于搜索连接设备"}
        />
      </View>
    </SafeAreaView>
  );
};

export default BluetoothConnectScreen;

const styles = StyleSheet.create({
  page: {flex: 1, backgroundColor: "#fff"},
  manualInput: {flex: 1},
  content: {flex: 1, backgroundColor: "#f5f6f8"},
  topAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  text: {fontSize: 18, fontWeight: "500", color: "#000"},
  refresh: {width: 26, height: 26},
  refreshIcon: {width: 26, height: 26},
  bluetoothList: {flex: 1, backgroundColor: "#fff"},
  bluetoothItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 64,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  name: {fontSize: 18, fontWeight: "500", color: "#000"},
  type: {fontSize: 18, fontWeight: "500", color: "#000"},
  empty: {alignItems: "center", justifyContent: "center", marginTop: 14},
});
