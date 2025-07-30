import LandHomeCustomNavbar from "@/components/land/LandHomeCustomNavbar";
import {View, Image, Text} from "react-native";
import {styles} from "./styles/LandManagementScreen";
import MapControlButton from "@/components/land/MapControlButton";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import MapSwitcher from "@/components/common/MapSwitcher";
import {useState} from "react";
import WebView from "react-native-webview";

type LandStackParamList = {
  Enclosure: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<LandStackParamList>>();

  const [showMapSwitcher, setShowMapSwitcher] = useState(false);

  // 切换tab
  const changeTab = (title: string, type: string) => {
    console.log(title, type);
  };

  // 切换图层
  const expandMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 切换地图
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    console.log("选中的地图类型:", type);
    console.log("地图地址:", layerUrl);
    // 这里可以调用地图组件的切换逻辑或更新状态等
  };

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

  const handleMessage = (event: any) => {
    console.log("🌐 WebView Message:", event.nativeEvent.data);
  };

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <LandHomeCustomNavbar onChangeTab={changeTab} />
      <View style={styles.map}>
        {/* 地图 */}
        <View style={styles.map}>
          <WebView
            source={{uri: "file:///android_asset/web/homeMap.html"}}
            originWhitelist={["*"]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            onMessage={handleMessage}
            style={{flex: 1}}
          />
          <View style={styles.mapCopyright}>
            <Image source={require("../../assets/images/home/icon-td.png")} style={styles.iconImg} />
            <Text style={styles.copyrightText}>©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471</Text>
          </View>
        </View>
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
        {/* 地图切换弹窗组件 */}
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}
      </View>
    </View>
  );
};

export default HomeScreen;
