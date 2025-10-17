import {StyleSheet} from "react-native";
export const LandListItemStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16 / 2,
  },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 32 / 2,
    backgroundColor: "#fff",
  },
  msgImg: {
    width: 124 / 2,
    height: 124 / 2,
    borderRadius: 8 / 2,
    overflow: "hidden",
  },
  msgImgImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8 / 2,
  },
  msgLand: {
    flex: 1,
    marginLeft: 24 / 2,
  },
  msgLandTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 40 / 2,
    fontWeight: "500",
    color: "#000",
  },
  area: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaText: {
    marginRight: 5 / 2,
    fontSize: 40 / 2,
    fontWeight: "500",
    color: "#08ae3c",
  },
  rightIcon: {
    width: 52 / 2,
    height: 52 / 2,
    marginLeft: 2,
  },
  msgLandPosition: {
    flexDirection: "row",
    marginTop: 12 / 2,
    fontSize: 32 / 2,
    color: "#666",
  },
  posTitle: {
    width: 84 / 2,
  },
  posMsg: {
    flex: 1,
  },
  landBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 88 / 2,
    fontSize: 32 / 2,
    fontWeight: "500",
    color: "#08ae3c",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  expandIcon: {
    width: 32 / 2,
    height: 32 / 2,
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
    height: 188 / 2,
    padding: 32 / 2,
    borderBottomWidth: 1,
    borderBottomColor: "#dbdbdb",
  },
  highlight: {
    color: "#08ae3c",
  },
});
