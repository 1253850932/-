<template>
    <div class="xtx-goods-page" v-if="goods">
        <div class="container">
            <!-- 面包屑 -->
            <XtxBread>
                <XtxBreadItem to="/">首页</XtxBreadItem>
                <XtxBreadItem :to="`/category/${goods.categories[1].id}`">{{ goods.categories[1].name }}</XtxBreadItem>
                <XtxBreadItem :to="`/category/sub/${goods.categories[0].id}`">{{ goods.categories[0].name }}</XtxBreadItem>
                <XtxBreadItem to="/">{{ goods.name }}</XtxBreadItem>
            </XtxBread>
            <!-- 商品信息 -->
            <div class="goods-info">
                <div class="media">
                    <GoodsImage :images="goods.mainPictures"></GoodsImage>
                    <GoodsSales :goods="goods" />
                </div>
                <div class="spec">
                    <!-- 名字区组件 -->
                    <GoodsName :goods="goods" />
                    <!-- 规格组件 -->
                    <GoodsSku :goods="goods" @change="changeSku" />
                    <!-- 数量选择组件 -->
                    <XtxNumber v-model="count" :minVal="1" :maxVal="goods.inventory" label="数量" />
                    <!-- 按钮组件 -->
                    <XtxButton type="primary" style="margin-top: 20px"> 加入购物车</XtxButton>
                </div>
            </div>
            <!-- 商品推荐 -->
            <GoodsRelevant v-if="goods" :goodsId="goods.id" />
            <!-- 商品详情 -->
            <div class="goods-footer">
                <div class="goods-article">
                    <!-- 商品+评价 -->
                    <GoodsTabs />
                    <!-- 注意事项 -->
                    <GoodsWarn />
                </div>
                <!-- 24热榜+专题推荐 -->
                <div class="goods-aside">
                    <GoodsHot />
                    <GoodsHot :type="2" />
                    <GoodsHot :type="3" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GoodsRelevant from './components/goods-relevant'
import GoodsSales from './components/goods-sales'
import GoodsName from './components/goods-name'
import GoodsImage from './components/goods-image'
import GoodsSku from './components/goods-sku'
import GoodsHot from './components/goods-hot'
import GoodsTabs from './components/goods-tabs'
import GoodsWarn from './components/goods-warn'
import { useRoute } from 'vue-router'
import { findGoods } from '@/api/product'
import { ref, watch, nextTick, provide } from 'vue'

export default {
    name: 'XtxGoodsPage',
    components: { GoodsRelevant, GoodsImage, GoodsSales, GoodsName, GoodsSku, GoodsTabs, GoodsHot, GoodsWarn },
    setup(props) {
        // 1.获取商品详情，进行渲染
        const goods = useGoods()
        // sku改变时候触发
        const changeSku = sku => {
            if (sku.skuId) {
                goods.value.price = sku.price
                goods.value.oldPrice = sku.oldPrice
                goods.value.inventory = sku.inventory
            }
        }

        // 选择的数量
        const count = ref(1)
        // 传递goods数据
        provide('goods', goods)
        return { goods, changeSku, count }
    }
}
// 获取商品详情
const useGoods = () => {
    const goods = ref(null)
    const route = useRoute()
    // 出线路由地址商品ID发生变化，但是不会重新初始化组件
    watch(
        () => route.params.id,
        newVal => {
            if (newVal && `/product/${newVal}`) {
                findGoods(route.params.id).then(data => {
                    // 让商品数据为null让后使用v-if的组件可以重新销毁和创建
                    goods.value = null
                    nextTick(() => {
                        goods.value = data.result
                    })
                })
            }
        },
        { immediate: true }
    )
    return goods
}
</script>

<style scoped lang="less">
.goods-info {
    min-height: 600px;
    background: #fff;
    display: flex;
    .media {
        width: 580px;
        height: 600px;
        padding: 30px 50px;
    }
    .spec {
        flex: 1;
        padding: 30px 30px 30px 0;
    }
}
.goods-footer {
    display: flex;
    margin-top: 20px;
    .goods-article {
        width: 940px;
        margin-right: 20px;
    }
    .goods-aside {
        width: 280px;
        min-height: 1000px;
    }
}
.goods-tabs {
    min-height: 600px;
    background: #fff;
}
.goods-warn {
    min-height: 600px;
    background: #fff;
    margin-top: 20px;
}
</style>
