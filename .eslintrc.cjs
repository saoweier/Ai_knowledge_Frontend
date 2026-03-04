/* eslint config for Vue 3 + <script setup> */
module.exports = {
  root: true,
  env: { node: true, browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  // 关键：把 <script setup> 宏标记为全局只读
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  rules: {
    // 如果你想严格，就把这一行删掉
    'no-undef': 'off'
  }
}
