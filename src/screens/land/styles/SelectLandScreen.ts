import {Global} from "@/styles/global";
import {StyleSheet} from "react-native";
import {Dimensions} from "react-native";

const {width} = Dimensions.get("window");

export const SelectLandScreenStyles = StyleSheet.create({
  landListContainer: {
    position: "absolute",
    bottom: 84,
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 16,
  },
  landListBox: {
    flexGrow: 1,
  },
  checkContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 84,
    zIndex: 199,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 1,
  },
  checkBottomContainer: {
    height: 84,
    alignItems: "flex-start",
    justifyContent: "center",
    elevation: 1,
  },
  checkButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    width: 26,
    height: 26,
  },
  checkTextContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  checkText: {
    flexDirection: "row",
  },
  checkTextNumber: {
    fontWeight: "400",
    color: Global.colors.primary,
  },
  checkTextIcon: {
    width: 18,
    height: 18,
  },
  manageButtonContainer: {
    paddingHorizontal: 16,
    minWidth: 120,
    height: 52,
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  manageButtonTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
