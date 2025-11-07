import {makeAutoObservable, runInAction} from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UpdateState = {
  isUpdateLand: boolean; // 是否需要更新地块
};

class UpdateStore {
  isUpdateLand: boolean = false; // 是否需要更新地块

  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }

  // 设置是否需要更新地块
  setIsUpdateLand(isUpdateLand: boolean) {
    this.isUpdateLand = isUpdateLand;
    this.persist();
  }

  // 持久化数据
  async persist() {
    try {
      await AsyncStorage.setItem(
        "update-store",
        JSON.stringify({
          status: this.isUpdateLand,
        }),
      );
    } catch (e) {
      console.warn("updateStore persist failed", e);
    }
  }

  // 加载持久化数据
  async loadPersistedState() {
    try {
      const data = await AsyncStorage.getItem("device-store");
      if (data) {
        const parsed: UpdateStore = JSON.parse(data);
        runInAction(() => {
          this.isUpdateLand = parsed.isUpdateLand;
        });
      }
    } catch (e) {
      console.log("updateStore load failed", e);
    }
  }
}

export const updateStore = new UpdateStore();
