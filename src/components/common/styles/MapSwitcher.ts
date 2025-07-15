import {Global} from "@/styles/global";
import {StyleSheet, Dimensions} from "react-native";

const {width} = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width,
    height: 220,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 1999,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
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
    right: 12,
  },
  closeIcon: {
    width: 26,
    height: 26,
  },
  mapContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mapItem: {
    alignItems: "center",
    width: 108,
  },
  mapImage: {
    width: 108,
    height: 88,
    marginBottom: 12,
    resizeMode: "contain",
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Global.colors.textDark,
  },
  active: {
    color: Global.colors.primary,
  },
  editTip: {
    marginTop: 4,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  customLayerBox: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF2F3",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  buttonWrapper: {
    marginTop: 24,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Global.colors.primary,
    width: width - 64,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
