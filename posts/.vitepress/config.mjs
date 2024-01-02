import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'rbackly 的学习笔记本',
  description: 'rbackly 的学习笔记本',
  outDir: '../dist',
  themeConfig: {
    lastUpdated: true,

    outline: {
      level: [1, 6]
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
        text: 'Web3d',
        items: [
          { text: 'Blender 技巧', link: '/web3d/blender-skill' },
          { text: 'threejs 技巧', link: '/web3d/threejs-skill' },
          { text: 'WebGL 着色器案例', link: '/web3d/webgl-shader-case' }
        ]
      },
      {
        text: '工具',
        items: [
          { text: '构建属于自己的穿透工具', link: '/tools/build-behind-nat-firewall-local-server' },
        ]
      },
      {
        text: '临摹低多边形3D场景',
        items: [
          { text: '场景1', link: '/low-polygon-scene/s1' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rbackrock' }
    ]
  }
})
