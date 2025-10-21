import {Global} from "@/styles/global";
import {StyleSheet, Dimensions} from "react-native";

// 获取屏幕高度（关键：用于限制侧边栏高度）
const SCREEN_HEIGHT = Dimensions.get("window").height;

export const FilterPopupStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row-reverse",
    zIndex: 999,
  },
  overlayTouch: {
    flex: 1,
  },
  popupContainer: {
    width: "100%",
    alignItems: "flex-end",
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  popupBox: {
    width: 300,
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    flexDirection: "column",
    height: "100%",
  },
  condition: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    overflow: "hidden",
  },
  conditionContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  item: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF2F3",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  iconRight: {
    width: 18,
    height: 18,
  },
  iconScan: {
    width: 22,
    height: 22,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 32,
  },
  radioIcon: {
    width: 24,
    height: 24,
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  rangeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rangeInput: {
    width: 110,
    height: 44,
    backgroundColor: "#EFF2F3",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  rangeDivider: {
    fontSize: 14,
    color: "#999",
  },
  bottomBtn: {
    height: 72,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E7E7E7",
    position: "relative",
    zIndex: 10,
  },
  btn: {
    width: 120,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  reset: {
    backgroundColor: "#F0F2F5",
  },
  query: {
    backgroundColor: Global.colors.primary,
  },
  btnTextReset: {
    fontSize: 18,
    color: Global.colors.primary,
    fontWeight: "500",
  },
  btnTextQuery: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
});
