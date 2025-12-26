import {StyleSheet} from "react-native";
export const LandListModelStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f6f8",
  },
  topSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 81,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    height: 48,
    paddingLeft: 11,
    marginRight: 16,
    backgroundColor: "#eff2f3",
    borderRadius: 4,
  },
  searchIcon: {
    width: 26,
    height: 26,
  },
  searchInput: {
    marginLeft: 11,
    fontSize: 18,
    fontWeight: "400",
    flex: 1,
    color: "#000",
  },
  screen: {
    alignItems: "center",
    justifyContent: "center",
  },
  screenIcon: {
    width: 26,
    height: 26,
  },
  screenText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  landMsg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 38,
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    backgroundColor: "#ebffe4",
  },
  highlight: {
    color: "#08ae3c",
    fontWeight: "400",
  },
  landList: {
    width: "100%",
    flex: 1,
  },
  landListBox: {
    flexGrow: 1,
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
});
