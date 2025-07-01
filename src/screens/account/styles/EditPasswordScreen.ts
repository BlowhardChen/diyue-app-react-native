import {StyleSheet} from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  backText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000",
  },
  phone: {
    marginTop: 16,
    fontSize: 18,
    color: "#333",
  },
  inputBox: {
    paddingHorizontal: 24,
    marginTop: 48,
    alignItems: "center",
  },
  inputItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 52,
    paddingHorizontal: 12,
    marginBottom: 24,
    backgroundColor: "#f4f4f6",
    borderRadius: 8,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#000",
  },
  tips: {
    fontSize: 18,
    color: "#999",
  },
  btn: {
    width: "100%",
    height: 52,
    marginTop: 40,
    backgroundColor: "#08ae3c",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
});
