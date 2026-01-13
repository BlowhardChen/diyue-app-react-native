import {showCustomToast} from "@/components/common/CustomToast";
import {requestPhonePermission} from "@/utils/checkPermissions";
import {useState} from "react";
import {Linking, Platform} from "react-native";
import Communications from "react-native-communications";

const usePhoneCall = () => {
  const [showKfPopup, setShowKfPopup] = useState(false);
  const [isShowPowerPopup, setIsShowPowerPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("400-666-8888");

  // 拨打电话
  const callPhone = async (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    const granted = await requestPhonePermission();
    console.log("拨打电话权限：", granted);
    if (granted) {
      Linking.openURL(`tel:${phoneNumber}`);
      return;
    } else {
      setIsShowPowerPopup(true);
    }
  };

  // 取消开启权限
  const cancelOpenPower = () => {
    setIsShowPowerPopup(false);
  };

  // 确认开启权限
  const confirmOpenPower = async () => {
    setIsShowPowerPopup(false);
    if (Platform.OS === "android") {
      try {
        const granted = await requestPhonePermission();
        if (granted) {
          Linking.openURL(`tel:${phoneNumber}`);
        }
      } catch (err) {
        showCustomToast("error", "申请拨打电话权限失败");
      }
    }
  };

  return {
    showKfPopup,
    isShowPowerPopup,
    callPhone,
    cancelOpenPower,
    confirmOpenPower,
    setShowKfPopup,
  };
};

export default usePhoneCall;
