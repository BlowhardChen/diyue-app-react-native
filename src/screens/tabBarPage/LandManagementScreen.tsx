import LandHomeCustomNavbar from "@/components/land/LandHomeCustomNavbar";
import {View, Text, StyleSheet} from "react-native";

const HomeScreen = () => {
  // 切换tab
  const changeTab = (title: string, type: string) => {
    console.log(title, type);
  };
  return (
    <View style={styles.container}>
      <LandHomeCustomNavbar onChangeTab={changeTab} />
      <Text style={styles.text}>Welcome to the Home Screen!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HomeScreen;
