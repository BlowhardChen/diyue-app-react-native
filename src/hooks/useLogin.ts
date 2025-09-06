import {accountLogin} from "@/services/account";
import {useAuth} from "@/stores/useAuth";
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
    const {data} = await accountLogin({mobile, password});
    const {token, member} = data as unknown as {token: string; member: UserInfo};
    await login(token, member);
    navigation.reset({
      index: 0,
      routes: [{name: "Main"}],
    });
  };

  return {
    handleLoginFun,
  };
};
