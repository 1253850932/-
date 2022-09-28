// 购物车模块
export default {
    namespaced: true,
    state() {
        return {
            // 购物车商品列表
            list: []
        }
    },
    mutations: {
        // 加入购物车
        insertCart(state, payload) {
            // 本地：id skuId name picture price nowPrice count attrsText selected stock isEffective
            // 线上：比上面多 isCollect 有用 discount 无用 两项项信息
            // 插入数据规则
            // 1。先找下是否有相同的商品
            // 2。如果有相同的商品，查询他的数量，累加到payload上，在保存到最新位置，原来的商品需要删除
            // 3。如果没有相同商品，保存到最新位置即可
            const sameIndex = state.list.findIndex(goods => goods.skuId === payload.skuId)
            if (sameIndex > -1) {
                // 拿取相同商品
                const count = state.list[sameIndex].count
                payload.count += count
                // 删除原来
                state.list.splice(sameIndex, 1)
            }
            // 追加新的
            state.list.unshift(payload)
        }
    },
    actions: {
        // 加入购物车
        insertCart(crx, payload) {
            return new Promise((resolve, reject) => {
                // crx.rootState 拿到根状态
                // crx.State 拿到局部状态
                if (crx.rootState.user.profile.toke) {
                    // 已登录
                } else {
                    // 未登录
                    crx.commit('insertCart', payload)
                    resolve()
                }
            })
        }
    }
}
