import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
// 导入UI
import UI from '@/components/library'
import 'normalize.css'
import '@/assets/styles/common.less'
import '@/assets/styles/mixins.less'
import '@/assets/styles/variables.less'
createApp(App).use(store).use(router).use(UI).mount('#app')
