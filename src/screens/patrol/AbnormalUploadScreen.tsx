// 异常上传
import React, {useState, useEffect, useCallback} from "react";
import {View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator} from "react-native";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {PatrolParamList} from "@/types/navigation";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {debounce} from "lodash";
import axios from "axios";
import {launchImageLibrary, launchCamera} from "react-native-image-picker";
import {dictDataList} from "@/services/common";
import {patrolTaskAddException} from "@/services/farming";
import {locationToAddress} from "@/services/land";
import {AbnormalUploadScreenStyles} from "./styles/AbnormalUploadScreen";

type AbnormalUploadRouteParams = {
  AbnormalUpload: {
    landId?: string;
    id?: string;
  };
};

const AbnormalUploadScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<PatrolParamList>>();
  const route = useRoute<RouteProp<AbnormalUploadRouteParams, "AbnormalUpload">>();
  const [isSaveType, setIsSaveType] = useState<boolean>(false);
  const [otherInfo, setOtherInfo] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [abnormalList, setAbnormalList] = useState<any[]>([]);
  const [imgList, setImgList] = useState<string[]>([]);
  const [markPoints, setMarkPoints] = useState<any[]>([]);
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string>("");

  // 返回上一页
  const backView = () => {
    navigation.goBack();
  };

  // 选择异常类型
  const checkAbnormal = (index: number) => {
    const newList = [...abnormalList];
    newList[index].default = !newList[index].default;
    setAbnormalList(newList);

    // 判断是否有选中项
    const hasSelected = newList.some(item => item.default === true);
    setIsSaveType(hasSelected);
  };

  // 查看标记位置
  const viewMarkPosition = () => {
    navigation.navigate("MarkPosition", {
      type: "mark",
      markPoints: markPoints.length ? markPoints : [],
    });
  };

  // 上传图片（相册/相机）
  const uploadImg = () => {
    // 选项配置
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    // 弹出选择框
    Alert.alert("选择图片", "请选择图片来源", [
      {text: "相册", onPress: () => pickImageFromAlbum(options)},
      {text: "相机", onPress: () => takePhoto(options)},
      {text: "取消", style: "cancel"},
    ]);
  };

  // 从相册选择图片
  const pickImageFromAlbum = async (options: any) => {
    launchImageLibrary(options, async response => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert("错误", "选择图片失败");
        return;
      }

      // 上传到OSS
      await uploadToOss(response.assets[0].uri);
    });
  };

  // 相机拍照
  const takePhoto = async (options: any) => {
    launchCamera(options, async response => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert("错误", "拍照失败");
        return;
      }

      // 上传到OSS
      await uploadToOss(response.assets[0].uri);
    });
  };

  // 上传图片到OSS服务器
  const uploadToOss = async (fileUri: string) => {
    setLoading(true);
    // try {
    //   // RN 上传文件需要处理 FormData
    //   const formData = new FormData();
    //   const fileName = `abnormal_${Date.now()}.jpg`;

    //   // 适配 iOS/Android 文件格式
    //   formData.append("multipartFile", {
    //     uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
    //     type: "image/jpeg",
    //     name: fileName,
    //   });
    //   formData.append("type", "0");
    //   formData.append("fileName", "other");

    //   // 上传请求
    //   const res = await axios.post("http://xtnf.com/app/aliyun/oss/uploadToAliOss", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });

    //   if (res.status === 200) {
    //     setImgList([...imgList, res.data.data]);
    //   }
    // } catch (error) {
    //   Alert.alert("错误", "图片上传失败");
    //   console.error("OSS上传失败:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  // 删除图片
  const deleteImg = (index: number) => {
    const newImgList = [...imgList];
    newImgList.splice(index, 1);
    setImgList(newImgList);
  };

  // 预览图片
  const previewImage = (currentImg: string) => {
    // RN 图片预览：可使用 react-native-image-viewing 或系统相册
    Alert.alert("预览图片", "", [
      {text: "保存图片", onPress: () => saveImageToAlbum(currentImg)},
      {text: "关闭", style: "cancel"},
    ]);
  };

  // 保存图片到相册（可选）
  const saveImageToAlbum = async (imgUrl: string) => {
    // 需安装 react-native-fs 或 expo-media-library
    // 此处简化，仅做示例
    Alert.alert("提示", "图片预览功能已触发，实际需集成保存逻辑");
  };

  // 防抖保存异常上报
  const saveAbnormal = useCallback(
    debounce(async () => {
      setLoading(true);
      try {
        // 构造参数
        const params = {
          comment: comment || "",
          location: location || "",
          exceptionImageList: imgList.map(url => ({url})),
          exceptionGpsList: markPoints.map(item => ({
            lng: item.longitude,
            lat: item.latitude,
            ...(item.landId && {landId: item.landId}),
          })),
          exceptionReportList: [
            // 选中的异常类型
            ...abnormalList.filter(item => item.default).map(item => ({dictLabel: item.dictLabel})),
            // 其他输入
            ...(otherInfo ? [{dictLabel: otherInfo}] : []),
          ],
          ...(taskId && {taskLogId: taskId}),
        };

        // 提交上报
        await patrolTaskAddException(params);

        Alert.alert("成功", "上报成功");
        backView();
      } catch (error) {
        Alert.alert("错误", "上报失败，请重试");
        console.error("上报失败:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [abnormalList, otherInfo, comment, imgList, markPoints, location, taskId],
  );

  // 获取异常类型列表
  const getAbnormalList = async () => {
    try {
      const {data} = await dictDataList({dictType: "patrol_abnormal_type"});
      setAbnormalList(data || []);
    } catch (error) {
      Alert.alert("错误", "获取异常类型失败");
      console.error("获取异常类型:", error);
    }
  };

  // 监听标记位置回调（替代 uni.$on）
  const handleMarkPoint = async (data: any) => {
    setMarkPoints(data.data);
    // 根据经纬度获取地址
    const res = await locationToAddress({
      longitude: data.data[0]?.longitude,
      latitude: data.data[0]?.latitude,
    });
    const {regeocode} = JSON.parse(res.data);
    setLocation(regeocode.formatted_address);
  };

  useEffect(() => {
    if (route.params?.id) {
      setTaskId(route.params.id);
    }
    getAbnormalList();
  }, []);

  // 渲染异常类型选项
  const renderAbnormalItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[AbnormalUploadScreenStyles.abnormalItem, item.default && AbnormalUploadScreenStyles.abnormalItemActive]}
      onPress={() => checkAbnormal(index)}
      activeOpacity={0.9}>
      <Text
        style={[AbnormalUploadScreenStyles.abnormalItemText, item.default && AbnormalUploadScreenStyles.abnormalItemTextActive]}>
        {item.dictLabel}
      </Text>
      {item.default && (
        <Image
          source={require("@/assets/images/farming/icon-abnormal-checked.png")}
          style={AbnormalUploadScreenStyles.checkedIcon}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );

  // 渲染图片列表
  const renderImageItem = (imgUrl: string, index: number) => (
    <View key={index} style={AbnormalUploadScreenStyles.imgListItem}>
      <TouchableOpacity onPress={() => previewImage(imgUrl)} activeOpacity={0.9}>
        <Image source={{uri: imgUrl}} style={AbnormalUploadScreenStyles.imgItemImage} resizeMode="cover" />
      </TouchableOpacity>
      <TouchableOpacity style={AbnormalUploadScreenStyles.imgCloseBtn} onPress={() => deleteImg(index)} activeOpacity={0.8}>
        <Image
          source={require("@/assets/images/farming/icon-close.png")}
          style={AbnormalUploadScreenStyles.closeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={AbnormalUploadScreenStyles.container}>
      {/* 导航栏 */}
      <CustomStatusBar navTitle="异常上报" onBack={backView} />

      {/* 内容滚动区 */}
      <ScrollView
        style={AbnormalUploadScreenStyles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={AbnormalUploadScreenStyles.contentContainer}>
        {/* 异常信息卡片 */}
        <View style={AbnormalUploadScreenStyles.abnormalCard}>
          {/* 异常汇报 */}
          <View style={[AbnormalUploadScreenStyles.infoItem, {paddingTop: 8, flexDirection: "row"}]}>
            <View style={{position: "relative"}}>
              <Text style={AbnormalUploadScreenStyles.mustText}>*</Text>
              <Text style={[AbnormalUploadScreenStyles.infoLabel, AbnormalUploadScreenStyles.mustLabel]}>异常汇报</Text>
            </View>
            <View style={AbnormalUploadScreenStyles.abnormalList}>
              {/* 异常类型选项 */}
              {abnormalList.map((item, index) => renderAbnormalItem(item, index))}

              {/* 其他输入框 */}
              <View style={AbnormalUploadScreenStyles.otherInputContainer}>
                <TextInput
                  style={AbnormalUploadScreenStyles.otherInput}
                  placeholder="请输入其他情况"
                  value={otherInfo}
                  onChangeText={setOtherInfo}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* 标记位置 */}
          <View style={[AbnormalUploadScreenStyles.infoItem, AbnormalUploadScreenStyles.borderBottom]}>
            <Text style={AbnormalUploadScreenStyles.infoLabel}>标记位置</Text>
            <TouchableOpacity
              style={AbnormalUploadScreenStyles.markPositionContainer}
              onPress={viewMarkPosition}
              activeOpacity={0.9}>
              <Text style={AbnormalUploadScreenStyles.markPositionText}>
                {markPoints.length ? (
                  <>
                    已标记<Text style={AbnormalUploadScreenStyles.redText}> {markPoints.length} </Text>个点
                  </>
                ) : (
                  <Text style={AbnormalUploadScreenStyles.grayText}>请选择</Text>
                )}
              </Text>
              <Image
                source={require("@/assets/images/common/icon-right.png")}
                style={AbnormalUploadScreenStyles.rightIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* 现场图片 */}
          <View style={[AbnormalUploadScreenStyles.infoItem, AbnormalUploadScreenStyles.borderBottom]}>
            <Text style={AbnormalUploadScreenStyles.infoLabel}>现场图片</Text>
            <View style={AbnormalUploadScreenStyles.imgListBox}>
              {/* 已上传图片 */}
              <View style={AbnormalUploadScreenStyles.imgList}>{imgList.map((img, index) => renderImageItem(img, index))}</View>

              {/* 上传按钮 */}
              <TouchableOpacity
                style={AbnormalUploadScreenStyles.uploadBtn}
                onPress={uploadImg}
                disabled={loading}
                activeOpacity={0.9}>
                <Image
                  source={require("@/assets/images/farming/img-upload.png")}
                  style={AbnormalUploadScreenStyles.uploadImg}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 情况描述 */}
          <View style={[AbnormalUploadScreenStyles.infoItem, {flexDirection: "column", borderBottomWidth: 0, paddingBottom: 0}]}>
            <Text style={AbnormalUploadScreenStyles.infoLabel}>情况描述</Text>
            <View style={AbnormalUploadScreenStyles.commentContainer}>
              <TextInput
                style={AbnormalUploadScreenStyles.commentInput}
                placeholder="请输入"
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部保存按钮 */}
      <View style={AbnormalUploadScreenStyles.buttonBox}>
        <TouchableOpacity
          style={[AbnormalUploadScreenStyles.saveButton, !isSaveType && AbnormalUploadScreenStyles.saveButtonDisabled]}
          onPress={saveAbnormal}
          disabled={!isSaveType || loading}
          activeOpacity={0.9}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={AbnormalUploadScreenStyles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AbnormalUploadScreen;
