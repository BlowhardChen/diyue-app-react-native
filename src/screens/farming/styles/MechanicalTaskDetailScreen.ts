import {StyleSheet, Dimensions} from "react-native";

const {width} = Dimensions.get("window");

export const MechanicalTaskDetailScreenStyles = StyleSheet.create({
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
  popupTips: {
    position: "absolute",
    top: 94,
    left: 0,
    zIndex: 999,
    width: width,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  popupTipsText: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 38,
    textAlign: "center",
  },
  iconClose: {
    position: "absolute",
    top: "50%",
    transform: [{translateY: -6}],
    right: 16,
    width: 12,
    height: 12,
  },
});
