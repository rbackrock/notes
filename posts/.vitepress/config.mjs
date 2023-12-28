import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'rbackly 的学习笔记本',
  description: 'rbackly 的学习笔记本',
  themeConfig: {
    lastUpdated: true,

    outline: {
      level: 'deep'
    },

    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: [
      {
        text: '前端',
        items: [
          { text: 'JavaScript 技巧', link: '/frontend/javascript-skills' },
          { text: '文件相关 WebAPI', link: '/frontend/webapi-file' },
          { text: '节流和防抖', link: '/frontend/throttle-and-debounce' },
        ]
      },
      {
        text: '工具',
        items: [
          { text: '构建属于自己的穿透工具', link: '/tools/build-behind-nat-firewall-local-server' },
        ]
      },
      {
        text: 'Web3d',
        items: [
          { text: 'Blender 技巧', link: '/web3d/blender-skill' },
          { text: 'threejs 技巧', link: '/web3d/threejs-skill' },
          { text: 'WebGL 着色器案例', link: '/web3d/webgl-shader-case' }
        ]
      }
    ],

    footer: {
      message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright: 'Copyright © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rbackrock' }
    ]
  }
})
