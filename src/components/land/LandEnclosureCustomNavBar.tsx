import React, {useCallback} from "react";
import {View, Image, Text, StyleSheet, TouchableOpacity, Platform, StatusBar} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation, useRoute} from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import {observer} from "mobx-react-lite";
import {deviceStore} from "@/stores/deviceStore";
import {saveTargetRoute} from "@/utils/navigationUtils";

interface Props {
  navTitle?: string;
  showRightIcon?: boolean;
  onBackView?: () => void;
}

const deviceConnected = require("@/assets/images/common/icon-device-connect.png");
const deviceDisconnected = require("@/assets/images/common/icon-device-disconnect.png");

const LandEnclosureCustomNavBar: React.FC<Props> = observer(({navTitle = "", showRightIcon = true, onBackView}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const handleBack = useCallback(() => {
    onBackView?.() ?? navigation.goBack();
  }, [navigation, onBackView]);

  const handleConnectDevice = useCallback(() => {
    console.log("当前路由:", route.name);
    saveTargetRoute(route.name, ["Main", ""], {...route.params});
    navigation.navigate("AddDevice" as never);
  }, [navigation]);

  return (
    <LinearGradient style={[styles.container, {paddingTop: insets.top}]} colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconWrapper} onPress={handleBack}>
          <Image source={require("@/assets/images/common/icon-back-radius.png")} style={styles.iconImage} />
        </TouchableOpacity>

        <Text style={styles.title}>{navTitle}</Text>

        {showRightIcon ? (
          <TouchableOpacity style={styles.iconWrapper} onPress={handleConnectDevice}>
            <Image source={deviceStore.status === "2" ? deviceDisconnected : deviceConnected} style={styles.iconImage} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconWrapper} />
        )}
      </View>
    </LinearGradient>
  );
});

export default LandEnclosureCustomNavBar;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 999,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: Platform.OS === "ios" ? 44 : 56,
  },
  title: {
    fontSize: 20,
    color: "#fff",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
});
