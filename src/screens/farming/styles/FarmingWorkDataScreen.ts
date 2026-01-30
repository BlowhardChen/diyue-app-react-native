import {StyleSheet, Platform} from "react-native";

export const FarmingWorkDataScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  HeaderContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 999,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: Platform.OS === "ios" ? 44 : 56,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    color: "#fff",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperImage: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    marginLeft: 8,
    width: 13,
    height: 8,
    resizeMode: "contain",
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
