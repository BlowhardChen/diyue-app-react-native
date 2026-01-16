import {Global} from "@/styles/global";
import {Dimensions, StyleSheet} from "react-native";

const {width: SCREEN_WIDTH} = Dimensions.get("window");
const ITEM_SPACING = 4; // 项间距
const CROP_ITEM_WIDTH = (SCREEN_WIDTH - 48 - ITEM_SPACING) / 2; // 作物项宽度
const FARMING_ITEM_WIDTH = (SCREEN_WIDTH - 48 - ITEM_SPACING * 2) / 3; // 农事项宽度

export const AddFarmScreenStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
  content: {
    flex: 1,
    padding: 10,
    marginBottom: 100,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mark: {
    width: 5,
    height: 20,
    backgroundColor: Global.colors.primary,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  cropList: {
    width: "100%",
  },
  cropGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  farmingGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cropItem: {
    width: CROP_ITEM_WIDTH,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  cropItemActive: {
    backgroundColor: "#E8F8EF",
    borderWidth: 1,
    borderColor: Global.colors.primary,
  },
  cropIcon: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  cropText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "500",
  },
  cropTextActive: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  farmingList: {
    width: "100%",
  },
  farmingItem: {
    width: FARMING_ITEM_WIDTH,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  farmingItemActive: {
    backgroundColor: "#E8F8EF",
    borderWidth: 1,
    borderColor: Global.colors.primary,
  },
  farmingText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  farmingTextActive: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  landSelectBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#F5F6F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 6,
  },
  landSelectText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  selectLandTextContnet: {
    flex: 1,
    flexDirection: "column",
  },
  selectLandText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  nameInputContainer: {
    width: "100%",
    height: 52,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    height: "100%",
    fontWeight: "500",
  },
  editIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  editIconImg: {
    width: 20,
    height: 20,
  },
  btnSave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: 84,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btn: {
    width: 343,
    height: 52,
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
});
