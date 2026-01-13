// 农事管理
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import LinearGradient from "react-native-linear-gradient";
import {FarmStackParamList} from "@/types/navigation";

interface IFarmInfo {
  iconUrl: ImageSourcePropType;
  farmTypeName: string;
  url: string;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

const FarmManagementScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();
  const farmInfoList: IFarmInfo[] = [
    {
      iconUrl: require("@/assets/images/farming/icon-farm.png"),
      farmTypeName: "新建农事",
      url: "AddFarm",
    },
    {
      iconUrl: require("@/assets/images/farming/icon-map.png"),
      farmTypeName: "农事地图",
      url: "FarmMap",
    },
    {
      iconUrl: require("@/assets/images/farming/icon-mechanical.png"),
      farmTypeName: "机耕队任务",
      url: "MechanicalTask",
    },
    {
      iconUrl: require("@/assets/images/farming/icon-patrol.png"),
      farmTypeName: "巡田管理",
      url: "PatrolFieldManage",
    },
    {
      iconUrl: require("@/assets/images/farming/icon-calculator.png"),
      farmTypeName: "农资计算器",
      url: "FarmDataCalculator",
    },
  ];

  // 选择农事管理类型
  const selectFarmManageType = (item: IFarmInfo) => {
    navigation.navigate(item.url as any);
  };

  return (
    <View style={styles.container}>
      {/* 导航栏 */}
      <LinearGradient colors={["#41C95B", "#1AB850"]} start={{x: 0.5, y: 0}} end={{x: 0.15, y: 1}} style={styles.navbar}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Text style={styles.title}>农事管理</Text>
      </LinearGradient>
      {/* 农事管理类型 */}
      <View style={styles.farmMain}>
        <View style={styles.farmTypeBox}>
          {farmInfoList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.farmTypeBoxItem}
              onPress={() => selectFarmManageType(item)}
              activeOpacity={0.9}>
              <Image source={item.iconUrl} style={styles.itemIcon} resizeMode="stretch" />
              <Text style={styles.itemText}>{item.farmTypeName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default FarmManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F5F5F5",
  },
  navbar: {
    width: "100%",
    height: 88,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 44,
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  farmMain: {
    paddingHorizontal: 10,
    backgroundColor: "#f5f6f8",
  },
  farmTypeBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  farmTypeBoxItem: {
    flexDirection: "row",
    alignItems: "center",
    width: (SCREEN_WIDTH - 20 - 9) / 2,
    height: 80,
    paddingLeft: 14,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "rgba(0, 0, 0, 0.4)",
    elevation: 1,
  },
  itemIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#000",
  },
});
