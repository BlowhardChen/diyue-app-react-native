import {Global} from "@/styles/global";
import {Dimensions, StyleSheet} from "react-native";
import {Platform, StatusBar} from "react-native";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

export const FarmSupplieMallScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  navbar: {
    width: SCREEN_WIDTH,
    height: 88,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 44,
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 55,
  },
  tabItem: {
    width: 40,
    height: 40,
    marginHorizontal: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 20,
    color: "#fff",
  },
  activeText: {
    fontWeight: "500",
  },
  underline: {
    width: 45,
    height: 3,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  deviceContent: {
    position: "absolute",
    right: 16,
    bottom: 6,
    width: 36,
    height: 36,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  scrollView: {
    flex: 1,
    height: "88.5%",
  },
  waterfallContainer: {
    width: SCREEN_WIDTH,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  listColumn: {
    width: "96%",
  },
  waterfallItem: {
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  waterfallItemImage: {
    width: "100%",
    height: 140,
  },
  waterfallItemInfo: {
    padding: 10,
  },
  waterfallItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  priceText: {
    fontSize: 16,
    color: "#ff3d3b",
  },
  priceNum: {
    fontSize: 19,
  },
  unitText: {
    color: "#666",
    fontSize: 14,
  },
  orderBtn: {
    width: 42,
    height: 21,
    borderRadius: 24,
    backgroundColor: "#08ae3c",
    justifyContent: "center",
    alignItems: "center",
  },
  orderBtnText: {
    fontSize: 13,
    color: "#fff",
  },
  noDataContainer: {
    marginTop: "55%",
    justifyContent: "center",
    alignItems: "center",
  },
  noDataImage: {
    width: 86,
    height: 84,
  },
  noDataTips: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
  },
  farmDataContainer: {
    flex: 1,
    height: "88.5%",
  },
  farmDataScroll: {
    height: "80%",
    paddingBottom: 10,
  },
  waterfallItemNorms: {
    fontSize: 14,
    color: "rgba(0,0,0,0.65)",
    marginTop: 8,
  },

  operRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  operBtn: {
    width: 24,
    height: 24,
  },
  operIcon: {
    width: "100%",
    height: "100%",
  },
  quantityText: {
    marginHorizontal: 4,
    fontSize: 14,
    color: "#000",
  },

  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 72,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  totalInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  priceIcontext: {
    fontSize: 14,
    color: "#ff3d3b",
  },
  totalPrice: {
    fontSize: 22,
    color: "#ff3d3b",
  },
  viewCartBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewCartText: {
    fontSize: 14,
    color: "#08ae3c",
    marginRight: 4,
  },
  downIcon: {
    width: 14,
    height: 14,
  },
  payBtn: {
    width: 100,
    height: 40,
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 24,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  payBtnDisabled: {
    opacity: 0.5,
  },
  payBtnText: {
    color: "#fff",
    fontSize: 16,
  },
});
