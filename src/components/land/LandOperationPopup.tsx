import React, {useEffect, useState} from "react";
import {TextInput, StyleSheet, View, Text, Modal, TouchableOpacity} from "react-native";
import {locationToAddress, mergeLand, transferLand} from "@/services/land";
import {LandListData, MergeLandParams, TransferLandParams} from "@/types/land";
import {showCustomToast} from "@/components/common/CustomToast";
import {Global} from "@/styles/global";
import {updateStore} from "@/stores/updateStore";

interface landListInfoItem extends LandListData {
  isSelect: boolean;
}

interface MergeLandPopupProps {
  operationType: string;
  selectedLands: landListInfoItem[];
  acreageNum: number;
  coordinates?: {lat: number; lng: number}[];
  onOperationSuccess: (type: string, selectedLands?: landListInfoItem[]) => void;
  onOperationError: (type: string) => void;
  onClose: (type: string) => void;
}

const LandOperationPopup: React.FC<MergeLandPopupProps> = ({
  operationType,
  selectedLands,
  coordinates,
  acreageNum,
  onOperationSuccess,
  onOperationError,
  onClose,
}) => {
  const [mergeLandName, setMergeLandName] = useState("");
  const [transferPersonMobile, setTransferPersonMobile] = useState("");
  console.log("selectedLands", selectedLands);
  useEffect(() => {
    updateStore.setIsUpdateLand(false);
  }, []);

  // 根据坐标获取地址
  const fetchAddress = async (coords: {lat: number; lng: number}[]) => {
    try {
      const res = await locationToAddress({
        latitude: coords[0].lat.toString(),
        longitude: coords[0].lng.toString(),
      });
      const {regeocode} = JSON.parse(res.data);
      return regeocode;
    } catch (error) {
      showCustomToast("error", "地址解析失败");
      return null;
    }
  };

  // 处理合并或转移操作
  const handleLandOperation = async () => {
    if (operationType === "merge") {
      await handleMerge();
    }
    if (operationType === "transfer") {
      await handleTransfer();
    }
  };

  // 处理合并操作
  const handleMerge = async () => {
    const trimmedName = mergeLandName.trim();
    if (!trimmedName) {
      showCustomToast("error", "请输入合并后的地块名称");
      return;
    }
    const {formatted_address, addressComponent} = await fetchAddress(selectedLands[0].gpsList);
    try {
      const params: MergeLandParams = {
        mergeLandName: trimmedName,
        mergeAcreageNum: acreageNum,
        country: addressComponent?.country ?? "",
        province: addressComponent?.province ?? "",
        city: addressComponent?.city ?? "",
        district: addressComponent?.district ?? "",
        township: addressComponent?.township ?? "",
        detailaddress: formatted_address ?? "",
        url: "",
        list: coordinates as {lat: number; lng: number}[],
        landOrList: selectedLands.map(item => ({landId: item.id})),
      };
      console.log("params", params);
      await mergeLand(params);
      updateStore.setIsUpdateLand(true);
      onOperationSuccess(operationType);
    } catch (error: any) {
      onOperationError(operationType);
    }
  };

  // 处理转移操作
  const handleTransfer = async () => {
    const trimmedMobile = transferPersonMobile.trim();
    if (!trimmedMobile) {
      showCustomToast("error", "请输入转移的手机号");
      return;
    }
    try {
      const params: TransferLandParams = {
        mobile: trimmedMobile,
        list: selectedLands.map(item => ({type: item.type, landId: item.id})),
      };
      await transferLand(params);
      updateStore.setIsUpdateLand(true);
      onOperationSuccess(operationType, selectedLands);
    } catch (error: any) {
      onOperationError(operationType);
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupBox}>
        <View style={styles.popupContent}>
          <View style={styles.popupContentTop}>
            <View style={styles.title}>
              <Text style={styles.titleText}>{operationType === "merge" ? "合并地块" : "转移地块"}</Text>
            </View>
          </View>

          <View style={styles.form}>
            {/* 合并地块名称输入框 */}
            {operationType === "merge" && (
              <View style={styles.formItem}>
                <TextInput
                  style={styles.formItemInput}
                  value={mergeLandName}
                  onChangeText={setMergeLandName}
                  keyboardType="default"
                  placeholder="请输入合并后的地块名称"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* 转移地块名称输入框 */}
            {operationType === "transfer" && (
              <View style={styles.formItem}>
                <TextInput
                  style={styles.formItemInput}
                  value={transferPersonMobile}
                  onChangeText={setTransferPersonMobile}
                  keyboardType="default"
                  placeholder="请输入转移的手机号"
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>

          {/* 分割线 */}
          <View style={styles.divider} />

          <View style={styles.popupBottom}>
            <TouchableOpacity style={styles.btnLeft} onPress={() => onClose(operationType)}>
              <Text style={styles.leftText}>取消</Text>
            </TouchableOpacity>
            {/* 按钮之间的分割线 */}
            <View style={styles.cross} />
            <TouchableOpacity style={styles.btnRight} onPress={handleLandOperation}>
              <Text style={styles.rightText}>{operationType === "merge" ? "合并" : "转移"}</Text>
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

export default LandOperationPopup;
