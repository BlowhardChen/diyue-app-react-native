import LandEnclosureCustomNavBar from "@/components/land/LandEnclosureCustomNavBar";
import LandEnclosureMap from "@/components/land/LandEnclosureMap";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {styles} from "./styles/EnclosureScreen";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";

const EnclosureScreen = observer(() => {
  const [popupTips, setPopupTips] = useState("请点击打点按钮打点或点击十字光标标点");
  const [isShowSaveButton, setShowSaveButton] = useState(true);
  const [dotTotal, setDotTotal] = useState(0);

  // 切换地图图层
  const onToggleMapLayer = () => {};

  // 用户定位
  const onLocateUserPosition = () => {};

  // 撤销上一个打点
  const onUndoPoint = () => {};

  // 手动新增一个打点
  const onAddPoint = () => {};

  // 保存地块
  const onSaveEnclosure = () => {};

  // 使用地图光标进行打点
  const onSelectPointByCursor = () => {};

  return (
    <View style={styles.container}>
      <LandEnclosureCustomNavBar />
      <View style={styles.map}>
        {/* 提示信息 */}
        <View style={styles.popupTips}>
          <Text style={styles.popupTipsText}>{popupTips}</Text>
        </View>

        {/* 地图组件 */}
        <LandEnclosureMap />

        {/* 右侧图层按钮 */}
        <View style={styles.rightControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-layer.png")}
            iconName="图层"
            onPress={onToggleMapLayer}
          />
        </View>

        {/* 右侧定位按钮 */}
        <View style={styles.locationControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocateUserPosition}
            style={{marginTop: 16}}
          />
        </View>

        {/* 底部操作按钮组 */}
        <View style={styles.footerButtonGroup}>
          {/* 撤销打点按钮 */}
          <TouchableOpacity style={[styles.buttonBase, styles.buttonRevoke]} onPress={onUndoPoint}>
            <Text style={styles.revokeText}>撤销</Text>
          </TouchableOpacity>

          {/* 添加打点按钮 */}
          <TouchableOpacity style={[styles.buttonBase, styles.buttonDot]} onPress={onAddPoint}>
            <Image source={require("@/assets/images/common/icon-plus.png")} style={styles.dotIcon} />
            <Text style={styles.dotText}>打点</Text>
          </TouchableOpacity>

          {/* 保存围栏按钮 */}
          {isShowSaveButton ? (
            <TouchableOpacity style={[styles.buttonBase, styles.buttonSave]} onPress={onSaveEnclosure}>
              <Text style={[styles.saveText, {color: dotTotal >= 3 ? "#08ae3c" : "#999"}]}>保存</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.buttonBase, styles.placeholder]} />
          )}
        </View>

        {/* 定位光标按钮（地图中心） */}
        <TouchableOpacity style={styles.locationCursor} activeOpacity={1} onPress={onSelectPointByCursor}>
          {mapStore.mapType === "标准地图" ? (
            <Image source={require("@/assets/images/common/icon-cursor-green.png")} style={styles.cursorIcon} />
          ) : (
            <Image source={require("@/assets/images/common/icon-cursor.png")} style={styles.cursorIcon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default EnclosureScreen;
