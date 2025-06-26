import {accountLogin} from "@/services/account";
import {useAuth} from "@/store/useAuth";
import {UserInfo} from "@/types/user";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

type RootStackParamList = {
  Main: undefined;
};

export const useLogin = () => {
  const {login} = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLoginFun = async (mobile: string, password: string) => {
    console.log("handleLoginFun>>>>");
    const data = await accountLogin({mobile, password});
    console.log("handleLoginFun", data);
    const {token, member} = data as unknown as {token: string; member: UserInfo};

    await login(token, member);

    // 跳转主页面（可选）
    navigation.reset({
      index: 0,
      routes: [{name: "Main"}],
    });
  };

  return {
    handleLoginFun,
  };
};
