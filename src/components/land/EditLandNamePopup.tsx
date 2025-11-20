import React, {useState, useEffect} from "react";
import {TextInput, StyleSheet, View, Text, Modal, TouchableOpacity} from "react-native";
import {Global} from "@/styles/global";
import {showCustomToast} from "../common/CustomToast";
import {editMergeLand} from "@/services/land";
import {updateStore} from "@/stores/updateStore";

interface EditLandNamePopupProps {
  id: string;
  initialName?: string;
  onClose: (status?: string) => void;
}

const EditLandNamePopup: React.FC<EditLandNamePopupProps> = ({id, initialName = "", onClose}) => {
  const [landName, setLandName] = useState("");
  console.log("initialName", initialName);
  console.log("id", id);

  // 当初始值变化或弹窗打开时，更新输入框
  useEffect(() => {
    setLandName(initialName);
  }, [initialName]);

  useEffect(() => {
    updateStore.setIsUpdateLandDetail(false);
  }, []);

  // 保存地块名称
  const handleSave = async () => {
    const trimmedName = landName.trim();
    if (!trimmedName) {
      showCustomToast("error", "地块名称不能为空");
      return;
    }
    try {
      await editMergeLand({
        id,
        mergeLandName: trimmedName,
      });
      updateStore.setIsUpdateLandDetail(true);
      onClose("success");
    } catch (error) {
      onClose("error");
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupBox}>
        <View style={styles.popupContent}>
          <View style={styles.popupContentTop}>
            <View style={styles.title}>
              <Text style={styles.titleText}>编辑地块名称</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.formItem}>
              <TextInput
                style={styles.formItemInput}
                value={landName}
                onChangeText={setLandName}
                keyboardType="default"
                placeholder="请输入地块名称"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* 分割线 */}
          <View style={styles.divider} />

          <View style={styles.popupBottom}>
            <TouchableOpacity style={styles.btnLeft} onPress={() => onClose()}>
              <Text style={styles.leftText}>取消</Text>
            </TouchableOpacity>
            {/* 按钮之间的分割线 */}
            <View style={styles.cross} />
            <TouchableOpacity style={styles.btnRight} onPress={handleSave}>
              <Text style={styles.rightText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  formItem: {
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
    fontWeight: "400",
    color: Global.colors.textDark,
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

export default EditLandNamePopup;
