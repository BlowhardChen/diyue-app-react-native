import {StyleSheet} from "react-native";

export const ElectronicContractScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  headerIcon: {
    minWidth: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  titleBtn: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 38,
    color: "#08ae3c",
  },
  contractContent: {
    flex: 1,
    height: 741.5,
    paddingHorizontal: 19,
  },
  contractTitle: {
    marginVertical: 19,
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    color: "#000",
  },
  contractContentItem: {
    marginBottom: 10,
  },
  contractContentItemRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  contentText: {
    fontSize: 15,
    color: "#000",
  },
  partA: {
    minWidth: 120,
    marginLeft: 5,
  },
  undeline: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    textAlign: "center",
  },
  undelineText: {
    fontSize: 15,
    color: "#000",
  },
  input: {
    minWidth: 90,
  },
  listItem: {
    marginBottom: 5,
    paddingLeft: 5,
  },
  contractContentSign: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signPartA: {
    flexDirection: "column",
  },
  signPartB: {
    flexDirection: "column",
  },
  signItem: {
    flexDirection: "row",
    marginBottom: 7.5,
    alignItems: "center",
  },
  sign: {
    minWidth: 30,
  },
});
