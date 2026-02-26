import {Global} from "@/styles/global";
import {Dimensions, StyleSheet} from "react-native";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

export const FarmingMapScreenStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
  navbar: {
    width: SCREEN_WIDTH,
    backgroundColor: "#fff",
    height: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  tabsContainer: {
    width: 160,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  tabItem: {
    width: 60,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    fontSize: 18,
    color: Global.colors.primary,
    fontWeight: "500",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: Global.colors.primary,
    borderRadius: 1.5,
  },
  filterBtn: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  filterBtnText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#666666",
    marginRight: 4,
  },
  filterBtnTextActive: {
    color: Global.colors.primary,
  },
  filterBtnImg: {
    width: 14,
    height: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666666",
  },
  noDataContainer: {
    flex: 1,
    marginBottom: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataIcon: {
    width: 86,
    height: 84,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 18,
    color: "#000000",
  },
  listContainer: {
    width: "100%",
    flex: 1,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: "#F5F6F8",
  },
  listContent: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 12,
  },
  farmingCard: {
    marginTop: 16,
  },
  cropHeader: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cropIcon: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  cropNameText: {
    flex: 1,
    fontSize: 20,
    color: "#000000",
    fontWeight: "500",
  },
  farmingTypesContainer: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    elevation: 1,
  },
  farmingTypeItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
  },
  farmingTypeName: {
    maxWidth: "60%",
    fontSize: 18,
    color: "#000000",
    fontWeight: "500",
  },
  farmingTypeRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  farmingAreaText: {
    fontSize: 20,
    color: "#FF8C00",
    fontWeight: "500",
  },
  farmingAreaTextActive: {
    fontSize: 20,
    color: Global.colors.primary,
    fontWeight: "500",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  typeItemDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D6D6D6",
  },
});
