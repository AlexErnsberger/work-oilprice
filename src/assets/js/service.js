export default {
    install:function(Vue,options){

        Vue.filter('priceFormat',function(value){
            if(value){
                if(value.indexOf('-')){
                    value='-'+value.replace(/\-/g,'');
                    return value;
                }
            }
        });

        Vue.filter('floatFormat',function(value){
            if(value){
                return  Math.round((value*100)*1000)/1000+'%';
            }
        });


        Vue.prototype.historyGoBack = function () {
            this.back_from_js();
          };
        
        Vue.prototype.back_from_js = function(){
            if (xy.version) {
                xy.ready(function (bridge) {
                bridge.callHandler("back_from_js",{},function(){
                    console.info("成功回调");
                });
                })
            }else {
                alert("请在小盈办公APP中打开此页面")
            }
        }
        Vue.prototype.history_go_back = function(){
            var self = this;
            if (xy.version) {
                xy.ready(function (bridge) {
                bridge.registerHandler("android_back", function (data, responseCallback) {
                    self.historyGoBack();
                });
                })
            }else {
                alert("请在小盈办公APP中打开此页面")
            }
        }
    }
}