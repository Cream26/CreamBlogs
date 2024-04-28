import { createApp } from 'vue';
import store from './store/index.js'

import App from './App.vue';
import router from './router/index.js';


import firebase from "firebase/app";
import "firebase/auth";
import db from "./firebase/firebaseInit.js";
import loading from './components/loading.vue';


const app =  createApp(App).use(router).use(store).mount('#app');;

