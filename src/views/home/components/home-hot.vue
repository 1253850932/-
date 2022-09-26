<template>
    <div class="home-new">
        <HomePanel title="人气推荐" sub-title="人气爆款 不容错过">
            <div ref="target" style="position: relative; height: 426px">
                <Transition name="fade">
                    <ul v-if="goods.length" ref="pannel" class="goods-list">
                        <li v-for="item in goods" :key="item.id">
                            <RouterLink to="/">
                                <img v-lazyload="item.picture" alt="" />
                                <p class="name">{{ item.title }}</p>
                                <p class="desc">{{ item.alt }}</p>
                            </RouterLink>
                        </li>
                    </ul>
                    <HomeSkeleton v-else />
                </Transition>
            </div>
        </HomePanel>
    </div>
</template>
<script>
import { ref } from 'vue'
import HomePanel from './home-panel'
import HomeSkeleton from './home-skeleton'
import { findHot } from '@/api/home'
import { useLazyData } from '@/hooks'
export default {
    name: 'HomeNew',
    components: { HomePanel, HomeSkeleton },
    setup() {
        // const goods = ref([])
        // findHot().then(data => {
        //     goods.value = data.result
        // })
        const { target, result } = useLazyData(findHot)
        return { goods: result, target }
    }
}
</script>
<style lang="less">
.goods-list {
    display: flex;
    justify-content: space-between;
    height: 406px;
    li {
        width: 306px;
        height: 406px;
        background: #f0f9f4;
        .hoverShadow();
        img {
            width: 306px;
            height: 306px;
        }
        p {
            font-size: 22px;
            padding: 12px 30px 0 30px;
            text-align: center;
        }
        .price {
            color: @priceColor;
        }
    }
}
</style>