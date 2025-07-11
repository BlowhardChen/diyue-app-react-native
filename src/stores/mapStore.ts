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

  setMapType(type: string) {
    this.mapType = type;
    this.persist();
  }

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
      const data = await AsyncStorage.getItem(MAP_STORE_KEY);
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
