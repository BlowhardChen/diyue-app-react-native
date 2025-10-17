import {StyleSheet} from "react-native";

export const LandManagementScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
  rightControl: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  locationControl: {position: "absolute", bottom: 32, right: 16},
  landType: {
    position: "absolute",
    bottom: 32,
    left: 16,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "space-around",
    width: 86,
    height: 76,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16 / 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  landTypeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  text: {
    fontSize: 18,
    color: "#fff",
  },
});
