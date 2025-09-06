import {makeAutoObservable, runInAction} from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MapState = {
  mapType: string;
  customMapLayer: string;
};

const MAP_STORE_KEY = "map-store";

class MapStore {
  mapType: string = "卫星地图";
  customMapLayer: string = "";

  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }
  /**
   * 设置地图类型并将当前状态持久化存储。
   * @param type - 要设置的地图类型，字符串类型。
   */
  setMapType(type: string) {
    this.mapType = type;
    this.persist();
  }
  /**
   * 设置自定义地图图层并将当前状态持久化存储。
   * @param layer - 要设置的自定义地图图层，字符串类型。
   */
  setCustomMapType(layer: string) {
    this.customMapLayer = layer;
    this.persist();
  }

  async persist() {
    try {
      await AsyncStorage.setItem(
        MAP_STORE_KEY,
        JSON.stringify({
          mapType: this.mapType,
          customMapLayer: this.customMapLayer,
        }),
      );
    } catch (e) {
      console.warn("mapStore persist failed", e);
    }
  }

  async loadPersistedState() {
    try {
      const {data} = await AsyncStorage.getItem(MAP_STORE_KEY);
      if (data) {
        const parsed: MapState = JSON.parse(data);
        runInAction(() => {
          this.mapType = parsed.mapType;
          this.customMapLayer = parsed.customMapLayer;
        });
      }
    } catch (e) {
      console.warn("mapStore load failed", e);
    }
  }
}

export const mapStore = new MapStore();
