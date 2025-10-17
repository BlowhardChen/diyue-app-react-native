import {Global} from "@/styles/global";
import {StyleSheet} from "react-native";
export const FilterPopupStyles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row-reverse",
  },
  overlayTouch: {
    flex: 1,
  },
  popupContainer: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  popupBox: {
    width: 300,
    height: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  condition: {
    paddingHorizontal: 16,
    paddingTop: 24,
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 72,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E7E7E7",
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
