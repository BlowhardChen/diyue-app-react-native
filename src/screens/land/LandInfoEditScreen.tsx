import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {observer} from "mobx-react-lite";
import {View, Text} from "react-native";

type LandInfoEditStackParamList = {
  LandInfoEdit: undefined;
};

const LandInfoEditScreen = observer(() => {
  const navigation = useNavigation<StackNavigationProp<LandInfoEditStackParamList>>();

  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text>信息编辑</Text>
    </View>
  );
});

export default LandInfoEditScreen;
