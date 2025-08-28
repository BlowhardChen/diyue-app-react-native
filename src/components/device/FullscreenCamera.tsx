import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Animated, Easing, Linking, Platform, StyleSheet, View, LayoutChangeEvent} from "react-native";
import {Camera, useCameraDevice, useCameraPermission} from "react-native-vision-camera";
import {Gesture, GestureDetector} from "react-native-gesture-handler";

type Props = {
  /** 初始缩放（0~1），0 表示最小光学缩放，1 表示设备最大缩放 */
  initialZoom?: number;
  /** 点击对焦指示器停留毫秒 */
  focusIndicatorDuration?: number;
  /** 可选：外部传入的相机 ref（用于外层拍照等） */
  cameraRef?: React.RefObject<Camera | null>;
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const FullscreenCamera: React.FC<Props> = ({initialZoom = 0, focusIndicatorDuration = 800, cameraRef: externalRef}) => {
  // 设备 + 权限
  const device = useCameraDevice("back");
  const {hasPermission, requestPermission} = useCameraPermission();

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

  // 视图尺寸（用于点击坐标换算）
  const [viewSize, setViewSize] = useState({width: 1, height: 1});
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    setViewSize({width, height});
  }, []);

  // 权限（这里只做一次请求，避免闪黑）
  const [permissionChecked, setPermissionChecked] = useState(false);
  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      setPermissionChecked(true);
    })();
  }, [requestPermission]);

  // 缩放（普通 state）
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = device?.maxZoom ?? 1;
  const normToZoom = useCallback((z01: number) => minZoom + clamp(z01, 0, 1) * (maxZoom - minZoom), [minZoom, maxZoom]);
  const [zoom, setZoom] = useState<number>(normToZoom(initialZoom));
  const pinchStartZoomRef = useRef(zoom);

  // 点击对焦指示器（RN Animated）
  const focusX = useRef(new Animated.Value(-1000)).current;
  const focusY = useRef(new Animated.Value(-1000)).current;
  const focusOpacity = useRef(new Animated.Value(0)).current;
  const focusScale = useRef(new Animated.Value(0.7)).current;

  const showFocusIndicator = useCallback(
    (x: number, y: number) => {
      focusX.setValue(x - 40);
      focusY.setValue(y - 40);
      focusOpacity.setValue(1);
      focusScale.setValue(0.7);
      Animated.parallel([
        Animated.timing(focusScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(focusOpacity, {
          toValue: 0,
          duration: focusIndicatorDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [focusIndicatorDuration, focusOpacity, focusScale, focusX, focusY],
  );

  // 捏合缩放手势（只要不在按钮上，事件会落到相机层上）
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

  // 点击手动对焦（按钮会优先吃掉触摸，不会触发这里）
  const tapToFocus = useMemo(() => {
    return Gesture.Tap()
      .maxDuration(250)
      .onEnd(async e => {
        const {x, y} = e;
        showFocusIndicator(x, y);

        try {
          const cam = innerRef.current as any;
          if (cam && typeof cam.focus === "function") {
            await cam.focus({x, y});
          } else if (cam && typeof cam.setPointOfInterest === "function") {
            const nx = clamp(x / viewSize.width, 0, 1);
            const ny = clamp(y / viewSize.height, 0, 1);
            await cam.setPointOfInterest({x: nx, y: ny});
          } else {
            // 某些版本没有手动对焦 API，则忽略
          }
        } catch (err) {
          console.warn("Manual focus failed:", err);
        }
      });
  }, [showFocusIndicator, viewSize.width, viewSize.height]);

  const gestures = useMemo(() => Gesture.Simultaneous(pinch, tapToFocus), [pinch, tapToFocus]);

  // 渲染分支
  if (!permissionChecked) return <View style={styles.black} />;
  if (!hasPermission) {
    return (
      <View style={[styles.black, styles.center]}>
        <View style={styles.permissionCard}>
          <Animated.Text style={styles.permissionTitle}>需要相机权限</Animated.Text>
          <Animated.Text style={styles.permissionText}>请在系统设置中开启相机权限后返回应用。</Animated.Text>
          <View
            style={styles.permissionButton}
            onTouchEnd={() => {
              if (Platform.OS === "ios") Linking.openURL("app-settings:");
              else Linking.openSettings();
            }}>
            <Animated.Text style={styles.permissionBtnText}>打开设置</Animated.Text>
          </View>
        </View>
      </View>
    );
  }
  if (!device) return <View style={styles.black} />;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <GestureDetector gesture={gestures}>
        <View style={styles.fill}>
          <Camera
            ref={setMergedRef}
            style={styles.fill}
            device={device}
            isActive
            enableZoomGesture={false} // 我们用自定义 Pinch
            zoom={zoom}
            photo
            video={false}
          />
          {/* 对焦指示器 */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.focusIndicator,
              {
                opacity: focusOpacity,
                transform: [{scale: focusScale}],
                left: focusX,
                top: focusY,
              },
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "black"},
  fill: {flex: 1},
  black: {flex: 1, backgroundColor: "black"},
  center: {justifyContent: "center", alignItems: "center"},
  permissionCard: {
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  permissionTitle: {color: "white", fontSize: 18, fontWeight: "600", marginBottom: 6},
  permissionText: {color: "white", opacity: 0.9, fontSize: 14, lineHeight: 20},
  permissionButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 999,
  },
  permissionBtnText: {color: "black", fontSize: 14, fontWeight: "600"},
  focusIndicator: {
    position: "absolute",
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "white",
  },
});

export default FullscreenCamera;
