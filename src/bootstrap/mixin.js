Vue.mixin({
  computed:{
    $state:function () {
      return this.$store.state
    }
  }
});
