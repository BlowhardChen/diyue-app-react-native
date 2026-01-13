import {Dimensions, StyleSheet} from "react-native";

const {width, height} = Dimensions.get("window");
export const ContractManageScreenStyles = StyleSheet.create({
  contractList: {
    width: width,
    height: "100%",
    flexDirection: "column",
  },
  contractType: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width,
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  contractTypeItem: {
    width: 83,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  active: {
    backgroundColor: "#1ab850",
  },
  contractTypeText: {
    fontSize: 16,
  },
  activeText: {
    fontWeight: "500",
    color: "#fff",
  },
  contractTotal: {
    width: width,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ebffe4",
  },
  contractTotalText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  contractTotalNum: {
    fontWeight: "500",
    color: "#1ab850",
  },
  contractContent: {
    flex: 1,
    width: width,
    backgroundColor: "#f5f6f8",
  },
  contractContentItem: {
    width: width,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  itemTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 16,
  },
  itemTitleText: {
    width: 300,
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  itemTitleIcon: {
    width: 26,
    height: 26,
  },
  itemTitleIconImg: {
    width: 26,
    height: 26,
  },
  itemMsgText: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 5,
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
  },
  itemMsgLabel: {
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
  },
  itemMsgValue: {
    fontSize: 16,
    color: "#000",
  },
  itemOperate: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemOperateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
  },
  operateBtnImg: {
    width: 24,
    height: 24,
  },
  operateBtnText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "50%",
  },
  emptyImg: {
    width: 87,
    height: 79,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginTop: 10,
  },
  dividing: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});
