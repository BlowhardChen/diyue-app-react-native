// WebView 与 RN 消息桥
window.WebBridge = (function () {
    
    // 发送消息到 RN
    function postMessage(payload) {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            try {
                const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
                window.ReactNativeWebView.postMessage(msg);
            } catch (err) {
                console.error("postMessage失败:", err);
            }
        }
    }

    // 发送错误消息到 RN
    function postError(msg) { postMessage({ type: 'WEBVIEW_ERROR', message: msg }) }

    // 接收来自 RN 消息
    function onMessage(event, handler) {
        let data = null;
        try { data = JSON.parse(event.data); } catch (e) { postError("无法解析消息:" + event.data); return; }
        if (!data || !data.type) return;
        handler(data);
    }

    // 暴露接口
    return { postMessage, postError, onMessage };
})();
