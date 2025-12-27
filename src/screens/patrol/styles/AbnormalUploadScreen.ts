// 屏幕尺寸
import {Global} from "@/styles/global";
import {StyleSheet, Dimensions} from "react-native";
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

export const AbnormalUploadScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    height: SCREEN_HEIGHT,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  abnormalCard: {
    padding: 16,
    paddingTop: 0,
    paddingLeft: 7,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7e7e7",
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7e7e7",
  },
  infoLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    minWidth: 50,
    position: "relative",
  },
  mustLabel: {
    marginTop: 8,
    paddingLeft: 9,
  },
  mustText: {
    position: "absolute",
    top: 8,
    left: 0,
    fontSize: 18,
    color: "#ff4d4f",
    fontWeight: "400",
  },
  abnormalList: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 8,
  },
  abnormalItem: {
    width: 110,
    height: 36,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f6f6f6",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  abnormalItemActive: {
    backgroundColor: "#fff1f0",
  },
  abnormalItemText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "400",
  },
  abnormalItemTextActive: {
    color: "#ff4d4f",
  },
  checkedIcon: {
    width: 14,
    height: 14,
    position: "absolute",
    top: 0,
    right: 0,
  },
  // 其他输入框
  otherInputContainer: {
    width: 236,
    height: 44,
    paddingHorizontal: 10,
    backgroundColor: "#f6f6f6",
    borderRadius: 4,
    justifyContent: "center",
    marginBottom: 8,
  },
  otherInput: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    fontSize: 18,
    color: "#000",
  },
  // 标记位置
  markPositionContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 8,
  },
  markPositionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  redText: {
    color: "#ff4d4f",
  },
  grayText: {
    color: "#999",
  },
  rightIcon: {
    width: 13,
    height: 13,
  },
  // 图片列表
  imgListBox: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 8,
  },
  imgList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imgListItem: {
    width: 64,
    height: 64,
    marginRight: 8,
    marginBottom: 8,
    position: "relative",
  },
  imgItemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  imgCloseBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 10,
    height: 10,
  },
  uploadBtn: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  uploadImg: {
    width: "100%",
    height: "100%",
  },
  commentContainer: {
    width: "100%",
    minHeight: 84,
    padding: 10,
    marginTop: 8,
    backgroundColor: "#f6f6f6",
    borderRadius: 4,
    marginLeft: 8,
  },
  commentInput: {
    width: "100%",
    minHeight: 84,
    fontSize: 18,
    color: "#000",
    textAlignVertical: "top",
  },
  buttonBox: {
    alignItems: "center",
    justifyContent: "center",
    width: SCREEN_WIDTH,
    height: 84,
    backgroundColor: "#fff",
    elevation: 2,
  },
  saveButton: {
    width: 344,
    height: 52,
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
});
