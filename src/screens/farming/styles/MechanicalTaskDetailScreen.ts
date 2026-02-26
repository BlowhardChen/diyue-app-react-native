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
    top: 140,
    right: 16,
  },
  locationControl: {
    position: "absolute",
    top: 210,
    right: 16,
  },
  popupTips: {
    position: "absolute",
    top: 93,
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
  farmingType: {
    position: "absolute",
    top: 140,
    left: 16,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    elevation: 5,
  },
  farmingTypeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  farmingTypeItemIcon: {
    width: 28,
    height: 0,
    marginRight: 8,
    borderTopWidth: 2,
  },
  farmingTypeText: {
    fontSize: 18,
    color: "#fff",
  },
});
