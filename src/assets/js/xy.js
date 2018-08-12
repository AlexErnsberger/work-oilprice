(function (win) {
    'use strict';
    //客户端事件
    var EVENTS = [
        'backbutton',
        'online',
        'offline',
        'pause',
        'resume',
        'swipeRefresh' //0.0.5
    ];
    //方法列表
    var METHODS = [
        'ui.navigation.setTitle',
        'ui.navigation.close',
        'ui.navigation.goBack',
        'ui.navigation.hidden',
        'ui.navigation.show',
        'data.user.get',
        'data.map.getLocation'
    ];
    var JSSDK_VERSION = "0.1.0";
    var ua = win.navigator.userAgent;
    var matches = ua.match(/XYApp\(\w+\/([a-zA-Z0-9.-]+)\)/);
    //android兼容处理
    if (matches === null) {
        matches = ua.match(/XYApp\/([a-zA-Z0-9.-]+)/);
    }
    var version = matches && matches[1];
    var authorised = false; //是否已校验通过
    var already = false; //是否已初始化
    var config = null; //缓存config参数
    var authMethod = 'runtime.permission.requestJsApis'; //权限校验方法名
    var errorHandle = null; //缓存error回调
    var bridgeReady = false;


    var xy = {
        ios: (/iPhone|iPad|iPod/i).test(ua),
        android: (/Android/i).test(ua),
        version: version,
        support: version === '1.2.2' || version === '1.3.2',
        ability: '', //空为初始值，具体值从客户端读取，格式为x.x.x
        config: function (obj) {
            //这里对用户传进来的参数进行过滤
            if (!obj) {
                return;
            }
            //TODO: 参数名待确认
            config = {
                corpId: obj.corpId,
                appId: obj.appId || -1,
                timeStamp: obj.timeStamp,
                nonceStr: obj.nonceStr,
                signature: obj.signature,
                jsApiList: obj.jsApiList
            };
            if (obj.agentId) {
                config.agentId = obj.agentId;
            }
        },
        error: function (fn) {
            errorHandle = fn;
        },
        ready: function (callback) {
            //总控
            var fn = function (bridge) {
                if (!bridge) {
                    return console.log('bridge初始化失败')
                }
                //callback(bridge);
                //TODO: 判断config，进行权限校验
                if (config === null || !config.signature) {
                    //console.log('没有配置xy.config')
                    callback(bridge);
                } else {
                    //console.log('配置了xy.config', config)
                    //权限校验
                    if (xy.ios) {
                        bridge.callHandler(authMethod, config, function (response) {
                            var data = response || {};
                            var code = data.errorCode;
                            var msg = data.errorMessage || '';
                            var result = data.result;
                            if (code === '0') {
                                callback(bridge);
                            } else {
                                setTimeout(function () {
                                    errorHandle && errorHandle({
                                        message: '权限校验失败 ' + msg,
                                        errorCode: 3
                                    });
                                });
                            }
                        });
                    } else if (xy.android) {
                        var arr = authMethod.split('.');
                        var suff = arr.pop();
                        var pre = arr.join('.');
                        bridge(function () {
                            callback(bridge);
                        }, function (err) {
                            setTimeout(function () {
                                var msg = err && err.errorMessage || '';
                                errorHandle && errorHandle({
                                    message: '权限校验失败 ' + msg,
                                    errorCode: 3
                                });
                            });
                        }, pre, suff, config);
                    }
                }
                //callback(bridge);
                //第一次初始化后要做的事情
                if (already === false) {
                    already = true;
                    //自定义事件
                    EVENTS.forEach(function (evt) {
                    if (xy.ios) {
                      bridge.registerHandler(evt, function (data, responseCallback) {
                        //console.log('注册事件默认回调', data, responseCallback);
                        var e = document.createEvent('HTMLEvents');
                        e.data = data;
                        e.initEvent(evt);
                        document.dispatchEvent(e);
                        responseCallback && responseCallback({
                          errorCode: '0',
                          errorMessage: '成功'
                        })
                      });
                    }
                  });

                    if (config === null) {
                        var conf = {
                            url: encodeURIComponent(window.location.href),
                            js: JSSDK_VERSION,
                            cid: config && config.corpId || ''
                        };
                        //打点
                        // xy.biz.util.ut({
                        //     key: 'xy_open_js_monitor',
                        //     value: JSON.stringify(conf),
                        //     onSuccess: function(res) {
                        //         //console.log('xy_open_js_monitor ut打点成功', res);
                        //     }
                        // });
                    }
                }
            };

            //已经完成初始化的情况
            if (win.WebViewJavascriptBridge) {
                //防止ready延迟导致的问题
                //init后，register的方法才能收到回调，重现方法：首次触发xy.ready延时
                try {
                    WebViewJavascriptBridge.init(function (data, responseCallback) {
                        //客户端send
                        //console.log('WebViewJavascriptBridge init: ', data, responseCallback);
                    });
                } catch (e) {
                    console.log(e.message);
                }
                return fn(WebViewJavascriptBridge);
            } else if (xy.android && win.WebViewJavascriptBridgeAndroid) {
                return fn(WebViewJavascriptBridgeAndroid);
            }
            //初始化主流程
            if (xy.ios || xy.android) {
                //console.log('开始监听WebViewJavascriptBridgeReady事件');
                document.addEventListener('WebViewJavascriptBridgeReady', function () {
                    if (typeof WebViewJavascriptBridge === 'undefined') {
                        return console.log('WebViewJavascriptBridge 未定义');
                    }
                    try {
                        WebViewJavascriptBridge.init(function (data, responseCallback) {
                            //客户端send
                            //console.log('WebViewJavascriptBridge init: ', data, responseCallback);
                        });
                    } catch (e) {
                        console.log(e.message);
                    }
                    bridgeReady = true;
                    fn(WebViewJavascriptBridge);

                }, false);
            }
            // else if (xy.android) {
            //     var _run = function() {
            //         try {
            //             win.WebViewJavascriptBridgeAndroid = win.nuva.require();
            //             bridgeReady = true;
            //             fn(WebViewJavascriptBridgeAndroid);
            //         } catch (e) {
            //             console.log('window.nuva.require出错', e.message);
            //             fn(null);
            //         }
            //     };
            //     //兼容
            //     if (win.nuva) {
            //         _run();
            //     } else {
            //         document.addEventListener('runtimeready', function() {
            //             _run();
            //         }, false);
            //     }
            //     //
            // }
            else {
                return console.log('很抱歉，尚未支持您所持设备');
            }
        },
        type: function (obj) {
            //"Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Window" ,"Constructor"
            return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
        },
        //版本号对比方法，比如判断1.5.0和1.11.0的大小
        /**
         * oldVersion 老版本
         * newVersion 新版本
         * containEqual 是否包含相等的情况
         * result: newVersion >[=] oldVersion
         **/
        compareVersion: function (oldVersion, newVersion, containEqual) {
            if (typeof oldVersion !== 'string' || typeof newVersion !== 'string') {
                return false;
            }
            //分割字符串为['1', '0', '1']格式
            var oldArray = oldVersion.split('.');
            var newArray = newVersion.split('.');
            var o, n;
            //从左向右对比值，值相同则跳过，不同则返回不同的值
            while (o === n && newArray.length > 0) {
                o = oldArray.shift();
                n = newArray.shift();
            }
            //返回不同值的比较结果
            if (containEqual) {
                return (n | 0) >= (o | 0);
            } else {
                return (n | 0) > (o | 0);
            }
        }
    };

    //注册命名空间,"device.notification.alert"生成xy.device.notification.alert
    var ns = function (method, fn) {
        var arr = method.split('.');
        var namespace = xy;
        for (var i = 0, k = arr.length; i < k; i++) {
            if (i === k - 1) {
                namespace[arr[i]] = fn;
            }
            if (typeof namespace[arr[i]] === 'undefined') {
                namespace[arr[i]] = {};
            }
            namespace = namespace[arr[i]];
        }
    };
    //设置默认属性
    function setDefaultValue(obj, defaults, flag) {
        for (var i in defaults) {
            if (flag) {
                obj[i] = defaults[i];
            } else {
                obj[i] = obj[i] !== undefined ? obj[i] : defaults[i];
            }
        }
    }

    //生成器，处理传参、回调以及对特定方法特殊处理
    function generator(method, param) {
        //门神位置
        if (typeof WebViewJavascriptBridge === 'undefined') {
            return console.log('WebViewJavascriptBridge未定义，请在小盈办公app打开该页面');
        }
        //开始干活
        //console.log('调用方法：', method, '传参：', param);
        var p = param || {};
        var successCallback = function (res) {
            console.log('默认成功回调', method, res);
        };
        var failCallback = function (err) {
            console.log('默认失败回调', method, err)
        };
        var cancelCallback = function () {
        };
        if (p.onSuccess) {
            successCallback = p.onSuccess;
            delete p.onSuccess;
        }
        if (p.onError) {
            failCallback = p.onError;
            delete p.onError;
        }
        if (p.onCancel) {
            cancelCallback = p.onCancel;
            delete p.onCancel;
        }
        //统一回调处理
        var callback = function (response) {
            //console.log('统一响应：', response);
            var data = response || {};
            var code = data.errorCode;
            var result = data.result;
            var cbMethod = data.cbMethod;
            if (code === '0') {
                alert('success');
                successCallback && successCallback.call(null, result,cbMethod);
            } else if (code === '-1') {
                cancelCallback && cancelCallback.call(null, result);
            } else {
                failCallback && failCallback.call(null, result, code);
            }
        };
        var watch = false; //是否为监听操作， 如果是监听操作，后面要注册事件
        //前端包装
        switch (method) {
            case 'ui.navigation.setTitle':
                break;
        }

        //消息接入：android和iOS区分处理
        if (watch) {
            WebViewJavascriptBridge.registerHandler(method, function (data, responseCallback) {
                callback({
                    errorCode: '0',
                    errorMessage: '成功',
                    result: data,
                    cbMethod:responseCallback
                });
                //回传给客户端，可选
/*                responseCallback && responseCallback({
                    errorCode: '0',
                    errorMessage: '成功'
                });*/
            });
            WebViewJavascriptBridge.callHandler(method, p);
        } else {
            WebViewJavascriptBridge.callHandler(method, p, callback);
        }
        // if (xy.android) {
        //     var arr = method.split('.');
        //     var suff = arr.pop();
        //     var pre = arr.join('.');
        //     //console.log('Android对接：', pre, suff, p);
        //     WebViewJavascriptBridgeAndroid(successCallback, failCallback, pre, suff, p);
        //     //console.log(successCallback, failCallback, pre, suff, p);
        // } else if (xy.ios) {
        //     //console.log(method, p, callback)
        //     if (watch) {
        //         WebViewJavascriptBridge.registerHandler(method, function(data, responseCallback) {
        //             callback({
        //                 errorCode: '0',
        //                 errorMessage: '成功',
        //                 result: data
        //             });
        //             //回传给客户端，可选
        //             responseCallback && responseCallback({
        //                 errorCode: '0',
        //                 errorMessage: '成功'
        //             });
        //         });
        //         WebViewJavascriptBridge.callHandler(method, p);
        //     } else {
        //         WebViewJavascriptBridge.callHandler(method, p, callback);
        //     }
        // }
    }

    //动态生成api
    METHODS.forEach(function (method) {
        ns(method, function (param) {
            generator(method, param);
        });
    });

    xy.__ns = ns;

    // xy.biz.util.pageClick = function(obj){
    //     var k = 'open_micro_log_record_client';
    //     var visitTime = +new Date();
    //     var corpId = obj.corpId;
    //     var agentId = obj.agentId;
    //     if(!corpId){
    //         corpId = (config&&config.corpId)||'';
    //     }
    //     if (!agentId) {
    //         agentId = (config&&config.agentId)||'';
    //     };
    //
    //     var defaultObj = {
    //         visitTime:visitTime,
    //         clickType:2,
    //         clickButton:obj.clickButton||'',
    //         url:location.href,
    //         corpId:corpId,
    //         agentId:agentId
    //     };
    //     xy.biz.util.ut({
    //         key:k,
    //         value:defaultObj
    //     });
    // }

    function setupWebViewJavascriptBridge(callback) {
        if (win.WebViewJavascriptBridge) {
            return callback(WebViewJavascriptBridge);
        }
        if (win.WVJBCallbacks) {
            return win.WVJBCallbacks.push(callback);
        }
        win.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'https://__bridge_loaded__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function () {
            document.documentElement.removeChild(WVJBIframe)
        }, 0)
    }

    setupWebViewJavascriptBridge(function () {
        console.log('初始化完成')
        console.log(arguments);
    })

    win.xy = xy;

    //国际范儿
    if (typeof module === 'object' && module && typeof module.exports === 'object') {
        module.exports = xy;
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function () {
            return xy;
        })
    }
}(window));
