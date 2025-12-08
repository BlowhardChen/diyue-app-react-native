import {AppState, AppStateStatus} from "react-native";
import {showCustomToast} from "@/components/common/CustomToast";

interface Options {
  data: {
    token: string | any;
    imei?: string;
    deviceType?: string;
  };
  onConnected: () => void;
  onMessage: (data: any) => void;
  onError?: (error: Error) => void;
}

// 配置常量
const HEARTBEAT_INTERVAL = 30000; // 心跳间隔30秒
const RECONNECT_INTERVAL = 5000; // 重连间隔5秒
const MAX_RECONNECT_TIMES = 5; // 最大重连次数5次

export default class WebSocketClass {
  private options: Options;
  private socket: WebSocket | null;
  private normalCloseFlag: boolean;
  private reconnectTime: number;
  private reconnectTimer: NodeJS.Timeout | null;
  private heartbeatTimer: NodeJS.Timeout | null;
  private static readonly MAX_RECONNECT = MAX_RECONNECT_TIMES;
  private currentAppState: AppStateStatus = "active"; // 记录当前应用状态
  private appStateListener: any;

  constructor(options: Options) {
    this.options = options;
    this.socket = null;
    this.normalCloseFlag = false;
    this.reconnectTime = 1;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.appStateListener = null;

    // 初始化连接
    this.initWS();
    // 注册应用状态监听（新增）
    this.setupAppStateListener();
  }

  /**
   * 注册应用前后台状态监听
   */
  private setupAppStateListener() {
    // 监听应用状态变化
    this.appStateListener = AppState.addEventListener("change", this.handleAppStateChange);
  }

  /**
   * 处理应用状态变化
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    // 后台切前台：foreground -> active
    if (this.currentAppState === "background" && nextAppState === "active") {
      this.handleAppForeground();
    }
    // 前台切后台：active -> background
    else if (this.currentAppState === "active" && nextAppState === "background") {
      this.handleAppBackground();
    }

    // 更新当前状态
    this.currentAppState = nextAppState;
  };

  /**
   * 应用切回前台处理
   */
  private handleAppForeground() {
    // 正常关闭（主动调用close()）-> 不处理
    if (this.normalCloseFlag) return;

    // 未连接/连接断开 -> 触发重连
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      showCustomToast("success", "网络恢复，正在重新连接...");
      this.reconnect(); // 调用已有的重连方法
    }
    // 已连接但心跳停止 -> 重启心跳
    else if (!this.heartbeatTimer) {
      this.startHeartbeat();
    }
  }

  /**
   * 应用切到后台处理
   */
  private handleAppBackground() {
    // 暂停心跳（避免后台无效消耗）
    this.stopHeartbeat();
    // 清除重连定时器（后台不需要重连）
    this.clearReconnectTimer();
  }

  /**
   * 初始化WebSocket连接
   */
  private initWS() {
    const {token} = this.options.data;
    const url = `ws://60.205.213.205:8091/wss/im/${token}`;

    try {
      this.socket = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      this.options.onError?.(error as Error);
      this.onDisconnected();
    }
  }

  /**
   * 设置WebSocket事件监听
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.options.onConnected();
      this.reconnectTime = 1;
      // 只有应用在前台时才启动心跳
      if (this.currentAppState === "active") {
        this.startHeartbeat();
      }
    };

    this.socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        this.options.onMessage(data);
      } catch (error) {
        this.options.onError?.(error as Error);
      }
    };

    this.socket.onerror = error => {
      this.options.onError?.(error as any);
      this.socket?.close();
    };

    this.socket.onclose = event => {
      this.stopHeartbeat();

      if (!this.normalCloseFlag) {
        // 只有应用在前台时才触发重连（后台不重连）
        if (this.currentAppState === "active") {
          this.onDisconnected();
        }
      }
    };
  }

  /**
   * 启动心跳
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        const heartbeatData = JSON.stringify([{imei: this.options.data.imei || ""}]);
        this.socket.send(heartbeatData);
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 断开连接处理
   */
  private onDisconnected() {
    this.clearReconnectTimer();
    this.onReconnect();
  }

  /**
   * 断线重连逻辑
   */
  private onReconnect() {
    if (this.reconnectTime < WebSocketClass.MAX_RECONNECT) {
      this.reconnectTimer = setTimeout(() => {
        this.initWS();
        this.reconnectTime++;
      }, RECONNECT_INTERVAL);
    } else {
      this.showReconnectFailedAlert();
    }
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 重连失败弹窗
   */
  private showReconnectFailedAlert() {
    showCustomToast("error", "服务器链接失败，请检查网络");
    this.close();
  }

  /**
   * 主动关闭连接
   */
  close = () => {
    this.normalCloseFlag = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.socket?.close();
    this.socket = null;
    // 移除应用状态监听
    this.appStateListener.remove("change");
  };

  /**
   * 手动重连
   */
  reconnect = () => {
    if (!this.normalCloseFlag) {
      this.reconnectTime = 1;
      this.clearReconnectTimer();
      this.initWS();
    }
  };
}
