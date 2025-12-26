import {Dimensions, StyleSheet} from "react-native";

// 屏幕尺寸常量
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");
const rpx = SCREEN_WIDTH / 750; // 适配UniApp的rpx单位

export const ContractDetailScreenStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: "100%",
    backgroundColor: "#f5f6f8",
  },
  // Tab栏样式
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SCREEN_WIDTH,
    height: 66,
    paddingHorizontal: 8,
    backgroundColor: "#f5f6f8",
  },
  tabItem: {
    flex: 1,
    width: 180,
    height: 40,
    fontSize: 18,
    fontWeight: "500",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: 4,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 1.5,
  },
  tabItemSecond: {
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  tabItemActive: {
    color: "#fff",
    backgroundColor: "#1ab850",
  },
  tabText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  tabTextActive: {
    color: "#fff",
  },
  scrollView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 66,
    backgroundColor: "#f5f6f8",
  },
  basicInfoContainer: {
    width: SCREEN_WIDTH,
  },
  contentItem: {
    paddingTop: 16,
    paddingRight: 16,
    paddingLeft: 7,
    paddingBottom: 8,
    marginTop: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  contentItemFirst: {
    marginTop: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mark: {
    width: 4,
    height: 16,
    backgroundColor: "#1ab850",
    marginRight: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  informationBox: {
    marginTop: 8,
    paddingHorizontal: 6,
  },
  informationBoxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  //   noBorderBottom: {
  //     borderBottomWidth: 0,
  //   },
  informationText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
    width: 95,
  },
  informationInput: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  billInfoContainer: {
    width: SCREEN_WIDTH,
  },
  billTotal: {
    width: SCREEN_WIDTH,
    height: 38,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 38,
    color: "#000",
    textAlign: "center",
    backgroundColor: "#ebffe4",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  billTotalAmount: {
    fontWeight: "500",
    color: "#1ab850",
  },
  billItem: {
    marginTop: 8,
    elevation: 1,
  },
  billItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SCREEN_WIDTH,
    padding: 16,
    backgroundColor: "#fff",
  },
  billLeft: {
    fontSize: 16,
    color: "#000",
  },
  billMoneyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  billMoney: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  expandIcon: {
    width: 26,
    height: 26,
    marginLeft: 3,
  },
  expandIconRotated: {
    transform: [{rotate: "180deg"}],
  },
  billRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 68,
    height: 68,
    alignItems: "center",
  },
  payBtn: {
    width: 52,
    height: 28,
    fontSize: 16,
    fontWeight: "500",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    backgroundColor: "#08ae3c",
    borderRadius: 4,
  },
  payBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  successIcon: {
    width: 68,
    height: 68,
  },
  billExpand: {
    width: SCREEN_WIDTH,
    padding: 16,
    backgroundColor: "#f9f9f9",
    elevation: 1,
  },
  paymentTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
    marginRight: 4,
  },
  paymentText: {
    fontSize: 16,
    color: "#000",
  },
  paymentTextFail: {
    fontSize: 16,
    color: "#ff3d3b",
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1999,
  },
  popupContent: {
    width: 327,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    zIndex: 2000,
  },
  popupTitle: {
    width: 327,
    marginTop: 21,
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  popupMessage: {
    padding: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  popupMessageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    fontSize: 18,
    color: "#000",
  },
  popupMessageLabel: {
    fontSize: 18,
    color: "#000",
  },
  popupMessageText: {
    fontSize: 18,
    color: "#000",
  },
  popupMessageTextRed: {
    color: "#FF3D3B",
  },
  popupBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: 327,
    height: 51,
    borderTopWidth: 1,
    borderTopColor: "#ededed",
  },
  popupBtnLeft: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
  },
  popupBtnLeftText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  popupDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#ededed",
  },
  popupBtnRight: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
  },
  popupBtnRightText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#08ae3c",
    textAlign: "center",
  },
});
