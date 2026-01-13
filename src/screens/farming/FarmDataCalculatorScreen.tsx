import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import {FarmStackParamList} from "@/types/navigation";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

const FarmDataCalculatorScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();

  return (
    <View style={styles.container}>
      <Text>Add Farm Screen</Text>
    </View>
  );
};

export default FarmDataCalculatorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
});
