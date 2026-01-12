import React from "react";
import {View, Text, StyleSheet} from "react-native";

interface Props {
  label: string;
  value?: string;
}

const InfoItem = ({label, value}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>
        {value || "--"}
      </Text>
    </View>
  );
};

export default InfoItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7E7",
  },
  label: {
    width: 100,
    fontSize: 18,
    color: "#000",
  },
  value: {
    flex: 1,
    fontSize: 18,
    color: "#000",
    fontWeight: "500",
  },
});
