import { createStore } from 'vuex'
import createPersistedstate from 'vuex-persistedstate'
import cart from './modules/cart'
import category from './modules/category'
import user from './modules/user'
// 创建vuex仓库并导出
export default createStore({
    modules: {
        category,
        cart,
        user
    },
    //   使用vuex持久化插件
    plugins: [
        createPersistedstate({
            key: 'erabbit-client-pc-store',
            paths: ['user', 'cart']
        })
    ]
})
