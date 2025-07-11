import LandHomeCustomNavbar from "@/components/land/LandHomeCustomNavbar";
import {View} from "react-native";
import {styles} from "./styles/LandManagementScreen";
import LandHomeMap from "@/components/land/LandHomeMap";
import MapControlButton from "@/components/land/MapControlButton";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

type LandStackParamList = {
  Enclosure: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<LandStackParamList>>();

  // 切换tab
  const changeTab = (title: string, type: string) => {
    console.log(title, type);
  };

  // 切换图层
  const expandMapLayer = () => {};

  // 圈地
  const startEnclosure = () => {
    navigation.navigate("Enclosure");
  };

  // 隐藏地图按钮
  const hideMapControl = () => {};

  // 显示地图按钮
  const showMapControl = () => {};

  // 定位
  const locationControl = () => {};

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <LandHomeCustomNavbar onChangeTab={changeTab} />
      <View style={styles.map}>
        {/* 地图组件 */}
        <LandHomeMap />
        {/* 右侧按钮 */}
        <View style={styles.rightControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-layer.png")}
            iconName="图层"
            onPress={expandMapLayer}
          />
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-enclosure.png")}
            iconName="圈地"
            onPress={startEnclosure}
            style={{marginTop: 16}}
          />
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-hide.png")}
            iconName="隐藏"
            onPress={hideMapControl}
            style={{marginTop: 16}}
          />
        </View>
        {/* 定位按钮 */}
        <View style={styles.locationControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-show.png")}
            iconName="显示"
            onPress={showMapControl}
            style={{marginTop: 16}}
          />
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={locationControl}
            style={{marginTop: 16}}
          />
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
