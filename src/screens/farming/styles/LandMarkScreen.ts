import {StyleSheet, Platform} from "react-native";

export const LandMarkScreenStyles = StyleSheet.create({
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
  choiceControl: {
    position: "absolute",
    top: 210,
    right: 16,
  },
  locationControl: {
    position: "absolute",
    top: 285,
    right: 16,
  },
});
