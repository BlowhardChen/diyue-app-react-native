import {makeAutoObservable, runInAction} from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type DeviceState = {
  status: string; // 1 在线，2 离线
  deviceImei: string;
};

class DeviceStore {
  status: string = "2"; // 初始为离线
  deviceImei: string = "";

  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }

  // 设置设备状态
  listenDeviceStatus(status: string) {
    this.status = status;
    this.persist();
  }

  // 设置 IMEI
  setDeviceImei(imei: string) {
    this.deviceImei = imei;
    this.persist();
  }

  // 持久化数据
  async persist() {
    try {
      await AsyncStorage.setItem(
        "device-store",
        JSON.stringify({
          status: this.status,
          deviceImei: this.deviceImei,
        }),
      );
    } catch (e) {
      console.warn("deviceStore persist failed", e);
    }
  }

  // 加载持久化数据
  async loadPersistedState() {
    try {
      const data = await AsyncStorage.getItem("device-store");
      if (data) {
        const parsed: DeviceState = JSON.parse(data);
        runInAction(() => {
          this.status = parsed.status;
          this.deviceImei = parsed.deviceImei;
        });
      }
    } catch (e) {
      console.log("deviceStore load failed", e);
    }
  }
}

export const deviceStore = new DeviceStore();
