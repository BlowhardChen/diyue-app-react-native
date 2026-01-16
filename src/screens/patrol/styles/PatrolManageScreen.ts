import {StyleSheet, Platform} from "react-native";

export const PatrolManageScreenStyles = StyleSheet.create({
  container: {
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
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  patrolButton: {
    width: "100%",
    height: 84,
    backgroundColor: "#fff",
  },
  patrolButtonBox: {
    width: "100%",
    height: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tips: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  warningImg: {
    width: 26,
    height: 26,
  },
  tipsText: {
    fontSize: 18,
    color: "#000",
  },
  button: {
    width: 239,
    height: 52,
    marginLeft: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
});
