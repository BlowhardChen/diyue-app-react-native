import React from "react";
import {StyleSheet, View} from "react-native";
import {WebView} from "react-native-webview";

const ServiceAgreement: React.FC = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{uri: "http://xtnf.com/dd_privacy_1.html"}}
        startInLoadingState={true} // 显示加载指示器
        style={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default ServiceAgreement;
