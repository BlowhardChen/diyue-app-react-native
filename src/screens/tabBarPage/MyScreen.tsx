import React, {useEffect, useState, useCallback} from "react";
import {View, Text, Image, TouchableOpacity, FlatList, StatusBar, SafeAreaView, ImageBackground, Platform} from "react-native";
import {useNavigation, useFocusEffect} from "@react-navigation/native";
import {getUserInfo} from "@/services/account";
import {styles} from "./styles/MyScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {useStatusBar} from "@/hooks/useStatusBar";

interface UserInfo {
  avatar: string;
  nickName: string;
  userName: string;
  attestationStatus: "1" | "0";
  agrimensorAcreageNum: number;
  acreageNum: number;
  workAreaNum: number;
  obligationNum: number;
  servicesNum: number;
  finishNum: number;
  cancelNum: number;
}

interface OrderItem {
  iconUrl: any;
  iconName: string;
  type: string;
  badge: number;
}

interface MangeItem {
  iconUrl: any;
  iconName: string;
  url: string;
}

type RootStackParamList = {
  Main: undefined;
  AccountSetting: undefined;
};

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  useStatusBar("light-content", "transparent");

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

  const mangeList: MangeItem[] = [
    {iconUrl: require("../../assets/images/my/icon-contract.png"), iconName: "合同管理", url: "ContractList"},
    {iconUrl: require("../../assets/images/my/icon-team.png"), iconName: "团队管理", url: "TeamManage"},
    {iconUrl: require("../../assets/images/my/icon-kf.png"), iconName: "客服电话", url: ""},
    {iconUrl: require("../../assets/images/my/icon-land.png"), iconName: "我的地块", url: "MyLand"},
    {
      iconUrl: require("../../assets/images/my/icon-account.png"),
      iconName: "我的账户",
      url: "",
    },
    {
      iconUrl: require("../../assets/images/my/icon-user.png"),
      iconName: "农户信息",
      url: "",
    },
  ];

  const fetchUserInfo = async () => {
    try {
      // const data = await getUserInfo();
      // console.log("data", data);
      // setUserInfo(data);
      setOrdersList([
        {iconUrl: require("../../assets/images/my/icon-pay.png"), iconName: "待付款", type: "1", badge: 1},
        {iconUrl: require("../../assets/images/my/icon-people.png"), iconName: "待服务", type: "2", badge: 99},
        {iconUrl: require("../../assets/images/my/icon-success.png"), iconName: "已完成", type: "3", badge: 133},
        {iconUrl: require("../../assets/images/my/icon-cancel.png"), iconName: "已取消", type: "4", badge: 44},
      ]);
    } catch (err) {
      console.warn("获取失败", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, []),
  );

  function handleSetting() {
    navigation.navigate("AccountSetting");
  }

  function viewPersonInfo() {
    // nav.navigate("PersonalInfo");
  }

  function oepnAuth() {
    if (userInfo?.attestationStatus === "1") return;
    // setAuthVisible(true);
  }

  function viewMoreOrder() {
    // nav.navigate("HostedOrder");
  }

  function handleOrder(item: OrderItem) {
    // nav.navigate("HostedOrder", {type: item.type});
  }

  function handleManage(item: MangeItem) {}

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require("../../assets/images/my/my-bg.png")} style={styles.topBg} resizeMode="cover">
        <TouchableOpacity style={styles.topIcon} onPress={handleSetting}>
          <Image source={require("../../assets/images/my/icon-setting.png")} style={styles.iconImg} />
        </TouchableOpacity>
        {/* 占位高度，避免内容上移 */}
        <View style={{height: STATUS_BAR_HEIGHT + 40}} />

        <View style={styles.userInfoRow}>
          <TouchableOpacity onPress={viewPersonInfo} style={styles.avatarContainer}>
            <Image
              source={userInfo?.avatar ? {uri: userInfo.avatar} : require("../../assets/images/my/icon-avatar.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.msgContainer}>
            <Text style={styles.name}>{userInfo?.nickName ?? "张三"}</Text>
            <View style={styles.phoneAuthRow}>
              <View style={styles.phoneRow}>
                <Image source={require("../../assets/images/my/icon-phone.png")} style={styles.phoneIcon} />
                <Text style={styles.phoneText}>{userInfo?.userName ?? 13728732637}</Text>
              </View>
              <TouchableOpacity
                style={[styles.authBtn, userInfo?.attestationStatus === "1" ? styles.authDone : styles.authPending]}
                onPress={oepnAuth}>
                <Text style={userInfo?.attestationStatus === "1" ? styles.authDoneText : styles.authPendingText}>
                  {userInfo?.attestationStatus === "1" ? "已认证" : "未认证"}
                </Text>
                <Image
                  source={
                    userInfo?.attestationStatus === "1"
                      ? require("../../assets/images/my/icon-right-green.png")
                      : require("../../assets/images/my/icon-right-red.png")
                  }
                  style={styles.authIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.dataRow}>
          {[
            {
              num: userInfo?.agrimensorAcreageNum ?? 20000.78,
              label: "测量面积(亩)",
            },
            {num: userInfo?.acreageNum ?? 20000.78, label: "管理面积(亩)"},
            {num: userInfo?.workAreaNum ?? 20000.78, label: "作业面积(亩)"},
          ].map((d, i) => (
            <View key={i} style={styles.dataItem}>
              <Text style={styles.dataNum}>{d.num}</Text>
              <Text style={styles.dataLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </ImageBackground>

      <View style={styles.hostedOrdersBox}>
        <View style={styles.hostedOrdersTop}>
          <Text style={styles.orderTitle}>托管订单</Text>
          <TouchableOpacity style={styles.orderMore} onPress={viewMoreOrder}>
            <Text style={styles.orderMoreText}>查看更多</Text>
            <Image source={require("../../assets/images/my/icon-right.png")} style={styles.iconSmall} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={ordersList}
          horizontal
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.orderList}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => handleOrder(item)} style={styles.orderItem}>
              <View style={styles.ordersItemIcon}>
                <Image source={item.iconUrl} style={styles.orderIcon} />
              </View>
              <Text style={styles.orderName}>{item.iconName}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.manageList}>
        {mangeList.map((item, i) => (
          <TouchableOpacity key={i} style={styles.mangeItem} onPress={() => handleManage(item)}>
            <Image source={item.iconUrl} style={styles.mangeIcon} />
            <Text style={styles.mangeText}>{item.iconName}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default MyScreen;
