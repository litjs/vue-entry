import {
  Vue
} from './lib'

var stateManager = new Vue({
  data: function () {
    return {gState: {}}
  }
})

function registerState(name, state){
  stateManager.$set(stateManager.gState, name, state)
}

function getState(){
  return stateManager.gState
}

export {
  registerState,
  getState
}