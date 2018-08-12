<template>
    <div class="highcharts-container"></div>
</template>

<script>
import Highcharts from 'highcharts/highstock';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import Highcharts3D from 'highcharts/highcharts-3d';
HighchartsMore(Highcharts)
HighchartsDrilldown(Highcharts);
Highcharts3D(Highcharts);
export default {
    props: ['options','series', 'styles'],
    name: 'highcharts',
    data() {
        return {
            chart: null
        }
    },
    mounted() {
        this.initChart();
    },
    watch:{
        series:function(){
            if(this.series){
                for(let i=0;i<this.series.length;i++){
                    this.chart.addSeries(this.series[i]);
                }
            }
        }
    },
    methods: {
        initChart() {
            Highcharts.setOptions({
                global: {
                    useUTC: false //关闭UTC
                }
            })
            this.$el.style.width = (this.styles.width || 5) + '%';
            this.$el.style.height = (this.styles.height || 5) + '%';
            this.chart = new Highcharts.Chart(this.$el, this.options);
        },
    }
}
</script>

<style>
</style>
