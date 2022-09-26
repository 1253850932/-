<template>
    <!-- 筛选区 -->
    <div class="sub-filter" v-if="filterData && !filterLoading">
        <div class="item">
            <div class="head">品牌：</div>
            <div class="body">
                <a @click="changeBrand(brand.id)" :class="{ active: brand.id === filterData.selectedBrand }" href="javascript:;" v-for="brand in filterData.brands" :key="brand.id">{{ brand.name }}</a>
            </div>
        </div>
        <div class="item" v-for="(item, index) in filterData.saleProperties" :key="item.id">
            <div class="head">{{ item.name }}：</div>
            <div class="body">
                <a @click="changeProp(item, prop.id)" :class="{ active: item.selectedBrand === prop.id }" href="javascript:;" v-for="prop in item.properties" :key="prop.id">{{ prop.name }}</a>
            </div>
        </div>
    </div>
    <div v-else class="sub-filter">
        <XtxSkeleton class="item" width="800px" height="40px" />
        <XtxSkeleton class="item" width="800px" height="40px" />
        <XtxSkeleton class="item" width="600px" height="40px" />
        <XtxSkeleton class="item" width="600px" height="40px" />
        <XtxSkeleton class="item" width="600px" height="40px" />
    </div>
</template>
<script>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { findSubCategoryFilter } from '@/api/category'
export default {
    name: 'SubFilter',
    setup(props, { emit }) {
        // 1. 获取数据
        // 2. 数据中需要全部选中，需要预览将来点击激活功能。默认选中全部
        // 3. 完成渲染
        const route = useRoute()
        // 4. 分类发生变化的时候需要重新获取筛选数据，需要使用侦听器
        const filterData = ref(null)
        const filterLoading = ref(false)
        watch(
            () => route.params.id,
            (newVal, odVal) => {
                // 当你从二级分类去顶级分类也会拿到ID，不能去加载数据因为它不是二级分类的ID
                if (newVal && route.path === '/category/sub/' + newVal) {
                    filterLoading.value = true
                    // 品牌全部
                    findSubCategoryFilter(route.params.id).then(data => {
                        data.result.selectedBrand = null
                        data.result.brands.unshift({ id: null, name: '全部' })
                        // 销售属性全部
                        data.result.saleProperties.forEach(item => {
                            item.selectedBrand = null

                            item.properties.unshift({ id: null, name: '全部' })
                        })
                        // 设置修改的数据
                        filterData.value = data.result
                        filterLoading.value = false
                    })
                }
            },
            { immediate: true }
        )
        // 获取筛选参数的函数
        const getFilterParams = () => {
            const obj = { brandId: null, attrs: [] }
            // 品牌
            obj.brandId = filterData.value.selectedBrand
            // 销售属性
            filterData.value.saleProperties.forEach(item => {
                if (item.selectedProp) {
                    const prop = item.properties.find(prop => prop.id === item.selectedProp)
                    obj.attrs.push({ groupName: item.naem, propertyName: prop.name })
                }
            })
            if (obj.attrs.length === 0) obj.attrs = null
            return obj
        }
        // 1.记录当前选择的品牌
        const changeBrand = brandId => {
            if (filterData.value.selectedBrand === brandId) return
            filterData.value.selectedBrand = brandId
            emit('filter-change', getFilterParams())
        }
        // 2。记录当前选择的销售属性
        const changeProp = (item, propId) => {
            if (item.selectedBrand === propId) return
            item.selectedBrand = propId
            emit('filter-change', getFilterParams())
        }
        return { filterData, filterLoading, changeBrand, changeProp }
    }
}
</script>
<style scoped lang="less">
// 筛选区
.sub-filter {
    background: #fff;
    padding: 25px;
    .item {
        display: flex;
        line-height: 40px;
        .head {
            width: 80px;
            color: #999;
        }
        .body {
            flex: 1;
            a {
                margin-right: 36px;
                transition: all 0.3s;
                display: inline-block;
                &.active,
                &:hover {
                    color: @xtxColor;
                }
            }
        }
    }
    .xtx-skeleton {
        padding: 10px 0;
    }
}
</style>
