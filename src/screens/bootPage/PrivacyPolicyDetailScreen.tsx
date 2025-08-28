// 隐私政策页面
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
      <CustomStatusBar navTitle="隐私政策" onBack={() => navigation.goBack()} />
      <WebView source={{uri: "http://xtnf.com/dd_privacy_1.html"}} startInLoadingState={true} style={styles.container} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default ServiceAgreement;
