import React, {useState, useEffect} from "react";
import {TextInput, StyleSheet, View} from "react-native";
import Popup from "../common/Popup"; // 引入你项目中的基础 Popup

interface EditLandNamePopupProps {
  visible: boolean;
  initialName?: string;
  onSave: (newName: string) => Promise<void>;
  onClose: () => void;
}

const EditLandNamePopup: React.FC<EditLandNamePopupProps> = ({visible, initialName = "", onSave, onClose}) => {
  const [landName, setLandName] = useState("");

  // 当初始值变化或弹窗打开时，更新输入框
  useEffect(() => {
    if (visible) {
      setLandName(initialName);
    }
  }, [initialName, visible]);

  const handleSave = async () => {
    const trimmedName = landName.trim();
    if (!trimmedName) {
      // 这里可以使用你项目中的 Toast 组件提示用户
      console.warn("地块名称不能为空");
      return;
    }
    await onSave(trimmedName);
    // onSave 成功后，通常由父组件调用 onClose
  };

  return (
    <Popup
      visible={visible}
      title="修改地块名称"
      leftBtnText="取消"
      rightBtnText="确定"
      onLeftBtn={onClose}
      onRightBtn={handleSave}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="请输入新的地块名称"
          value={landName}
          onChangeText={setLandName}
          autoFocus={true}
        />
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});

export default EditLandNamePopup;
