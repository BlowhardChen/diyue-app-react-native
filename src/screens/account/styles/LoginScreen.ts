import {Global} from "@/styles/global";
import {Platform, StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 51 : 60,
  },
  logo: {
    width: 100,
    height: 135,
  },
  loginBox: {
    paddingHorizontal: 24,
    marginTop: 60,
  },
  loginTitle: {
    position: "relative",
    height: 32,
  },
  loginTitleText: {
    position: "relative",
    fontSize: 28,
    fontWeight: "500",
    color: Global.colors.textDark,
    zIndex: 1,
  },
  loginTitleBg: {
    position: "absolute",
    bottom: -8,
    left: 0,
    zIndex: -1,
    minWidth: 112,
    height: 14,
  },
  passwordForm: {
    marginTop: 36,
  },
  codeForm: {
    marginTop: 24,
  },
  inputItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 22,
    backgroundColor: "#f4f4f6",
    borderRadius: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 32,
    height: 32,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    fontSize: 22,
    fontWeight: "400",
    color: Global.colors.textDark,
  },
  clearIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 80,
  },
  eyeIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  operateLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500",
    color: Global.colors.primary,
  },
  loginButton: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderRadius: 8,
  },
  loginButtonActive: {
    backgroundColor: Global.colors.primary,
  },
  loginButtonInactive: {
    backgroundColor: "rgba(8, 174, 60, 0.5)",
  },
  loginButtonText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#fefefe",
  },
  switchLoginType: {
    marginTop: 32,
  },
  switchLoginTypeText: {
    fontSize: 22,
    fontWeight: "500",
    color: Global.colors.primary,
    textAlign: "center",
  },
  fixedBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "#fff", // 添加背景色防止透明
    zIndex: 10,
    elevation: 10, // Android 专用，确保在最上层
  },
  bottomBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 160,
    zIndex: 1,
  },
  agreementContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 2,
  },
  checkboxContainer: {
    marginRight: 5,
  },
  checkboxIcon: {
    width: 26,
    height: 26,
  },
  agreementText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "700",
  },
  agreementLink: {
    fontSize: 14,
    color: Global.colors.primary,
    fontWeight: "600",
  },
});
