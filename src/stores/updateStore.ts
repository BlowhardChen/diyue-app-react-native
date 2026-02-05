import {makeAutoObservable, runInAction} from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UpdateState = {
  isUpdateLand: boolean;
  isUpdateLandDetail: boolean;
  isUpdateContract: boolean;
  farmingRefreshId: number;
};

class UpdateStore {
  isUpdateLand: boolean = false; // 是否需要更新地块
  isUpdateLandDetail: boolean = false; // 是否需要更新地块详情
  isUpdateContract: boolean = false; // 是否需要更新合同列表
  farmingRefreshId: number = 0; // 是否需要更新农事

  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }

  // 更新地块
  setIsUpdateLand(isUpdateLand: boolean) {
    this.isUpdateLand = isUpdateLand;
    this.persist();
  }

  // 更新地块详情
  setIsUpdateLandDetail(isUpdateLandDetail: boolean) {
    this.isUpdateLandDetail = isUpdateLandDetail;
    this.persist();
  }

  // 更新合同列表
  setIsUpdateContract(isUpdateContract: boolean) {
    this.isUpdateContract = isUpdateContract;
    this.persist();
  }

  // 更新农事
  triggerFarmingRefresh() {
    this.farmingRefreshId += 1;
    this.persist();
  }

  // 持久化数据
  async persist() {
    try {
      await AsyncStorage.setItem(
        "update-store", // 存储key
        JSON.stringify({
          isUpdateLand: this.isUpdateLand,
          isUpdateLandDetail: this.isUpdateLandDetail,
          isUpdateContract: this.isUpdateContract,
        }),
      );
    } catch (e) {
      console.warn("updateStore persist failed", e);
    }
  }

  // 加载持久化数据
  async loadPersistedState() {
    try {
      const data = await AsyncStorage.getItem("update-store");
      if (data) {
        const parsed: UpdateState = JSON.parse(data);
        runInAction(() => {
          this.isUpdateLand = parsed.isUpdateLand;
          this.isUpdateLandDetail = parsed.isUpdateLandDetail;
          this.isUpdateContract = parsed.isUpdateContract;
        });
      }
    } catch (e) {
      console.log("updateStore load failed", e);
    }
  }
}

export const updateStore = new UpdateStore();
