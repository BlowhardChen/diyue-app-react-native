import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {StyleSheet, View, LayoutChangeEvent} from "react-native";
import {Camera, CameraDevice, useCameraDevice} from "react-native-vision-camera";
import {Gesture, GestureDetector} from "react-native-gesture-handler";

type Props = {
  /** 初始缩放（0~1），0 表示最小光学缩放，1 表示设备最大缩放 */
  initialZoom?: number;
  /** 可选：外部传入的相机 ref（用于外层拍照等） */
  cameraRef?: React.RefObject<Camera | null>;
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const FullscreenCamera: React.FC<Props> = ({initialZoom = 0, cameraRef: externalRef}) => {
  const device = useCameraDevice("back");

  // 内部相机 ref，与外部 ref 合并
  const innerRef = useRef<Camera>(null);
  const setMergedRef = useCallback(
    (node: Camera | null) => {
      innerRef.current = node as any;
      if (externalRef) {
        externalRef.current = node;
      }
    },
    [externalRef],
  );

  // 视图尺寸（仅保留基础布局，不再用于点击坐标换算）
  const [viewSize, setViewSize] = useState({width: 1, height: 1});
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    setViewSize({width, height});
  }, []);

  // 缩放相关逻辑
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = device?.maxZoom ?? 1;
  const normToZoom = useCallback((z01: number) => minZoom + clamp(z01, 0, 1) * (maxZoom - minZoom), [minZoom, maxZoom]);
  const [zoom, setZoom] = useState<number>(normToZoom(initialZoom));
  const pinchStartZoomRef = useRef(zoom);

  // 仅保留捏合缩放手势
  const pinch = useMemo(() => {
    return Gesture.Pinch()
      .onStart(() => {
        pinchStartZoomRef.current = zoom;
      })
      .onUpdate(e => {
        const next = clamp(pinchStartZoomRef.current * e.scale, minZoom, maxZoom);
        setZoom(next);
      });
  }, [zoom, minZoom, maxZoom]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <GestureDetector gesture={pinch}>
        <View style={styles.fill}>
          <Camera
            ref={setMergedRef}
            style={styles.fill}
            device={device as CameraDevice}
            isActive
            enableZoomGesture={false}
            zoom={zoom}
            photo
            video={false}
          />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "black"},
  fill: {flex: 1},
});

export default FullscreenCamera;
