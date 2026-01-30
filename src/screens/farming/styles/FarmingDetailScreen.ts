import {StyleSheet, Platform} from "react-native";

export const FarmingDetailScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapBox: {flex: 1},
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
  rightControl: {
    position: "absolute",
    top: 120,
    right: 16,
  },
  locationControl: {
    position: "absolute",
    top: 190,
    right: 16,
  },
});
