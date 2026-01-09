// 异常上传
import React, {useState, useEffect, useCallback} from "react";
import {View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform} from "react-native";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {PatrolParamList} from "@/types/navigation";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {debounce, set} from "lodash";
import axios from "axios";
import {launchImageLibrary, launchCamera} from "react-native-image-picker";
import {dictDataList} from "@/services/common";
import {patrolTaskAddException} from "@/services/farming";
import {locationToAddress} from "@/services/land";
import {AbnormalUploadScreenStyles} from "./styles/AbnormalUploadScreen";
import PopupInfo from "@/components/common/PopupInfo";
import {showCustomToast} from "@/components/common/CustomToast";
import {getToken} from "@/utils/tokenUtils";
import RNFetchBlob from "rn-fetch-blob";
import ImageView from "react-native-image-viewing";
import PermissionPopup from "@/components/common/PermissionPopup";
import {useCameraPermission} from "react-native-vision-camera";
import CustomLoading from "@/components/common/CustomLoading";

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
  const [showCameraPopup, setShowCameraPopup] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [images, setImages] = useState<{uri: string}[]>([]);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const {requestPermission} = useCameraPermission();
  const [permissionGranted, setPermissionGranted] = useState(false);

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

  // 标记位置
  const markPosition = () => {
    navigation.navigate("MarkPosition", {
      type: "Mark",
      onMarkPointResult: async result => {
        handleMarkPointResult(result);
      },
    });
  };

  // 处理标记位置回调
  const handleMarkPointResult = async (data: any) => {
    setMarkPoints(data.data);
    // 根据经纬度获取地址
    const res = await locationToAddress({
      longitude: data.data[0].longitude,
      latitude: data.data[0].latitude,
    });
    const {regeocode} = JSON.parse(res.data);
    const {formatted_address} = regeocode;
    setLocation(formatted_address);
  };

  // 关闭相机弹窗
  const closeCameraPopup = () => {
    setShowCameraPopup(false);
  };

  // 上传图片（相册/相机）
  const uploadImg = () => {
    setShowCameraPopup(true);
  };

  // 从相册选择图片
  const pickImageFromAlbum = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
      },
      async response => {
        if (response.didCancel) return;
        if (response.assets) {
          // 上传到OSS
          await uploadToOss(response.assets[0].uri as string);
        }
      },
    );
    setShowCameraPopup(false);
  };

  // 接受权限
  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    const granted = await requestPermission();
    if (granted) {
      setPermissionGranted(true);
    } else {
      showCustomToast("error", "未获得相机权限");
    }
  };

  // 拒绝权限
  const handleRejectPermission = () => {
    setShowPermissionPopup(false);
    setPermissionGranted(false);
  };

  // 相机拍照
  const takePhoto = async () => {
    if (!permissionGranted) {
      setShowPermissionPopup(true);
      return;
    }
    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
      },
      async response => {
        if (response.didCancel) return;
        if (response.assets) {
          // 上传到OSS
          await uploadToOss(response.assets[0].uri as string);
        }
      },
    );
    setShowCameraPopup(false);
  };

  // 上传图片到OSS服务器
  const uploadToOss = async (fileUri: string) => {
    console.log("上传图片路径:", fileUri);
    setLoading(true);
    try {
      const token = await getToken();
      const fileName = `abnormal_${Date.now()}.jpg`;

      // 使用 rn-fetch-blob 上传
      const res = await RNFetchBlob.fetch(
        "POST",
        "http://xtnf.com/app/aliyun/oss/uploadToAliOss",
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        [
          {name: "multipartFile", filename: fileName, data: RNFetchBlob.wrap(fileUri)},
          {name: "type", data: "0"},
          {name: "fileName", data: "other"},
        ],
      );

      const responseData = JSON.parse(res.data);
      if (res.respInfo.status === 200 && responseData.data) {
        const newImgUrl = responseData.data;
        console.log("图片上传成功，URL:", newImgUrl);
        setImgList(prev => [...prev, newImgUrl]);
        setImages(prev => [...prev, {uri: newImgUrl}]);
      }
    } catch (error: any) {
      showCustomToast("error", "图片上传失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 删除图片
  const deleteImg = (index: number) => {
    const newImgList = [...imgList];
    newImgList.splice(index, 1);
    setImgList(newImgList);

    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 预览图片
  const previewImage = (currentImg: string, index: number) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  // 防抖保存异常上报
  const saveAbnormal = debounce(async () => {
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

      showCustomToast("success", "上报成功");
      backView();
    } catch (error) {
      showCustomToast("error", "上报失败，请重试");
    } finally {
      setLoading(false);
    }
  }, 500);

  // 获取异常类型列表
  const getAbnormalList = async () => {
    try {
      const {data} = await dictDataList({dictType: "patrol_abnormal_type"});
      setAbnormalList(data || []);
    } catch (error) {
      showCustomToast("error", "获取异常类型失败");
    }
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
      <TouchableOpacity onPress={() => previewImage(imgUrl, index)} activeOpacity={0.9}>
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
            <TouchableOpacity style={AbnormalUploadScreenStyles.markPositionContainer} onPress={markPosition} activeOpacity={0.9}>
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
      {/* 图片选择弹窗 */}
      {showCameraPopup && (
        <PopupInfo
          showCloseBtn={true}
          title="请选择图片来源"
          leftBtnText="相册选择"
          rightBtnText="相机拍摄"
          onLeftBtn={pickImageFromAlbum}
          onRightBtn={takePhoto}
          onClosePopup={closeCameraPopup}>
          <View></View>
        </PopupInfo>
      )}
      {/* 图片预览组件 */}
      <ImageView
        images={images}
        imageIndex={previewIndex}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      />
      {/* 相机权限 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启相机权限"}
        message={"开启相机权限将用于识别卡片信息"}
      />
      {/* 图片上传加载弹窗 */}
      <CustomLoading visible={loading} text="图片上传中..." />
    </View>
  );
};

export default AbnormalUploadScreen;
