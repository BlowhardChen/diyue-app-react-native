import {View, Text, StyleSheet} from "react-native";

const Title = ({title}: {title: string}) => {
  return (
    <View style={styles.container}>
      <View style={styles.mark} />
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

export default Title;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mark: {
    width: 4,
    height: 18,
    backgroundColor: "#3CB371",
    marginRight: 6,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});
