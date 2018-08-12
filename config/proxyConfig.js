module.exports={
    proxyList:{
        '/api': {
            //测试环境
            target: 'http://10.246.172.77:8199/OilPriceService',
            //是否跨域
            changeOrigin: true,
            //需要rewrite重写
            pathRewrite: {
                '^/api': ''
            }
        }
    },
    // proxyList:{
    //     '/api': {
    //         //测试环境
    //         target: 'http://192.168.137.1:8901/',
    //         //是否跨域
    //         changeOrigin: true,
    //         //需要rewrite重写
    //         pathRewrite: {
    //             '^/api': ''
    //         }
    //     }
    // }
}