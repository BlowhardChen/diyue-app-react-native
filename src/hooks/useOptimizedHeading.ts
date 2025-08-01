import {useEffect, useRef} from "react";
import {accelerometer, magnetometer, SensorTypes, setUpdateIntervalForType} from "react-native-sensors";
import {Subscription} from "rxjs";
import {throttle} from "lodash";

/**
 * 计算精确 heading（地理北方向角），单位为度，顺时针方向。
 * 已修正设备坐标偏差，默认加 30° 顺时针偏移。
 */
export default function useOptimizedHeading(onHeadingChange: (heading: number) => void) {
  const accelData = useRef({x: 0, y: 0, z: 0});
  const magnetData = useRef({x: 0, y: 0, z: 0});

  // 修正偏移角，单位：度；可通过 UI 或校准逻辑动态更新
  const OFFSET = 35;

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.magnetometer, 100);

    let accelSub: Subscription | null = null;
    let magnetSub: Subscription | null = null;

    const throttledEmit = throttle((heading: number) => {
      onHeadingChange(heading);
    }, 100);

    accelSub = accelerometer.subscribe(({x, y, z}) => {
      accelData.current = {x, y, z};
      computeHeading();
    });

    magnetSub = magnetometer.subscribe(({x, y, z}) => {
      magnetData.current = {x, y, z};
      computeHeading();
    });

    function computeHeading() {
      const {x: Ax, y: Ay, z: Az} = accelData.current;
      const {x: Ex, y: Ey, z: Ez} = magnetData.current;

      // 叉乘 H = E × A（磁感应向量 × 重力向量）
      const Hx = Ey * Az - Ez * Ay;
      const Hy = Ez * Ax - Ex * Az;
      const Hz = Ex * Ay - Ey * Ax;

      const normH = Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz);
      if (normH < 0.1) return; // 矢量太小，可能干扰

      const invH = 1.0 / normH;
      const hX = Hx * invH;
      const hY = Hy * invH;

      let headingRad = Math.atan2(hY, hX);
      if (headingRad < 0) headingRad += 2 * Math.PI;

      let headingDeg = headingRad * (180 / Math.PI);

      // 加入修正角（顺时针方向）
      const correctedHeading = (headingDeg + OFFSET + 360) % 360;

      throttledEmit(correctedHeading);
    }

    return () => {
      accelSub?.unsubscribe();
      magnetSub?.unsubscribe();
      throttledEmit.cancel();
    };
  }, [onHeadingChange]);
}
