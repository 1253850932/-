<template lang="">
    <div class="goods-comment" v-if="commentInfo">
        <div class="head">
            <div class="data">
                <p>
                    <span>{{ commentInfo.salesCount }}</span
                    ><span>人购买</span>
                </p>
                <p>
                    <span>{{ commentInfo.praisePercent }}</span
                    ><span>好评率</span>
                </p>
            </div>
            <div class="tags">
                <div class="dt">大家都在说：</div>
                <div class="dd">
                    <a href="javascript:;" :class="{ active: currentTag === index }" @click="changeTag(index)" v-for="(item, index) in commentInfo.tags" :key="index"
                        >{{ item.title }}（{{ item.tagCount }}）</a
                    >
                </div>
            </div>
        </div>
        <!-- 排序 -->
        <div class="sort" v-if="commentInfo">
            <span>排序：</span>
            <a href="javascript:;" @click="changSort(null)" :class="{ active: reqParams.sortField === null }">默认</a>
            <a href="javascript:;" @click="changSort('praiseCount')" :class="{ active: reqParams.sortField === 'praiseCount' }">最新</a>
            <a href="javascript:;" @click="changSort('createTime')" :class="{ active: reqParams.sortField === 'createTime' }">最热</a>
        </div>
        <!-- 列表 -->
        <div class="list" v-if="commentList">
            <div class="item" v-for="(item, index) in commentList" :key="index">
                <div class="user">
                    <img :src="item.member.avatar" alt="" />
                    <span>{{ formatNickName(item.member.nickname) }}</span>
                </div>
                <div class="body">
                    <div class="score">
                        <i v-for="i in item.score" :key="i + 's'" class="iconfont icon-wjx01"></i>

                        <i v-for="i in 5 - item.score" :key="i + 'n'" class="iconfont icon-wjx02"></i>
                        <span class="attr">{{ formatSpecs(item.orderInfo.specs) }}</span>
                    </div>
                    <div class="text">
                        {{ item.content }}
                        <GOodsCommentImage v-if="item.pictures.length" :pictures="item.pictures" />
                    </div>
                    <div class="time">
                        <span>{{ item.createTime }}</span>
                        <span class="zan"><i class="iconfont icon-dianzan"></i>{{ item.praiseCount }}</span>
                    </div>
                </div>
            </div>
        </div>
        <XtxPagination v-if="total" @current-change="changePageFn" :total="total" :page-size="reqParams.pageSize" :current-page="reqParams.page" />
    </div>
</template>
<script>
import { findGoodsCommentInfo, findGoodsCommentList } from '@/api/product'
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import GOodsCommentImage from './goods-comment-image.vue'
export default {
    name: 'GoodsComment ',
    components: { GOodsCommentImage },
    setup() {
        // 获取商品评价数据
        const commentInfo = ref(null)
        const router = useRoute()
        const goodsId = router.params.id
        findGoodsCommentInfo(goodsId).then(data => {
            // 设置数组之前，tags数组前追加 有图tag 全部评价tag
            data.result.tags.unshift({ title: '全部评价', tagCount: data.result.evaluateCount, type: 'all' }, { title: '有图', tagCount: data.result.hasPictureCount, type: 'picture' })
            commentInfo.value = data.result
        })

        // 激活tag
        const currentTag = ref(0)
        // 改变tag索引
        const changeTag = index => {
            currentTag.value = index
            // 点击tag ，修改筛选条件
            const tag = commentInfo.value.tags[index]
            // 情况1： 全部评价
            // 情况2： 有图
            // 情况3： 正常tag
            if (tag.type === 'all') {
                reqParams.hasPicture = null
                reqParams.tag = null
            } else if (tag.type === 'picture') {
                reqParams.hasPicture = true
                reqParams.tag = null
            } else {
                reqParams.hasPicture = true
                reqParams.tag = tag.title
            }
            // 页码重置到 1
            reqParams.page = 1
        }

        // 点击排序
        const changSort = sortField => {
            reqParams.sortField = sortField
            // 页码重置到 1
            reqParams.page = 1
        }

        // 筛选条件准备
        const reqParams = reactive({
            page: 1,
            pageSize: 10,
            hasPicture: null,
            tag: null,
            sortField: null
        })
        // 初始化需要发请求，筛选条件发生改变发请求
        const commentList = ref([])
        const total = ref(0)
        watch(
            reqParams,
            () => {
                findGoodsCommentList(goodsId, reqParams).then(data => {
                    commentList.value = data.result.items
                    total.value = data.result.counts
                })
            },
            { immediate: true }
        )

        // 定义转换数据的函数（vue2.0 过滤器）
        const formatSpecs = specs => {
            return specs.reduce((p, c) => `${p} ${c.name}： ${c.nameValue}`, '').trim()
        }
        // 定义转换nickname
        const formatNickName = nickname => {
            return nickname.substr(0, 1) + '****' + nickname.substr(-1)
        }

        // 实现分页切换
        const changePageFn = newPage => {
            reqParams.page = newPage
        }
        return { commentInfo, currentTag, changeTag, reqParams, commentList, changSort, formatSpecs, formatNickName, total, changePageFn }
    }
}
</script>
<style lang="less">
.goods-comment {
    .head {
        display: flex;
        padding: 30px 0;
        .data {
            width: 340px;
            display: flex;
            padding: 20px;
            p {
                flex: 1;
                text-align: center;
                span {
                    display: block;
                    &:first-child {
                        font-size: 32px;
                        color: @priceColor;
                    }
                    &:last-child {
                        color: #999;
                    }
                }
            }
        }
        .tags {
            flex: 1;
            display: flex;
            border-left: 1px solid #f5f5f5;
            .dt {
                font-weight: bold;
                width: 100px;
                text-align: right;
                line-height: 42px;
            }
            .dd {
                flex: 1;
                display: flex;
                flex-wrap: wrap;
                > a {
                    width: 132px;
                    height: 42px;
                    margin-left: 20px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    border: 1px solid #e4e4e4;
                    background: #f5f5f5;
                    color: #999;
                    text-align: center;
                    line-height: 40px;
                    &:hover {
                        border-color: @xtxColor;
                        background: lighten(@xtxColor, 50%);
                        color: @xtxColor;
                    }
                    &.active {
                        border-color: @xtxColor;
                        background: @xtxColor;
                        color: #fff;
                    }
                }
            }
        }
    }
    .sort {
        height: 60px;
        line-height: 60px;
        border-top: 1px solid #f5f5f5;
        border-bottom: 1px solid #f5f5f5;
        margin: 0 20px;
        color: #666;
        > span {
            margin-left: 20px;
        }
        > a {
            margin-left: 30px;
            &.active,
            &:hover {
                color: @xtxColor;
            }
        }
    }
    .list {
        padding: 0 20px;
        .item {
            display: flex;
            padding: 25px 10px;
            border-bottom: 1px solid #f5f5f5;
            .user {
                width: 160px;
                img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                }
                span {
                    padding-left: 10px;
                    color: #666;
                }
            }
            .body {
                flex: 1;
                .score {
                    line-height: 40px;
                    .iconfont {
                        color: #ff9240;
                        padding-right: 3px;
                    }
                    .attr {
                        padding-left: 10px;
                        color: #666;
                    }
                }
            }
            .text {
                color: #666;
                line-height: 24px;
            }
            .time {
                color: #999;
                display: flex;
                justify-content: space-between;
                margin-top: 5px;
            }
        }
    }
}
</style>
