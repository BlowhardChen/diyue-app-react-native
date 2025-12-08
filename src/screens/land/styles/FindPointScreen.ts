import {StyleSheet, Platform} from "react-native";
export const FindPointScreenStyles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  mapBox: {flex: 1},
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
  headerContainer: {
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
  iconImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  devicePopupContainer: {
    width: "100%",
    height: 190,
    backgroundColor: "#fff",
  },
  deviceHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 18,
  },
  deviceTitle: {
    fontSize: 20,
    fontWeight: 500,
    color: "#000",
  },
  headerBack: {
    width: 26,
    height: 26,
  },
  backIcon: {
    width: 26,
    height: 26,
  },
  deviceContent: {
    width: "100%",
    height: 52,
    paddingHorizontal: 16,
  },
  deviceContentContainer: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  deviceStatusText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 500,
    color: "#000",
  },
  deviceCoordinates: {
    marginTop: 12,
    width: "100%",
    paddingHorizontal: 15,
  },
  deviceCoordinatesContainer: {
    marginBottom: 8,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  deviceCoordinatesText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 400,
    color: "#000",
  },
});
