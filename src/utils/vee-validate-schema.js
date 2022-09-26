// 定义校验规则提供给vee-validate组件使用
export default {
    // 用户名校验
    account(value) {
        // 1. 必填
        if (!value) return '请输入用户名'
        // 2. 6-20个字符，需要以字母开头
        if (!/^[a-zA-Z]\w{5,19}$/.test(value)) return '字母开头且6-20个字符'
        return true
    },
    // 密码校验
    password(value) {
        // 1.必填
        if (!value) return '请输入密码'
        // 2. 6-24个字符
        if (!/^\w{6,24}$/.test(value)) return '密码是6-24个字符'
        return true
    },
    // 手机号校验
    mobile(value) {
        // 1.必填
        if (!value) return '请输入手机号'
        // 2.规则： 1 开头 3~9之间  其余9个数字
        if (!/^1[3-9]\d{9}$/.test(value)) return '请输入正确的手机号'
        return true
    },
    // 验证码校验
    code(value) {
        // 1.必填
        if (!value) return '请输入密码'
        // 2.规则： 6个数字
        if (!/^\d{6}$/.test(value)) return '请输入6位数字的验证码'
        return true
    },
    // 登录协议校验
    isAgree(value) {
        if (!value) return '请勾选登录协议'
        return true
    }
}
