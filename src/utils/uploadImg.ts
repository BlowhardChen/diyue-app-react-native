import {showCustomToast} from "@/components/common/CustomToast";
import {useState} from "react";
import {Platform} from "react-native";

export const useOCR = () => {
  const [loading, setLoading] = useState(false);

  const uploadImg = async (filePath: string, token: string, type: string, name = "file.jpg") => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      // @ts-ignore
      formData.append("file", {
        uri: Platform.OS === "android" ? filePath : filePath.replace("file://", ""),
        name,
        type: "image/jpeg",
      });

      const res = await fetch("http://60.205.213.205:8091/upload/uploadOCRImg", {
        method: "POST",
        headers: {token},
        body: formData,
      });
      const {data} = await res.json();
      if (!data) {
        return {success: false};
      }
      console.log("uploadImg", data);
      const ocrInfo = data;
      return {success: true, ocrInfo};
    } catch (err) {
      showCustomToast("error", "上传失败");
      return {success: false};
    } finally {
      setLoading(false);
    }
  };

  return {uploadImg, loading};
};
