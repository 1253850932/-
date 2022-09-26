<template>
    <XtxBread>
        <XtxBreadItem to="/">首页</XtxBreadItem>
        <XtxBreadItem v-if="category.top" :to="`/category/${category.top.id}`">{{ category.top.name }}</XtxBreadItem>
        <transition name="fade-right" mode="out-in">
            <XtxBreadItem v-if="category.sub" :key="category.sub.id">{{ category.sub.name }}</XtxBreadItem>
        </transition>
    </XtxBread>
</template>
<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
export default {
    name: 'SubBread',
    setup(props) {
        // 1. 获取二级分类的ID，在地址在路由中
        const store = useStore()
        const route = useRoute()
        // 2. 获取vuex中的类目数据
        // 3. 通过计算属性得到，二级类目的名称和ID，一级类目的名称和ID
        const category = computed(() => {
            const obj = {}
            store.state.category.list.forEach(top => {
                top.children &&
                    top.children.forEach(sub => {
                        if (sub.id === route.params.id) {
                            // 设置二级类目
                            obj.sub = { id: sub.id, name: sub.name }
                            // 设置 一级类目
                            obj.top = { id: top.id, name: top.name }
                        }
                    })
            })
            return obj
        })
        return { category }
    }
}
</script>
<style lang=""></style>
