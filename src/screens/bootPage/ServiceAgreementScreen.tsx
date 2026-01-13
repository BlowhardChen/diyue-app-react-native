// 服务协议页面
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import React from "react";
import {StyleSheet, View} from "react-native";
import {WebView} from "react-native-webview";

type RootStackParamList = {
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

const ServiceAgreement: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <CustomStatusBar navTitle="服务协议" onBack={() => navigation.goBack()} />
      <WebView source={{uri: "http://xtnf.com/dd_agreement_1.html"}} startInLoadingState={true} style={styles.container} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default ServiceAgreement;
