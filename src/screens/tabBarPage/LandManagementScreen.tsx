import LandHomeCustomNavbar from "@/components/landHome/LandHomeCustomNavbar";
import {View} from "react-native";
import {styles} from "./styles/LandManagementScreen";
import LandHomeMap from "@/components/landHome/LandHomeMap";
import MapControlButton from "@/components/landHome/MapControlButton";

const HomeScreen = () => {
  // 切换tab
  const changeTab = (title: string, type: string) => {
    console.log(title, type);
  };
  // 切换图层
  const expandMapLayer = () => {};
  // 圈地
  const startEnclosure = () => {};
  // 隐藏地图按钮
  const hideMapControl = () => {};
  // 显示地图按钮
  const showMapControl = () => {};

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
            onPress={hideMapControl}
            style={{marginTop: 16}}
          />
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
