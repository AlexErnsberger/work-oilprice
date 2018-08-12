<template>
  <div id="app">
     <div class="header">
        <img src="@/assets/images/toback.png"  @click="goBack"/>
        <span>国际油价</span>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  created:function(){
    this.history_go_back();
  },
  methods:{
    goBack:function(){
      this.historyGoBack();
    }
  }
}
</script>
