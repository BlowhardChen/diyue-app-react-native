import {useEffect, useRef} from "react";
import {accelerometer, magnetometer, SensorTypes, setUpdateIntervalForType} from "react-native-sensors";
import {Subscription} from "rxjs";
import {throttle} from "lodash";

/**
 * 计算两个角度之间的最小差值（0-180°）
 */
function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * 计算精确 heading（地理北方向角），单位为度，顺时针方向。
 * 仅在朝向变化超过 MIN_DELTA_DEG 时才触发回调。
 */
export default function useOptimizedHeading(onHeadingChange: (heading: number) => void) {
  const accelData = useRef({x: 0, y: 0, z: 0});
  const magnetData = useRef({x: 0, y: 0, z: 0});

  // 上次发送的角度
  const lastHeading = useRef<number | null>(null);

  // 修正偏移角（顺时针方向）
  const OFFSET = -5;

  // 最小变动角度（单位：度），小于此角度不触发更新
  const MIN_DELTA_DEG = 5;

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.magnetometer, 100);

    let accelSub: Subscription | null = null;
    let magnetSub: Subscription | null = null;

    const throttledEmit = throttle((heading: number) => {
      const prev = lastHeading.current;
      if (prev === null || angleDiff(heading, prev) >= MIN_DELTA_DEG) {
        lastHeading.current = heading;
        onHeadingChange(heading);
      }
    }, 100); // 每 100ms 最多触发一次

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

      const Hx = Ey * Az - Ez * Ay;
      const Hy = Ez * Ax - Ex * Az;
      const Hz = Ex * Ay - Ey * Ax;

      const normH = Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz);
      if (normH < 0.1) return;

      const invH = 1.0 / normH;
      const hX = Hx * invH;
      const hY = Hy * invH;

      let headingRad = Math.atan2(hY, hX);
      if (headingRad < 0) headingRad += 2 * Math.PI;

      let headingDeg = headingRad * (180 / Math.PI);
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
