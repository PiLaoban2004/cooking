// ===========================
// 应用入口
// ===========================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vant 组件按需引入（这里用全局样式保证移动端体验）
import {
  Button,
  Icon,
  Cell,
  CellGroup,
  Field,
  Form,
  Search,
  Tag,
  Toast,
  Dialog,
  Overlay,
  Loading,
  Swipe,
  SwipeItem,
  Tabbar,
  TabbarItem,
  NavBar,
  Popup,
  ActionSheet,
  Empty,
  PullRefresh,
  List,
  Stepper,
  Uploader
} from 'vant'

// 全局样式
import './styles/global.scss'
// Vant 基础样式
import 'vant/lib/index.css'

const app = createApp(App)

// 注册 Vant
const vantComponents = [
  Button, Icon, Cell, CellGroup, Field, Form, Search, Tag,
  Toast, Dialog, Overlay, Loading, Swipe, SwipeItem,
  Tabbar, TabbarItem, NavBar, Popup, ActionSheet, Empty,
  PullRefresh, List, Stepper, Uploader
]
vantComponents.forEach(c => app.use(c))

app.use(createPinia())
app.use(router)

app.mount('#app')
