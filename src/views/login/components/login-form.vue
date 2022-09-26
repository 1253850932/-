<template>
    <div class="account-box">
        <div class="toggle">
            <a @click="isMsgLogin = false" href="javascript:;" v-if="isMsgLogin"> <i class="iconfont icon-user"></i> 使用账号登录 </a>
            <a @click="isMsgLogin = true" href="javascript:;" v-else> <i class="iconfont icon-msg"></i> 使用短信登录 </a>
        </div>

        <Form ref="target" class="form" :validation-schema="mySchema" autocomplete="off" v-slot="{ errors }">
            <template v-if="!isMsgLogin">
                <div class="form-item">
                    <div class="input">
                        <i class="iconfont icon-user"></i>
                        <Field type="text" v-model="form.account" name="account" placeholder="请输入用户名" />
                    </div>
                    <div v-if="errors.account" :class="{ error: errors.account }"><i class="iconfont icon-warning" />{{ errors.account }}</div>
                </div>
                <div class="form-item">
                    <div class="input">
                        <i class="iconfont icon-lock"></i>
                        <Field type="password" v-model="form.password" name="password" placeholder="请输入密码" />
                    </div>
                    <div v-if="errors.password" :class="{ error: errors.password }"><i class="iconfont icon-warning" />{{ errors.password }}</div>
                </div>
            </template>
            <template v-else>
                <div class="form-item">
                    <div class="input">
                        <i class="iconfont icon-user"></i>
                        <Field type="text" v-model="form.mobile" name="mobile" placeholder="请输入手机号" />
                    </div>
                    <div v-if="errors.mobile" :class="{ error: errors.mobile }"><i class="iconfont icon-warning" />{{ errors.mobile }}</div>
                </div>
                <div class="form-item">
                    <div class="input">
                        <i class="iconfont icon-code"></i>
                        <Field type="text" v-model="form.code" name="code" placeholder="请输入验证码" />
                        <span @click="sendCode()" class="code">
                            {{ timer === 0 ? '发送验证码' : `${timer}秒后发送` }}
                        </span>
                    </div>
                    <div v-if="errors.code" :class="{ error: errors.code }"><i class="iconfont icon-warning" />{{ errors.code }}</div>
                </div>
            </template>
            <div class="form-item">
                <div class="agree">
                    <Field as="XtxCheckbox" name="isAgree" v-model="form.isAgree" />
                    <span>我已同意</span>
                    <a href="javascript:;">《隐私条款》</a>
                    <span>和</span>
                    <a href="javascript:;">《服务条款》</a>
                </div>
                <div v-if="errors.isAgree" :class="{ error: errors.isAgree }"><i class="iconfont icon-warning" />{{ errors.isAgree }}</div>
            </div>
            <a @click="login()" href="javascript:;" class="btn">登录</a>
        </Form>
        <div class="action">
            <img src="https://qzonestyle.gtimg.cn/qzone/vas/opensns/res/img/Connect_logo_7.png" alt="" />
            <div class="url">
                <a href="javascript:;">忘记密码</a>
                <a href="javascript:;">免费注册</a>
            </div>
        </div>
    </div>
