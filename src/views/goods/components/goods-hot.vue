<template lang="">
    <div class="goods-hot">
        <h3>{{ title }}</h3>
        <div v-if="goodsHotList">
            <GoodsItem v-for="item in goodsHotList" :key="item.id" :goods="item" />
        </div>
    </div>
</template>
<script>
import GoodsItem from '@/views/category/components/goods-item.vue'
import { findGoodsHot } from '@/api/product'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export default {
    name: 'GoodsHot',
    components: { GoodsItem },
    props: {
        type: {
            type: Number,
            default: 1
        }
    },
    setup(props) {
        const types = { 1: '24小时热销榜', 2: '周热销榜', 3: '总热销榜' }
        const title = computed(() => {
            return types[props.type]
        })

        const route = useRoute()
        // 发请求获取数据
        const goodsHotList = ref([])
        findGoodsHot({ id: route.params.id, type: props.type }).then(data => {
            goodsHotList.value = data.result
        })
        return { title, goodsHotList }
    }
}
</script>
<style lang="less">
.goods-hot {
    h3 {
        height: 70px;
        background: @helpColor;
        color: #fff;
        font-size: 18px;
        line-height: 70px;
        padding-left: 25px;
        margin-bottom: 10px;
        font-weight: normal;
    }
    :deep(.goods-item) {
        background: #fff;
        width: 100%;
        margin-bottom: 10px;
        img {
            width: 200px;
            height: 200px;
        }
        p {
            margin: 0 10px;
        }
        &:hover {
            transform: none;
            box-shadow: none;
        }
    }
}
</style>
