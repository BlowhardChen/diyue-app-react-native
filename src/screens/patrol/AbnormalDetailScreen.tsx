// 异常详情
import React, {useState, useEffect} from "react";
import {View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import ImageView from "react-native-image-viewing";
import {PatrolParamList} from "@/types/navigation";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {patrolTaskExceptionDetail} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";
import {Global} from "@/styles/global";

// 获取屏幕尺寸
const {height: SCREEN_HEIGHT} = Dimensions.get("window");

// 定义参数类型
interface RouteParams {
  id?: string;
  taskLogId?: string;
}

const AbnormalDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<PatrolParamList>>();
  const route = useRoute();
  const {id, taskLogId} = route.params as RouteParams;

  // 状态管理
  const [abnormalDetailInfo, setAbnormalDetailInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // 返回上一页
  const backView = (): void => {
    navigation.goBack();
  };

  // 查看标记位置
  const viewMarkPosition = (): void => {
    if (abnormalDetailInfo?.id) {
      navigation.navigate("MarkPosition", {
        type: "Detail",
        taskLogId,
        markPoints: abnormalDetailInfo.exceptionGpsList.map((item: any) => ({
          lat: item.lat,
          lon: item.lng,
        })),
        abnormalReport: abnormalDetailInfo.exceptionReportList.map((item: any) => item.dictLabel),
      });
    }
  };

  // 预览图片
  const previewImage = (item: any, index: number): void => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  // 格式化异常情况
  const formatAbnormal = (abnormals: any[]): string => {
    if (!abnormals || abnormals.length === 0) return "";
    return abnormals.map(item => item.dictLabel).join("、");
  };

  // 获取异常详情
  const getAbnormalDetail = async (id?: string, taskLogId?: string): Promise<void> => {
    try {
      setLoading(true);
      const {data} = id ? await patrolTaskExceptionDetail({id}) : await patrolTaskExceptionDetail({taskLogId});
      console.log("获取异常详情成功:", data);
      setAbnormalDetailInfo(data[0] || {});
    } catch (error) {
      showCustomToast("error", "获取异常详情失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("AbnormalDetailScreen mounted with id:", id);
    if (id) {
      getAbnormalDetail(id);
    }
    if (taskLogId) {
      getAbnormalDetail(taskLogId);
    }
  }, [id, taskLogId]);

  // 处理图片预览数据源
  const images =
    abnormalDetailInfo?.exceptionImageList?.map((item: any) => ({
      uri: item.url,
    })) || [];

  // 加载中视图
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Global.colors.primary} />
        <Text style={styles.loadingText}>正在加载详情...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 导航栏组件 */}
      <CustomStatusBar navTitle="异常详情" onBack={backView} />

      {/* 滚动容器 */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* 异常信息 */}
        <View style={styles.recordInfo}>
          <View style={styles.titleContainer}>
            <View style={styles.mark} />
            <Text style={styles.titleText}>异常信息</Text>
          </View>

          <View style={styles.informationBox}>
            {/* 异常汇报 */}
            <View style={[styles.informationBoxItem, styles.borderBottom]}>
              <Text style={styles.informationText}>异常汇报</Text>
              <Text style={[styles.infoValue, styles.abnormalText]}>
                {formatAbnormal(abnormalDetailInfo?.exceptionReportList)}
              </Text>
            </View>

            {/* 标记位置 */}
            <TouchableOpacity
              style={[styles.informationBoxItem, styles.borderBottom, styles.markPositionItem]}
              onPress={viewMarkPosition}
              activeOpacity={0.9}>
              <Text style={styles.informationText}>标记位置</Text>
              <View style={styles.markPositionContent}>
                <Text style={styles.infoValue}>
                  已标记
                  <Text style={styles.abnormalText}>{abnormalDetailInfo?.exceptionGpsList?.length || 0}</Text>
                  个点
                </Text>
                <Image source={require("@/assets/images/common/icon-right.png")} style={styles.rightIcon} resizeMode="contain" />
              </View>
            </TouchableOpacity>

            {/* 现场照片 */}
            <View style={[styles.informationBoxItem, styles.borderBottom]}>
              <Text style={styles.informationText}>现场照片</Text>
              <ScrollView horizontal style={styles.imageList} showsHorizontalScrollIndicator={false}>
                {abnormalDetailInfo?.exceptionImageList?.map((item: any, index: number) => (
                  <TouchableOpacity key={index} onPress={() => previewImage(item, index)} style={styles.imageItem}>
                    <Image source={{uri: item.url}} style={styles.photoImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 情况描述 */}
            <View style={styles.informationBoxItem}>
              <Text style={styles.informationText}>情况描述</Text>
              <Text style={styles.infoValue}>{abnormalDetailInfo?.comment || "暂无描述"}</Text>
            </View>
          </View>
        </View>

        {/* 其他信息 */}
        <View style={styles.otherInfo}>
          <View style={styles.titleContainer}>
            <View style={styles.mark} />
            <Text style={styles.titleText}>其他信息</Text>
          </View>

          <View style={styles.informationBox}>
            {/* 上报时间 */}
            <View style={[styles.informationBoxItem, styles.borderBottom]}>
              <Text style={styles.informationText}>上报时间</Text>
              <Text style={styles.infoValue}>{abnormalDetailInfo?.createTime || "暂无"}</Text>
            </View>

            {/* 具体位置 */}
            <View style={styles.informationBoxItem}>
              <Text style={styles.informationText}>具体位置</Text>
              <Text style={styles.infoValue}>{abnormalDetailInfo?.location || "暂无"}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 图片预览组件 */}
      <ImageView
        images={images}
        imageIndex={previewIndex}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mark: {
    width: 6,
    height: 20,
    backgroundColor: Global.colors.primary,
    marginRight: 10,
    borderRadius: 3,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  recordInfo: {
    padding: 16,
    paddingLeft: 7,
    paddingBottom: 0,
    marginTop: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  otherInfo: {
    padding: 16,
    paddingLeft: 7,
    paddingBottom: 0,
    marginTop: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  informationBox: {
    width: "100%",
  },
  informationBoxItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    height: "auto",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7e7e7",
  },
  informationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    minWidth: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginLeft: 8,
  },
  abnormalText: {
    color: "#ff4d4f",
  },
  markPositionItem: {
    justifyContent: "space-between",
  },
  markPositionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 8,
  },
  rightIcon: {
    width: 13,
    height: 13,
    marginLeft: 8,
  },
  imageList: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 8,
  },
  imageItem: {
    marginRight: 8,
  },
  photoImage: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
});

export default AbnormalDetailScreen;
