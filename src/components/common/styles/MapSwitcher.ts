import {Global} from "@/styles/global";
import {StyleSheet, Dimensions} from "react-native";

const {width} = Dimensions.get("window");

export const MapSwitcherstyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1998,
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 1999,
    elevation: 1,
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  headerClose: {
    position: "absolute",
    top: 9,
    right: 16,
  },
  closeIcon: {
    width: 26,
    height: 26,
  },
  customLayerManage: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  customLayerManageText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  mapContentContainer: {
    marginTop: 12,
    paddingTop: 8,
    minHeight: 420,
    backgroundColor: "#F5F6F8",
  },
  mapItemContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  mapItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  mapItemText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  mapItemIcon: {
    width: 26,
    height: 26,
  },
  active: {
    fontSize: 18,
    fontWeight: "500",
    color: Global.colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  saveButton: {
    flex: 1,
    backgroundColor: Global.colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
