import {Global} from "@/styles/global";
import {StyleSheet} from "react-native";
export const styles = StyleSheet.create({
  background: {flex: 1, width: "100%", height: "100%"},
  dialogBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  content: {marginTop: 10},
  contentText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "left",
  },
  link: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  btnBox: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  btn: {
    width: "90%",
    height: 44,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  disbtn: {
    height: 34,
  },
  agreeBtn: {
    backgroundColor: Global.colors.primary,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "500",
    color: Global.colors.textGray,
  },
  agreeBtnText: {
    color: "#fff",
  },
});