</template>
<script>
import { onUnmounted, reactive, ref, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import Schema from '@/utils/vee-validate-schema'
import Message from '@/components/library/Message'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { userAccountLogin, userMobileLoginMsg, userMobileLogin } from '@/api/user'
import { useIntervalFn } from '@vueuse/shared'
export default {
    name: 'LoginForm',
    components: { Form, Field },
    setup() {
        // 切换手机&用户名登录
        const isMsgLogin = ref(false)
        // 表单数据对象
        const form = reactive({
            isAgree: false,
            account: null,
            password: null,
            mobile: null,
            code: null
        })
        // vee-validate 校验规则对象
        // 1.导入Form Field 组件 将form和input进行替换，需要加上name用来指定的将来的校验规则函数
        // 2.Field 需要进行数据绑定，字段名称最好跟后台接口一致
        // 3.定义Field的name属性指定的校验规则函数，Form提供的已定义好的validation-schema 校验规则对象
        // 4.自定义组件需要校验必须先支持v-model，然后Field使用 as 指定位组件名称
        const mySchema = {
            // 校验函数规则，返回true就是校验成功，返回字符串就是校验失败，该返回的字符串就是错误信息
            account: Schema.account,
            password: Schema.password,
            mobile: Schema.mobile,
            code: Schema.code,
            isAgree: Schema.isAgree
        }

        // 监听isMsgLogin重置表单（数据+清除校验结果）
        const target = ref(null)
        watch(isMsgLogin, () => {
            // 重置数据
            form.isAgree = false
            form.account = null
            form.password = null
            form.mobile = null
            form.code = null
            // 如果没有销毁Field组件，之前的校验结果不会清除  例如：v-show切换的
            // Form组件提供了 resetForm 函数清除校验结果
            target.value.resetForm()
        })

        const store = useStore()
        const router = useRouter()
        const route = useRoute()
        // 需要在点击登录的时候对整体表单进行校验
        const login = async () => {
            // Form组件提供了 validate 函数进行整体表单校验，返回的promise

            const valid = await target.value.validate()
            if (valid) {
                try {
                    let data = null
                    if (isMsgLogin.value) {
                        // 手机号登录
                        /**
                         * 1.发送验证码
                         * 1.1 绑定发送验证码按钮点击事件
                         * 1.2 校验手机号，如果成功才去发送验证码（定义API），请求成功开启60s的倒计时，不能再次点击
                         *     倒计时结束后，恢复原样，可以再次点击
                         * 1.3 如果失败，失败的校验样式显示出来
                         * 2. 手机号登录
                         * 2.1.准备一个api做手机号登录
                         * 2.2.调用api
                         * 2.3.成功,跳转至来源页或首页 + 消息提示
                         * 2.4.失败,消息提示
                         */
                        const { mobile, code } = form
                        data = await userMobileLogin({ mobile, code })
                    } else {
                        // 账号登录
                        // 1.准备一个api做账号登录
                        // 2.调用api
                        // 3.成功,跳转至来源页或首页 + 消息提示
                        // 4.失败,消息提示
                        const { account, password } = form
                        data = await userAccountLogin({ account, password })
                        console.log(data)
                    }
                    // 存储用户信息
                    const { id, account, password, nickname, token, avatar } = data.result
                    store.commit('user/setUser', { id, account, password, nickname, token, avatar })
                    // 进行跳转
                    router.push(route.query.redirectUrl || '/')
                    // 消息提示
                    Message({ type: 'success', text: '登录成功' })
                } catch (e) {
                    Message({ type: 'error', text: e.response.data.message || '登录失败' })
                }
            }
        }

        const timer = ref(0)
        // pause 暂停 resume 开始
        // useIntervalFn(回调函数,执行间隔,是否立即开启)
        const { pause, resume } = useIntervalFn(
            () => {
                timer.value--
                if (timer.value <= 0) pause()
            },
            1000,
            false
        )
        onUnmounted(() => {
            pause()
        })
        // 发送验证码
        const sendCode = async () => {
            const valid = Schema.mobile(form.mobile)
            // 校验通过
            if (valid === true) {
                // 没有倒计时
                if (timer.value === 0) {
                    await userMobileLoginMsg(form.mobile)
                    Message({ type: 'success', text: '发送成功' })
                    timer.value = 60
                    resume()
                }
            } else {
                // 校验失败  使用vee的错误函数 setFieldError(字段，错误信息)
                target.value.setFieldError('mobile', valid)
            }
        }
        return { isMsgLogin, form, mySchema, target, timer, sendCode, login }
    }
}
</script>
<style lang="less">
// 账号容器
.account-box {
    .toggle {
        padding: 15px 40px;
        text-align: right;
        a {
            color: @xtxColor;
            i {
                font-size: 14px;
            }
        }
    }
    .form {
        padding: 0 40px;
        &-item {
            margin-bottom: 28px;
            .input {
                position: relative;
                height: 36px;
                > i {
                    width: 34px;
                    height: 34px;
                    background: #cfcdcd;
                    color: #fff;
                    position: absolute;
                    left: 1px;
                    top: 1px;
                    text-align: center;
                    line-height: 34px;
                    font-size: 18px;
                }
                input {
                    padding-left: 44px;
                    border: 1px solid #cfcdcd;
                    height: 36px;
                    line-height: 36px;
                    width: 100%;
                    &.error {
                        border-color: @priceColor;
                    }
                    &.active,
                    &:focus {
                        border-color: @xtxColor;
                    }
                }
                .code {
                    position: absolute;
                    right: 1px;
                    top: 1px;
                    text-align: center;
                    line-height: 34px;
                    font-size: 14px;
                    background: #f5f5f5;
                    color: #666;
                    width: 90px;
                    height: 34px;
                    cursor: pointer;
                }
            }
            > .error {
                position: absolute;
                font-size: 12px;
                line-height: 28px;
                color: @priceColor;
                i {
                    font-size: 14px;
                    margin-right: 2px;
                }
            }
        }
        .agree {
            a {
                color: #069;
            }
        }
        .btn {
            display: block;
            width: 100%;
            height: 40px;
            color: #fff;
            text-align: center;
            line-height: 40px;
            background: @xtxColor;
            &.disabled {
                background: #cfcdcd;
            }
        }
    }
    .action {
        padding: 20px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .url {
            a {
                color: #999;
                margin-left: 10px;
            }
        }
    }
}
</style>
