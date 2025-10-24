import React from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";

interface Props {
  title: string;
  onBack: () => void;
  onClose: () => void;
}

const Header: React.FC<Props> = ({title, onBack, onClose}) => {
  return (
    <View style={LandDetailsPopupStyles.header}>
      <TouchableOpacity onPress={onBack}>
        <Image source={require("@/assets/images/common/icon-back.png")} style={LandDetailsPopupStyles.iconBtn} />
      </TouchableOpacity>
      <Text style={LandDetailsPopupStyles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <Image source={require("@/assets/images/common/icon-close.png")} style={LandDetailsPopupStyles.iconBtn} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
