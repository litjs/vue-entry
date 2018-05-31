"use strict";

Vue.mixin({
  computed: {
    $state: function $state() {
      return this.$store.state;
    }
  }
});