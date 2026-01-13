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

      if (!res.ok) {
        // 如果响应状态码不是 2xx，手动抛出错误
        const errorData = await res.json(); // 尝试解析错误信息
        throw new Error(errorData.msg || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data) {
        throw new Error("服务器返回数据为空");
      }

      console.log("uploadImg", data);
      if (data.code !== 200) {
        throw new Error(data.msg || "图片识别失败");
      }
      const ocrInfo = data;
      return {success: true, ocrInfo};
    } catch (err: any) {
      showCustomToast("error", err.message || "上传或识别失败");
      return {success: false};
    } finally {
      setLoading(false);
    }
  };

  return {uploadImg, loading};
};
