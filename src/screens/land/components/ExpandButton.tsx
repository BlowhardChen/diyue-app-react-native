import React from "react";
import {TouchableOpacity, Image} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
}

const ExpandButton: React.FC<Props> = ({isExpanded, onToggle}) => {
  return (
    <TouchableOpacity style={LandDetailsPopupStyles.expand} onPress={onToggle}>
      <Image
        source={isExpanded ? require("@/assets/images/common/icon-down.png") : require("@/assets/images/common/icon-up.png")}
        style={LandDetailsPopupStyles.iconImg}
      />
    </TouchableOpacity>
  );
};

export default ExpandButton;
