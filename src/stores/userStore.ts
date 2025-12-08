import {UserInfo} from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {makeAutoObservable, runInAction} from "mobx";

const USER_STORE_KEY = "user-store";

class UserStore {
  userInfo: UserInfo | null = null;
  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }
  // 设置用户信息并持久化存储
  setUserInfo(userInfo: UserInfo) {
    this.userInfo = userInfo;
    this.persist();
  }
  // 清除用户信息并持久化存储
  clearUserInfo() {
    this.userInfo = null;
    this.persist();
  }
  // 持久化数据

  async persist() {
    try {
      await AsyncStorage.setItem(USER_STORE_KEY, JSON.stringify(this.userInfo));
    } catch (e) {
      console.warn("userStore persist failed", e);
    }
  }
  // 加载持久化数据
  async loadPersistedState() {
    try {
      const data = await AsyncStorage.getItem(USER_STORE_KEY);
      if (data) {
        const parsed: UserInfo = JSON.parse(data);
        runInAction(() => {
          this.userInfo = parsed;
        });
      }
    } catch (e) {
      console.log("userStore load failed", e);
    }
  }
}
export const userStore = new UserStore();
