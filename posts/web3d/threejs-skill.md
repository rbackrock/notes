### 常见优化方法

```js
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  // 开启抗锯齿
  antialias: true,
  // 如果发现地面和建筑物交接面有闪动尝试修改 `WebGLRenderer` 的构造函数属性 `logarithmicDepthBuffer`
  logarithmicDepthBuffer: true
})
```

### 根据曲线路径进行物体移动

根据曲线拿出所有顶点的位置坐标，重新创建一条平滑的三维样条曲线(CatmullRomCurve3)，然后物体跟随曲线运动

示例代码

```js
gltfLoader.load('/model/test.glb', gltf => {
  gltf.scene.traverse(child => {
    if (child.name === '运动曲线') {
      const points = []
      const linePathPosition = child.geometry.attributes.position
      for (let i = 0; i < linePathPosition.count; i++) {
        points.push(new THREE.Vector3(
          linePathPosition.getX(i),
          linePathPosition.getY(i),
          linePathPosition.getZ(i)
        ))
      }

      const boxCube = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({
        color: 0xcccccc
      })
      const box = new THREE.Mesh(boxCube, material)
      scene.add(box)

      const path  = new THREE.CatmullRomCurve3(points)
      const animate = {
        process: 0
      }
      gsap.to(animate, {
        process: 1,
        duration: 3,
        repeat: -1,
        onUpdate: () => {
          const point = path.getPoint(animate.process)
          box.position.set(point.x, point.y, point.z)
        }
      })
    }
  })
})
```

事先定义的曲线路径需要在 Blender 中把原点设置为世界原点，然后设置朝向，例如：
```js
const lootAtPoint = truckPath.getPoint(0.3)
this.mesh.lookAt(lootAtPoint.x, 0, lootAtPoint.z)
```

### 让物体轮廓发白光达到选中的效果

使用 `threejs` 的后期处理器，`OutlinePass`

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

// ...
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
)
composer.addPass(outlinePass)

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000
})
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)
outlinePass.selectedObjects = [box]

renderer.setAnimationLoop(() => {
  composer.render()
})

```

### 实现用 HTML + CSS 画出界面用于平面集合体纹理

更好的办法其实是使用 `CSS3DRenderer`

实现思路：利用 `html-to-image` 类库把写好的界面生成图片，用生成好的图片替换材质，需要注意的是，使用 `html-to-image` 需要保证界面在可视化区域内，在可视化区域外无法正确生成图片。不过可以利用 `z-index` 属性叠在最底层，让其看不见隐藏起来

### 使用 `postprocessing` 中 `outline` 特效需要注意事项

* 注意物体之间的父子级关系，如果指定子级物体，将会没有效果，`outline` 不支持有父子级关系。解决办法为在 `OutlinePass` 对象是设置 `renderScene` 属性为需要的 `Object3d` 对象即可
* 如果网格类型是 `Gourp` 那么一样没有选取效果

### 获取想要的固定视角

相机所处的位置由 `position` 和 `quaternion` 决定，所以在渲染循环体里打印相机 `position` 和 `quaternion` 的值，在场景里选出想要的画面，这时候停止控制，等控制台输出一会儿（有时候会不停的改变这两个属性值，等到稳定下来），复制出这两个属性值就可以当作，固定视角来使用了

### 想要子级网格按照世界坐标系进行位移的方法

实现思路为先把要操作的子级网格使用 `.attach` 方法添加到 `scene` 中，开始进行变换，变换之后，再次使用 `.attach` 添加到原有父级对象即可，例如

```js
scene.attach(childObject3d)
childObject3d.position.x = object3d.position.x + 3
parent.attach(childObject3d)
```
