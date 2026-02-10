import React, {useState, useEffect} from "react";
import {TextInput, StyleSheet, View, Text, Modal, Image, TouchableOpacity} from "react-native";
import {Global} from "@/styles/global";

interface CustomLayerPopupProps {
  layerNameProp?: string;
  layerUrlProp?: string;
  rightBtnText?: string;
  onLeftBtn: () => void;
  onRightBtn: () => void;
}

const CustomLayerPopup: React.FC<CustomLayerPopupProps> = ({
  layerNameProp = "",
  layerUrlProp = "",
  rightBtnText = "添加",
  onLeftBtn,
  onRightBtn,
}) => {
  const [layerName, setLayerName] = useState("");
  const [layerUrl, setLayerUrl] = useState("");

  useEffect(() => {
    setLayerName(layerNameProp);
    setLayerUrl(layerUrlProp);
  }, [layerNameProp, layerUrlProp]);

  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupBox}>
        <View style={styles.popupContent}>
          <View style={styles.popupContentTop}>
            <View style={styles.title}>
              <Text style={styles.titleText}>自定义图层</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.formItemLabel}>图层名称</Text>
              <View style={styles.formItemContent}>
                <TextInput
                  style={styles.formItemInput}
                  value={layerName}
                  onChangeText={setLayerName}
                  keyboardType="default"
                  placeholder="请输入图层名称"
                  placeholderTextColor="#999"
                />
                {layerName && (
                  <TouchableOpacity onPress={() => setLayerName("")}>
                    <Image source={require("@/assets/images/login/icon-clear.png")} style={styles.clearIcon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View>
              <Text style={styles.formItemLabel}>图层连接</Text>
              <View style={[styles.formItemContent, {height: 100}]}>
                <TextInput
                  style={[styles.formItemInput, {height: 100}]}
                  value={layerUrl}
                  onChangeText={setLayerUrl}
                  keyboardType="default"
                  placeholder="请输入图层连接"
                  placeholderTextColor="#999"
                  numberOfLines={6}
                  multiline
                  textAlignVertical="top"
                />
                {layerUrl && (
                  <TouchableOpacity onPress={() => setLayerUrl("")}>
                    <Image source={require("@/assets/images/login/icon-clear.png")} style={styles.clearIcon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* 分割线 */}
          <View style={styles.divider} />

          <View style={styles.popupBottom}>
            <TouchableOpacity style={styles.btnLeft} onPress={onLeftBtn}>
              <Text style={styles.leftText}>取消</Text>
            </TouchableOpacity>
            {/* 按钮之间的分割线 */}
            <View style={styles.cross} />
            <TouchableOpacity style={styles.btnRight} onPress={onRightBtn}>
              <Text style={styles.rightText}>{rightBtnText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1998,
  },
  popupBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    width: 311,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
  },
  popupContentTop: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  title: {
    marginTop: 12,
    alignSelf: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  form: {
    padding: 24,
    paddingTop: 18,
  },
  formItemLabel: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
  },
  formItemContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 22,
    backgroundColor: "#f4f4f6",
    borderRadius: 8,
  },
  formItemInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  clearIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ededed",
  },
  popupBottom: {
    flexDirection: "row",
    alignItems: "center",
    height: 51,
    width: "100%",
  },
  btnLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leftText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  rightText: {
    fontSize: 20,
    fontWeight: "500",
    color: Global.colors.primary,
  },
  cross: {
    width: 1,
    height: 24,
    backgroundColor: "#ededed",
  },
});

export default CustomLayerPopup;
