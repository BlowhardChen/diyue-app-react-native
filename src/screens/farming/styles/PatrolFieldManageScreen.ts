import {Global} from "@/styles/global";
import {Dimensions, Platform, StyleSheet} from "react-native";
// 样式定义
const {width: screenWidth} = Dimensions.get("window");
const rpxToPx = (rpx: number) => (screenWidth / 750) * rpx;
export const PatrolFieldManageScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  // 导航栏样式
  navBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: Platform.OS === "ios" ? 44 : 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 20,
    color: "#333",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  rightButton: {
    paddingHorizontal: 8,
  },
  rightTitle: {
    fontSize: 16,
    color: "#333",
  },
  navbar: {
    width: screenWidth,
    backgroundColor: "#fff",
    height: 54,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  tabItem: {
    width: 75,
    height: 48,
    marginHorizontal: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 20,
    color: "#000",
  },
  activeTabText: {
    fontWeight: "500",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    width: 75,
    height: 3,
    backgroundColor: "#08ae3c",
    borderRadius: 1.5,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#f7f7f8",
  },
  listContent: {
    marginTop: 8,
    backgroundColor: "#fff",
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f7f7f8",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    width: 40,
    height: 40,
  },
  itemText: {
    marginLeft: 24,
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  goPatrolButton: {
    width: 72,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#08ae3c",
    borderRadius: rpxToPx(8),
  },
  goPatrolText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightIcon: {
    width: 26,
    height: 26,
  },

  noDataContainer: {
    flex: 1,
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
    color: "#000",
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
    color: "#666",
  },
  // 底部按钮样式
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    width: screenWidth,
    height: 84,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    elevation: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  reportButton: {
    width: 344,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff1f1",
    borderWidth: 1,
    borderColor: "#ff3d3b",
    borderRadius: 8,
  },
  reportButtonText: {
    fontSize: 20,
    color: "#ff3d3b",
  },
});
