<template>
    <div class="goods-sku" v-for="(item, index) in goods.specs" :key="index">
        <dl>
            <dt>{{ item.name }}</dt>
            <dd>
                <template v-for="val in item.values" :key="val.name">
                    <img :class="{ selected: val.selected, disabled: val.disabled }" :src="val.picture" @click="changeSku(item, val)" :title="val.name" v-if="val.picture" />
                    <span :class="{ selected: val.selected, disabled: val.disabled }" v-else @click="changeSku(item, val)">{{ val.name }}</span>
                </template>
            </dd>
        </dl>
    </div>
</template>
<script>
import getPowerSet from '@/vender/power-set'
const spliter = '★'
// 根据skus数据得到路径字典对象
const getPathMap = skus => {
    const pathMap = {}
    skus.forEach(sku => {
        // 1. 过滤出有库存有效的sku
        if (sku.inventory) {
            // 2. 得到sku属性值数组
            const specs = sku.specs.map(spec => spec.valueName)
            // 3. 得到sku属性值数组的子集
            const powerSet = getPowerSet(specs)
            // 4. 设置给路径字典对象
            powerSet.forEach(set => {
                const key = set.join(spliter)
                if (pathMap[key]) {
                    // 已经有key往数组追加
                    pathMap[key].push(sku.id)
                } else {
                    // 没有key设置一个数组
                    pathMap[key] = [sku.id]
                }
            })
        }
    })
    return pathMap
}
// 初始化选中状态
const initSelectedStatus = (goods, skuId) => {
    const sku = goods.skus.find(sku => sku.id === skuId)
    if (sku) {
        goods.specs.forEach((spec, i) => {
            const value = sku.specs[i].valueName
            spec.values.forEach(val => {
                val.selected = val.name === value
            })
        })
    }
}
// 得到当前选中规格集合
const getSelectedArr = specs => {
    const selectedArr = []
    specs.forEach(spec => {
        const selectedVal = spec.values.find(val => val.selected)
        selectedArr.push(selectedVal ? selectedVal.name : undefined)
    })
    return selectedArr
}
// 更新按钮禁用状态
const updateDisabledStatus = (specs, pathMap) => {
    // 1.约定每一个按钮的状态由本身的disabled数据来控制
    specs.forEach((item, i) => {
        const selectedValues = getSelectedArr(specs)
        item.values.forEach(val => {
            // 2. 判断当前是否选中，是选中不用判断
            if (val.selected) return
            // 3. 拿当前的值按照顺序套入选中的值数组
            selectedValues[i] = val.name

            // 4. 剔除undefined数据，按照分隔符拼接key
            const key = selectedValues.filter(value => value).join(spliter)
            // 5. 拿着key去路径字典中查找是否有数据，有可以点击，没有就禁用（true）
            val.disabled = !pathMap[key]
        })
    })
}
export default {
    name: 'GoodsSku',
    props: {
        goods: {
            type: Object,
            default: () => ({})
        },
        skuId: {
            type: String,
            default: ''
        }
    },
    setup(props, { emit }) {
        /**
         * 1.选中与取消选中，约定在每一个按钮都拥有自己的选中状态数据：selected
         * 1.1 点击的是已选中，只需要取消当前的选中
         * 1.2 点击的是未选中，把同一个规格的按钮改成未选中，当前点击的改成选中
         */
        const pathMap = getPathMap(props.goods.skus)
        // 根据传入的skuId默认选中规格按钮
        initSelectedStatus(props.goods, props.skuId)
        // 组件初始化的时候更新禁用状态
        updateDisabledStatus(props.goods.specs, pathMap)
        const changeSku = (item, val) => {
            if (val.selected) {
                val.selected = false
            } else {
                item.values.forEach(valItem => {
                    valItem.selected = false
                })
                val.selected = true
            }
            // 点击的时候更新禁用状态
            updateDisabledStatus(props.goods.specs, pathMap)
            // 触发change事件将sku数据传递出去
            const selectedArr = getSelectedArr(props.goods.specs).filter(value => value)
            console.log(selectedArr)
            if (selectedArr.length === props.goods.specs.length) {
                const skuIds = pathMap[selectedArr.join(spliter)]
                const sku = props.goods.skus.find(sku => sku.id === skuIds[0])
                emit('change', {
                    skuId: sku.id,
                    price: sku.price,
                    oldPrice: sku.oldPrice,
                    inventory: sku.inventory,
                    specsTest: sku.specs.reduce((p, n) => `${p} ${n.name}:${n.valueName} `, '').replace(' ', '')
                })
            } else {
                emit('change', {})
            }
        }
        return { changeSku }
    }
}
</script>
<style scoped lang="less">
.sku-state-mixin () {
    border: 1px solid #e4e4e4;
    margin-right: 10px;
    cursor: pointer;
    &.selected {
        border-color: @xtxColor;
    }
    &.disabled {
        opacity: 0.6;
        border-style: dashed;
        cursor: not-allowed;
    }
}
.goods-sku {
    padding-left: 10px;
    padding-top: 20px;
    dl {
        display: flex;
        padding-bottom: 20px;
        align-items: center;
        dt {
            width: 50px;
            color: #999;
        }
        dd {
            flex: 1;
            color: #666;
            > img {
                width: 50px;
                height: 50px;
                .sku-state-mixin ();
            }
            > span {
                display: inline-block;
                height: 30px;
                line-height: 28px;
                padding: 0 20px;
                .sku-state-mixin ();
            }
        }
    }
}
</style>
