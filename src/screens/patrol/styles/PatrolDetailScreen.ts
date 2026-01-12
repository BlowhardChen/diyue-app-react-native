import {StyleSheet, Dimensions} from "react-native";

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

export const PatrolDetailScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(245, 246, 248, 1)",
  },
  card: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
  },
  mapWrapper: {
    marginTop: 16,
    height: 222,
    backgroundColor: "#fff",
  },
  mapFull: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 99,
  },
  expandIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 100,
  },
  icon: {
    width: 26,
    height: 26,
  },
  map: {flex: 1},
  rightControl: {
    position: "absolute",
    top: 200,
    right: 16,
  },
  locationControl: {
    position: "absolute",
    bottom: 50,
    right: 16,
  },
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
});
