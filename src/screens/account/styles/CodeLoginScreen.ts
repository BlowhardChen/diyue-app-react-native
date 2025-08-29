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
    marginBottom: 16,
  },
  phone: {
    fontSize: 18,
    color: "#333",
    marginBottom: 60,
  },
  codeInputContainer: {
    marginBottom: 24,
    position: "relative",
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  codeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  codeDigit: {
    width: 44,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  codeDigitFocused: {
    borderColor: "#08AE3C",
  },
  codeDigitText: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000",
  },
  resendButton: {
    fontSize: 22,
    color: "#08AE3C",
    textAlign: "center",
    marginTop: 24,
  },
  countdownText: {
    fontSize: 22,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
  },
});
