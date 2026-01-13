// 电子合同
import React, {useState, useEffect} from "react";
import {View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView} from "react-native";
import {ElectronicContractScreenStyles} from "./styles/ElectronicContractScreen";
import {ContractListItemType} from "@/types/contract";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {Global} from "@/styles/global";

const ElectronicContractScreen: React.FC<{route: any; navigation: any}> = ({route, navigation}) => {
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [startTime, setStartTime] = useState<string[]>([]);
  const [endTime, setEndTime] = useState<string[]>([]);

  // 转换地块坐标为json字符串
  const convertCoordinates = (coordinates: {lat: number; lng: number}[]) => {
    if (!coordinates || coordinates.length === 0) return "";
    return coordinates.map(item => `${item.lat},${item.lng}`).join(";");
  };

  // 获取合同详情
  const getLandContractDetail = (contractInfo: ContractListItemType) => {
    try {
      const data = contractInfo;
      console.log("获取地块合同信息", data);
      setContractInfo(data);

      // 处理时间分割
      if (data?.startTime) {
        setStartTime(data.startTime.split("-"));
      }
      if (data?.endTime) {
        setEndTime(data.endTime.split("-"));
      }
    } catch (e) {
      console.error("解析合同信息失败", e);
    }
  };

  useEffect(() => {
    if (route?.params) {
      const {contractInfo, page} = route.params;
      if (contractInfo) {
        getLandContractDetail(contractInfo);
      }
    }
  }, [route?.params]);

  return (
    <SafeAreaView style={ElectronicContractScreenStyles.container}>
      {/* 头部区域 */}
      <CustomStatusBar
        navTitle="电子合同详情.pdf"
        onBack={() => navigation.goBack()}
        rightTitle="下载"
        rightBtnColor={{color: Global.colors.primary, fontSize: 16, fontWeight: "500"}}
      />

      {/* 合同内容区域 */}
      <ScrollView style={ElectronicContractScreenStyles.contractContent} showsVerticalScrollIndicator={false}>
        {/* 合同标题 */}
        <Text style={ElectronicContractScreenStyles.contractTitle}>农村土地流转合同</Text>

        {/* 甲方信息 */}
        <View style={ElectronicContractScreenStyles.contractContentItemRow}>
          <Text style={ElectronicContractScreenStyles.contentText}>甲方：（出租方）</Text>
          <View style={[ElectronicContractScreenStyles.partA, ElectronicContractScreenStyles.undeline]}>
            <Text style={ElectronicContractScreenStyles.undelineText}>{contractInfo?.relename || ""}</Text>
          </View>
        </View>

        {/* 乙方信息 */}
        <View style={ElectronicContractScreenStyles.contractContentItemRow}>
          <Text style={ElectronicContractScreenStyles.contentText}>乙方：（承租方）</Text>
          <Text style={ElectronicContractScreenStyles.contentText}>单县地约农业服务有限公司</Text>
        </View>

        {/* 合同正文第一条 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            为了发展高效农业，经双方共同协商，甲乙双方本着平等、自愿、有偿的原则，就土地承包经营权租赁事宜，订立本合同。
          </Text>
        </View>

        {/* 一、承包土地信息 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <View style={ElectronicContractScreenStyles.contractContentItemRow}>
            <Text>一、承包 </Text>
            <View style={ElectronicContractScreenStyles.undeline}>
              <Text style={[ElectronicContractScreenStyles.input]}>{contractInfo?.relename || ""}</Text>{" "}
            </View>
            <Text>土地面积共为</Text>
            <Text style={[ElectronicContractScreenStyles.input, ElectronicContractScreenStyles.undeline]}>
              {contractInfo?.actualAcreNum || ""}
            </Text>
            <Text>亩，四至界限为（空间地理坐标为</Text>
            <Text style={[ElectronicContractScreenStyles.input, ElectronicContractScreenStyles.undeline]}>
              {convertCoordinates(contractInfo?.gpsList || [])}
            </Text>
            <Text>）。</Text>
          </View>
        </View>

        {/* 二、租赁期限 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <View style={ElectronicContractScreenStyles.contractContentItemRow}>
            <Text>二、租赁期限：土地租赁期限为</Text>
            <Text style={[ElectronicContractScreenStyles.input, ElectronicContractScreenStyles.undeline]}>
              {contractInfo?.termOfLease || ""}
            </Text>
            <Text> 年，自</Text>
            <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
              {startTime[0] || ""}{" "}
            </Text>
            <Text> 年</Text>
            <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
              {startTime[1] || ""}{" "}
            </Text>
            <Text>月</Text>
            <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
              {startTime[2] || ""}
            </Text>
            <Text>日至 </Text>
            <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
              {endTime[0] || ""}{" "}
            </Text>
            <Text>年</Text>
            <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>{endTime[1] || ""}</Text>
            <Text>月</Text>
            <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>{endTime[2] || ""}</Text>
            <Text>日。</Text>
          </View>
        </View>

        {/* 三、租赁价格及付款方式 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <View style={ElectronicContractScreenStyles.contractContentItemRow}>
            <Text>三、租赁价格及付款方式：每亩每年租金为</Text>
            <Text style={[ElectronicContractScreenStyles.input, ElectronicContractScreenStyles.undeline]}>
              {contractInfo?.perAcreAmount || ""}
            </Text>
            <Text>元，合同期内租金每{contractInfo?.paymentMethod || ""}租金，第一次付款为麦收前支付全年租金的一半（即</Text>
            <Text style={[ElectronicContractScreenStyles.input, ElectronicContractScreenStyles.undeline]}>
              {contractInfo?.paymentAmount || ""}
            </Text>
            <Text>元）；第二次付款为玉米收割前付清本年全部余款（即</Text>
            <Text style={[ElectronicContractScreenStyles.input, ElectronicContractScreenStyles.undeline]}>
              {contractInfo?.paymentAmount || ""}
            </Text>
            <Text> 元）。</Text>
          </View>
        </View>

        {/* 四、土地使用权 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            四、合同生效后，甲方既失去土地使用权，同时不能干涉乙方对该土地的正常生产经营行为。本公司接管土地后种植小麦、玉米、花生、大豆等农产品。
          </Text>
        </View>

        {/* 五、甲方义务 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            五、甲方必须对乙方生产经营活动提供优良投资环境和社会治安环境，并提供必要的便利，在乙方的生产中甲方不能以任何借口阻挠。
            乙方有权无偿使用村组内的水渠、道路、用电等公共设施。在承包期内乙方有权转让土地使用权
          </Text>
        </View>

        {/* 六、土地征用补偿 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            六、流转土地在国家或集体使用该土地时，乙方应服从且有权获得相应的补偿和投入建设的地面附属物补偿费，地下矿产、石油归甲方。
          </Text>
        </View>

        {/* 七、合同解除终止条件 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>七、有以下情况之一的，本合同可以解除或终止： </Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>1.经双方当事人协商一致，可以解除本合同。 </Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>2.订立的合同依据国家政策发生重大变化 </Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>3.一方违约，使合同无法履行的。 </Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>4.乙方经济状况显著恶化，有证据表明合同无法履行的。</Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            5.合同期内，如因国家和政府农业基础设施占用或征用该土地时，本合同自行终止，甲乙双方不负违约责任。
          </Text>
        </View>

        {/* 八、违约责任 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>八、违约责任</Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            1、乙方对应付的租赁费不能以任何理由拖欠，如果发生拖欠行为，甲方有权收回土地。
          </Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            2、因变更或解除本合同使一方造成损失的，除依法可免除责任外，由责任方负责赔偿。{" "}
          </Text>
        </View>
        <View style={ElectronicContractScreenStyles.listItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            3、甲方非法干预乙方生产经营活动，给乙方造成损失的应给与赔偿，情节严重的将依法处理。
          </Text>
        </View>

        {/* 九、合同期满 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            九、合同期满后，若甲方继续流转该土地的使用权，乙方有优先承包的权利，若不继续流转，乙方对土地附属物享有处理的权利。
          </Text>
        </View>

        {/* 补充协议说明 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            本合同如遇法律、法规和现行农业政策相抵触的未尽事宜，经双方协商一致后可签订补充协议，与本合同有同等法律效力。
          </Text>
        </View>

        {/* 十、合同份数 */}
        <View style={ElectronicContractScreenStyles.contractContentItem}>
          <Text style={ElectronicContractScreenStyles.contentText}>
            十、本合同一式三份，甲乙双方,村组各执一份，双方签字后生效。
          </Text>
        </View>

        {/* 签字区域 */}
        <View style={ElectronicContractScreenStyles.contractContentSign}>
          {/* 甲方签字 */}
          <View style={ElectronicContractScreenStyles.signPartA}>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>甲方：</Text>
              <Text style={ElectronicContractScreenStyles.contentText}>{contractInfo?.relename || ""}</Text>
            </View>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>手机号：</Text>
              <Text style={ElectronicContractScreenStyles.contentText}>{contractInfo?.mobile || ""}</Text>
            </View>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>身份证号：</Text>
              <Text style={ElectronicContractScreenStyles.contentText}>{contractInfo?.cardid || ""}</Text>
            </View>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>
                <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
                  {startTime[0] || ""}{" "}
                </Text>
                <Text>年</Text>
                <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
                  {startTime[1] || ""}
                </Text>
                <Text>月</Text>
                <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
                  {startTime[2] || ""}{" "}
                </Text>
                <Text>日</Text>
              </Text>
            </View>
          </View>

          {/* 乙方签字 */}
          <View style={ElectronicContractScreenStyles.signPartB}>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>乙方：</Text>
              <Text style={ElectronicContractScreenStyles.contentText}>单县地约农业服务公司</Text>
            </View>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>地址：</Text>
              <Text style={ElectronicContractScreenStyles.contentText}>单县财富广场B41号</Text>
            </View>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>电话：</Text>
              <Text style={ElectronicContractScreenStyles.contentText}>0530-4466660</Text>
            </View>
            <View style={ElectronicContractScreenStyles.signItem}>
              <Text style={ElectronicContractScreenStyles.contentText}>
                <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
                  {startTime[0] || ""}
                </Text>
                <Text>年</Text>
                <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
                  {startTime[1] || ""}
                </Text>{" "}
                <Text>月</Text>
                <Text style={[ElectronicContractScreenStyles.sign, ElectronicContractScreenStyles.undeline]}>
                  {startTime[2] || ""}
                </Text>
                <Text>日</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElectronicContractScreen;
