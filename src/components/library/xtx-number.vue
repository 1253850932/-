<template>
    <div class="xtx-numbox">
        <div class="label" v-if="label">{{ label }}</div>
        <div class="numbox">
            <a @click="changeNum(-1)" href="javascript:;">-</a>
            <input type="text" readonly :value="count" />
            <a @click="changeNum(1)" href="javascript:;">+</a>
        </div>
    </div>
</template>
<script>
import { useVModel } from '@vueuse/core'

export default {
    name: 'XtxNumber',
    props: {
        label: {
            type: String,
            default: ''
        },
        modelValue: {
            type: Number,
            default: 1
        },
        minVal: {
            type: Number,
            default: 1
        },
        maxVal: {
            type: Number,
            default: 10
        }
    },
    setup(props, { emit }) {
        const count = useVModel(props, 'modelValue', emit)
        // 1.绑定按钮点击时间，- 按钮 + 按钮 触发同一个函数，同一个事件
        // 2.使用vueuse的useVModel做数据绑定，修改count 通知父组件
        const changeNum = step => {
            const newVal = count.value + step
            // 3. 得到将要修改的值，对于不合法终止程序
            if (newVal < props.minVal || newVal > props.maxVal) return
            // 4. 改值
            count.value = newVal
            // 5. 提供change事件
            emit('change', newVal)
        }
        return { changeNum, count }
    }
}
</script>
<style scoped lang="less">
.xtx-numbox {
    display: flex;
    align-items: center;
    .label {
        width: 60px;
        color: #999;
        padding-left: 10px;
    }
    .numbox {
        width: 120px;
        height: 30px;
        border: 1px solid #e4e4e4;
        display: flex;
        > a {
            width: 29px;
            line-height: 28px;
            text-align: center;
            background: #f8f8f8;
            font-size: 16px;
            color: #666;
            &:first-of-type {
                border-right: 1px solid #e4e4e4;
            }
            &:last-of-type {
                border-left: 1px solid #e4e4e4;
            }
        }
        > input {
            width: 60px;
            padding: 0 5px;
            text-align: center;
            color: #666;
        }
    }
}
</style>
