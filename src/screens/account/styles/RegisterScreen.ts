import {Global} from "@/styles/global";
import {StyleSheet} from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backButton: {
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
    color: Global.colors.textDark,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 80,
  },
  titleContainer: {
    position: "relative",
    marginBottom: 40,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Global.colors.textDark,
  },
  titleUnderline: {
    position: "absolute",
    bottom: -4,
    left: 0,
    minWidth: 112,
    height: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 24,
    backgroundColor: "#f4f4f6",
    borderRadius: 8,
  },
  inputIcon: {
    width: 32,
    height: 32,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 8,
    fontSize: 22,
    fontWeight: "500",
    color: Global.colors.textDark,
  },
  button: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#fefefe",
  },
  toastContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
  },
  toastIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  toastText: {
    fontSize: 14,
    color: "#fff",
  },
});
