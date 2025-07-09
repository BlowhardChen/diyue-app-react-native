import React from "react";
import {Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType, ViewStyle} from "react-native";

interface Props {
  iconUrl: ImageSourcePropType;
  iconName: string;
  onPress: () => void;
  style?: ViewStyle;
}

const IconItem: React.FC<Props> = ({iconUrl, iconName, onPress, style}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.iconContent, style]}>
      <Image source={iconUrl} style={styles.iconImg} />
      <Text style={styles.iconText}>{iconName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContent: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 76,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  iconImg: {
    width: 24,
    height: 24,
  },
  iconText: {
    marginTop: 6,
    fontSize: 18,
    color: "#000",
  },
});

export default IconItem;
