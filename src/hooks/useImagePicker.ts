import ImagePicker, {ImageOrVideo} from "react-native-image-crop-picker";

interface PickerResult {
  uri: string;
  fileName?: string;
  type?: string;
  width?: number;
  height?: number;
  size?: number;
}

const useImagePicker = () => {
  // 拍照
  const pickImageFromCamera = async (): Promise<PickerResult | null> => {
    try {
      const image: ImageOrVideo = await ImagePicker.openCamera({
        mediaType: "photo",
        cropping: false, // 不裁剪
        compressImageQuality: 0.8, // 压缩质量 0~1
      });

      return {
        uri: image.path,
        fileName: image.filename ?? "camera.jpg",
        type: image.mime,
        width: image.width,
        height: image.height,
        size: image.size,
      };
    } catch (e: any) {
      console.log("用户取消拍照或错误:", e.message);
      return null;
    }
  };

  // 从相册选择
  const pickImageFromLibrary = async (): Promise<PickerResult | null> => {
    try {
      const image: ImageOrVideo = await ImagePicker.openPicker({
        mediaType: "photo",
        cropping: false,
        compressImageQuality: 0.8,
      });

      return {
        uri: image.path,
        fileName: image.filename ?? "gallery.jpg",
        type: image.mime,
        width: image.width,
        height: image.height,
        size: image.size,
      };
    } catch (e: any) {
      console.log("用户取消选择或错误:", e.message);
      return null;
    }
  };

  return {
    pickImageFromCamera,
    pickImageFromLibrary,
  };
};

export default useImagePicker;
