import {Global} from "@/styles/global";
import {StyleSheet} from "react-native";
export const LandListItemStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
  },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  checkIcon: {
    width: 26,
    height: 26,
  },
  msgImg: {
    width: 62,
    height: 62,
    borderRadius: 4,
    overflow: "hidden",
  },
  msgImgImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  msgLand: {
    flex: 1,
    marginLeft: 12,
  },
  msgLandTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    maxWidth: 180,
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  area: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaText: {
    marginRight: 5 / 2,
    fontSize: 20,
    fontWeight: "500",
    color: Global.colors.primary,
  },
  rightIcon: {
    width: 26,
    height: 26,
    marginLeft: 2,
  },
  msgLandPosition: {
    flexDirection: "row",
    marginTop: 6,
    fontSize: 16,
    color: "#666",
  },
  posTitle: {
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
  },
  posMsg: {
    flex: 1,
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
  },
  landBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 44,
    fontSize: 16,
    fontWeight: "500",
    color: Global.colors.primary,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  expandIcon: {
    width: 16,
    height: 16,
    marginLeft: 3 / 2,
  },
  landMore: {
    width: "100%",
    maxHeight: 752 / 2,
    backgroundColor: "#f4f4f4",
  },
  landMoreItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 94,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dbdbdb",
  },
  highlight: {
    color: Global.colors.primary,
  },
});
