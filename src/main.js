import Vue from 'vue'
import App from './App.vue'
import axios from 'axios';

Vue.config.productionTip = false

// axios
Vue.prototype.$http = axios.create({
  // baseURL: process.env.BASE_URL,
  baseURL: 'http://localhost:8080',
});

new Vue({
  render: h => h(App),
}).$mount('#Antarus')
