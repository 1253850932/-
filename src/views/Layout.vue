<template>
    <AppTopNav></AppTopNav>
    <AppHeader></AppHeader>
    <AppHeaderSticky />
    <main class="app-body">
        <!-- 二级路由 -->
        <router-view></router-view>
    </main>
    <AppFooter></AppFooter>
</template>

<script>
import AppTopNav from '@/components/app-topnav'
import AppHeader from '@/components/app-header'
import AppFooter from '@/components/app-footer'
import AppHeaderSticky from '@/components/app-header-sticky'
import { useStore } from 'vuex'
export default {
    name: 'xtx-layout',
    components: { AppTopNav, AppHeader, AppFooter, AppHeaderSticky },
    setup(props) {
        const store = useStore()
        store.dispatch('category/getList')
    }
}
</script>

<style scoped lang="less">
.app-body {
    min-height: 600px;
}
</style>
