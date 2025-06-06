import {Global} from "@/styles/global";
import {Platform, StatusBar, StyleSheet} from "react-native";
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
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
    color: "#000",
    fontWeight: "600",
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
    fontWeight: "400",
    color: "#333",
  },
  inputBox: {
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: "center",
  },
  passwordFormItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  formInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 8,
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  iconRight: {
    flexDirection: "row",
    width: 80,
    justifyContent: "flex-end",
  },
  iconButton: {
    padding: 8,
  },
  tips: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999",
    alignSelf: "flex-start",
    marginTop: 8,
  },
  submitButton: {
    width: "100%",
    height: 52,
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#fefefe",
  },
  agreementContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 24,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  agreementText: {
    fontSize: 12,
    color: "#666",
  },
});
