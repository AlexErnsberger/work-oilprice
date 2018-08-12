<template>
    <div class="oilPage">
        <div class="priceTable">
            <div class="priceTable-time">更新时间：{{dateTime}}</div>
            <div class="priceTable-title">
                <span >名称</span>
                <span >价格</span>
                <span >涨跌价格</span>
                <span >涨跌幅度</span>
            </div>
            <div v-for="oil in oilPrice" :key="oil.id" class="priceTable-content">
                <span class="priceTable-name">{{oil.oilCode}}</span>
                <span class="priceTable-price">{{oil.unit+oil.price}}</span>
                <span class="priceTable-price-updown">{{oil.unit+oil.diff | priceFormat}}</span>
                <span class="priceTable-price-scope" :class="{down:!(oil.diffRate.toString().indexOf('-'))}">{{oil.diffRate | floatFormat }}</span>
            </div>
            <div class="priceTable-error" v-if="!oilPrice.length">暂无图表信息</div>
        </div>
        <div class="priceGraphic">
            <div class="priceGraphic-title">历史走势图</div>
            <div class="priceGraphic-content">
                <HighCharts :series="historyPriceList"  :options="options" :styles="styles"  ref="simpleChart"></HighCharts>
            </div>
            <div class="priceGraphic-error" v-if="!historyPriceList.length">暂无图表信息</div>
        </div>
    </div>
</template>

<script>
import HighCharts from '@/components/HighCharts'
export default {
    data:function(){
        return{
            oilPrice:[],
            historyPriceList:[],
            dateTime:new Date().toDateString(),
            options:{
                title:{
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval:  24 * 3600 * 1000,
                    dateTimeLabelFormats: {
                        day: '%Y-%m-%d'
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    tickPixelInterval:36,
                    lineWidth: 1,
                    labels:{//标签显示
                        formatter:function(){
                            return this.value+'$';
                        }
                    }
                },
                credits:{
                    enabled: false // 禁用版权信息
                },
            },
            styles: {
              width: 95,
              height: 100
            }
        }
    },
    components:{
        HighCharts
    },
    mounted(){
        this._initData();
    },
    methods:{
        _getTableData:function(){
            this.$http.get('http://10.246.172.77:8199/OilPriceService/oilprices/oilprices').then(({data})=>{
                this.oilPrice=data;
            }).catch(function(error){
                console.log(error)
            })
        },
        _getGrapicData:function(){
            this.$http.get('http://10.246.172.77:8199/OilPriceService/oilPricesForTrendChart(start=2018-04-05 00:00:00,end=2018-04-12 00:00:00)/oilPricesForTrendChart(start=2018-04-05 00:00:00,end=2018-04-12 00:00:00)').then(({data})=>{
                  this.historyPriceList=data;
            }).catch(function(error){
                console.log(error)
            })
        },
        _initData:function(){
            // this.$http.all([this._getTableData,this._getGrapicData]).then(this.$http.spread((res1,res2)=>{
            //     console.log(res1);
            //     console.log(res2);
            // }))
            this.$http.get('http://10.246.172.77:8199/OilPriceService/oilprices').then(({data})=>{
                this.oilPrice=data;
            }).catch(function(error){
                console.log(error)
            })
            this.$http.get('http://10.246.172.77:8199/OilPriceService/oilPricesForTrendChart(start=2018-04-05 00:00:00,end=2018-04-12 00:00:00)').then(({data})=>{
                  this.historyPriceList=data;
            }).catch(function(error){
                console.log(error)
            })
        }
    }
}
</script>

<style>
.oilPage{
    top:48px;
    position: absolute;
    overflow: auto;
    font-size: .3rem;
    width: 100%;
    background: #f7f8f9;
}
.priceTable ,.priceGraphic{
    overflow: hidden;
    border: #c0c0cc solid 0.01rem;
    padding: .2rem;
    margin: .2rem;
    border-radius: .15rem;
    box-shadow: .02rem .02rem #c0c0cc;
    background:#fff;
}
.priceTable{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
.priceTable div{
    width: 100%;
    height: 0.8rem;
    line-height: 0.8rem;
}
.priceTable-time{
    color: #c0c0c0;
    text-align: center;
}
.priceTable-title{
    font-weight: bold;
}
.priceTable-title,.priceTable-content{
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    border-bottom:0.01rem dashed  #c0c0c0 ;
}
.priceTable-title span,.priceTable-content span{
    display: block;
    text-align: center;
    width: 25%;
}
.priceTable-name{
    font-weight: bold;
}
.priceTable-error,.priceGraphic-error{
    text-align: center;
    color: #c0c0cc;
}
.priceTable-price-scope{
    color: green;
}
.down{
    color: red !important;
}
.priceGraphic-title{
    text-align: center;
    font-size: .4rem;
}
</style>
