### 建筑物纯色模型颜色渐变

```js
const boxGeometry = new THREE.BoxGeometry(1, 3, 1)
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0x0C0E6F
})

boxGeometry.computeBoundingBox()
const { min, max } = boxGeometry.boundingBox
const uHeight = max.y - min.y

boxMaterial.onBeforeCompile = shader => {
  // 模型最大高度
  shader.uniforms.uHeight = {
    value: uHeight
  }
  // 模型顶部部分的颜色
  shader.uniforms.uTopColor = {
    value: new THREE.Color('#ffffff')
  }

  // 顶点着色器声明
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
    `
  )

  // 顶点着色器逻辑
  shader.vertexShader = shader.vertexShader.replace(
    `#include <fog_vertex>`,
    `
      #include <fog_vertex>
      vPosition = position;
    `
  )

  // 片元着色器声明
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
      uniform float uHeight;
      uniform vec3 uTopColor;
    `
  )

  // 片元着色器逻辑
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <dithering_fragment>`,
    `
      #include <dithering_fragment>
      vec4 distGradColor = gl_FragColor;
      float gradMixPercentage = (vPosition.y + uHeight / 2.0) / uHeight;
      vec3 gradMixColor = mix(distGradColor.xyz, uTopColor, gradMixPercentage);
      gl_FragColor = vec4(gradMixColor, 1);
    `
  )
}

const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)
```

### 设置目标点且动态光圈扩散

```js
material.onBeforeCompile = shader => {
  shader.uniforms.uSpreadCenter = {
    value: new THREE.Vector2(0, 0)
  }
  shader.uniforms.uSpreadTime = {
    value: 0
  }
  shader.uniforms.uSpreadWidth = {
    value: 0.001
  }

  // 顶点着色器声明
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
    `
  )

  // 顶点着色器逻辑
  shader.vertexShader = shader.vertexShader.replace(
    `#include <fog_vertex>`,
    `
      #include <fog_vertex>
      vPosition = position;
    `
  )

  // 片元着色器声明
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
      uniform vec2 uSpreadCenter;
      uniform float uSpreadTime;
      uniform float uSpreadWidth;
    `
  )

  // 片元着色器逻辑
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <dithering_fragment>`,
    `
      #include <dithering_fragment>
      float spreadRadius = distance(vPosition.xz, uSpreadCenter);
      float spreadIndex = -(spreadRadius - uSpreadTime) * (spreadRadius - uSpreadTime) + uSpreadWidth;

      if (spreadIndex > 0.0) {
        gl_FragColor = mix(gl_FragColor, vec4(1, 1, 1, 1), spreadIndex / uSpreadWidth);
      }
    `
  )

  gsap.to(shader.uniforms.uSpreadTime, {
    value: 3,
    duration: 3,
    ease: 'none',
    repeat: -1
  })

  /**
   * uniforms
   * uSpreadCenter - 中心点，平面二维向量
   * uSpreadTime - 扩算时间
   * uSpreadWidth - 光圈宽度
   * 
   * 动画开始时的 uSpreadTime 和结束时的 uSpreadTime 有特殊意义
   * # 如果动画开始时的 uSpreadTime 小于结束时的 uSpreadTime 表示光圈向外扩散，反之则向内扩散
   * # 动画开始时的 uSpreadTime 和结束时的 uSpreadTime 差值越小光圈扩散的范围越小，反之越大
   * 
   */
}
```

### 全模型扫描线

```js
material.onBeforeCompile = shader => {
  shader.uniforms.uTime = {
    value: 0
  }
  shader.uniforms.uLineWidth = {
    value: 0.001
  }

  // 顶点着色器声明
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
    `
  )

  // 顶点着色器逻辑
  shader.vertexShader = shader.vertexShader.replace(
    `#include <fog_vertex>`,
    `
      #include <fog_vertex>
      vPosition = position;
    `
  )

  // 片元着色器声明
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
      uniform float uTime;
      uniform float uLineWidth;
    `
  )

  // 片元着色器逻辑
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <dithering_fragment>`,
    `
      #include <dithering_fragment>

      // 斜着扫描
      // float lineMix = -(vPosition.x + vPosition.z - uTime) * (vPosition.x + vPosition.z - uTime) + uLineWidth;
      // 横着扫描
      float lineMix = -(vPosition.x - uTime) * (vPosition.x - uTime) + uLineWidth;
      if(lineMix > 0.0) {
        gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, 1.0), lineMix / uLineWidth);
      }
    `
  )

  gsap.to(shader.uniforms.uTime, {
    value: 30,
    duration: 3,
    ease: 'none',
    repeat: -1
  })

  /**
   * uniforms
   * uTime 扫描时间
   * 
   * 动画中需要的 uTime 开始时间和结束时间有意义
   * # uTime 开始时间和结束时间差值决定着扫描线从哪里开始，如果开始时间是 0 代表从世界中心开始扫描
   * 
   */
}
```

### 建筑物从下往上扫描特效

```js
material.onBeforeCompile = shader => {
  shader.uniforms.uTime = {
    value: 0
  }
  shader.uniforms.uTopWidth = {
    value: 0.1
  }

  // 顶点着色器声明
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
    `
  )

  // 顶点着色器逻辑
  shader.vertexShader = shader.vertexShader.replace(
    `#include <fog_vertex>`,
    `
      #include <fog_vertex>
      vPosition = position;
    `
  )

  // 片元着色器声明
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <common>`,
    `
      #include <common>
      varying vec3 vPosition;
      uniform float uTime;
      uniform float uTopWidth;
    `
  )

  // 片元着色器逻辑
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <dithering_fragment>`,
    `
      #include <dithering_fragment>

      float toTopMix = -(vPosition.y - uTime) * (vPosition.y - uTime) + uTopWidth;
    
      if(toTopMix > 0.0){
        gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, 1.0), toTopMix / uTopWidth);
      }
    `
  )

  gsap.to(shader.uniforms.uTime, {
    value: 3,
    duration: 3,
    ease: 'none',
    repeat: -1
  })
}
```

### 两点之间飞线

```js
const linePoints = [
  // 起点
  new THREE.Vector3(0, 0, 0),
  // 曲线高峰点
  new THREE.Vector3(-5, 4, 0),
  // 终点
  new THREE.Vector3(-10, 0, 0)
]

const lineCurve = new THREE.CatmullRomCurve3(linePoints)
const points = lineCurve.getPoints(1000)
const flyLineGeometry = new THREE.BufferGeometry().setFromPoints(points)

const aSizeArray = new Float32Array(points.length)
for (let i = 0; i < aSizeArray.length; i++) {
  aSizeArray[i] = i
}
flyLineGeometry.setAttribute('aSize', new THREE.BufferAttribute(aSizeArray, 1))

const flyLineMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: {
      value: 0,
    },
    uColor: {
      value: new THREE.Color(0xff0000),
    },
    uLength: {
      value: points.length,
    }
  },
  vertexShader: `
    attribute float aSize;

    uniform float uTime;
    uniform vec3 uColor;
    uniform float uLength;
    
    varying float vSize;
    
    void main() {
        vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1);
        gl_Position = projectionMatrix * viewPosition;
        vSize = (aSize - uTime);
        if (vSize < 0.0) {
            vSize = vSize + uLength; 
        }
        vSize = (vSize - uLength / 2.0) * 0.3;
        
        gl_PointSize = -vSize / viewPosition.z;
    }
  `,
  fragmentShader: `
    varying float vSize;
    uniform vec3 uColor;

    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5, 0.5));
      float strength = 1.0 - (distanceToCenter * 2.0);

      if (vSize <= 0.0) {
          gl_FragColor = vec4(1, 0, 0, 0);
      } else {
          gl_FragColor = vec4(uColor, strength);
      }
    }
  `
})
const flyLine = new THREE.Points(flyLineGeometry, flyLineMaterial)
scene.add(flyLine)

gsap.to(flyLineMaterial.uniforms.uTime, {
  value: 1000,
  duration: 2,
  repeat: -1,
  ease: "none",
})
```

### 光墙效果

```js
const geometry = new THREE.CylinderGeometry(1, 1, 1, 32)
geometry.computeBoundingBox()
const { min, max } = geometry.boundingBox
const material = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0,
    },
    uColor: {
      value: new THREE.Color(0xff0000),
    },
    uHeight: {
      value: max.y - min.y
    }
  },
  vertexShader: `
    varying vec3 vPosition;

    void main() {
      vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1);
      gl_Position = projectionMatrix * viewPosition;
      vPosition = position;
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    uniform float uHeight;
    void main() {
      float gradMix = (vPosition.y + uHeight / 2.0) / uHeight;
      gl_FragColor = vec4(1, 1, 0, 1.0 - gradMix);
    }
  `
})
const wall = new THREE.Mesh(geometry, material)
scene.add(wall)

// 动画光圈偏移
const scaleOffset = 0.5
gsap.to(wall.scale, {
  x: 1 + scaleOffset,
  z: 1 + scaleOffset,
  duration: 1,
  repeat: -1,
  yoyo: true,
})
```

### 雷达扫描效果

```js
const geometry = new THREE.PlaneGeometry(3, 3)
const material = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0,
    },
    uColor: {
      value: new THREE.Color(0xff0000),
    }
  },
  vertexShader: `
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main(){
      vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1);
      gl_Position = projectionMatrix * viewPosition;
      vPosition = position;
      vUv = uv;
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uTime;
    
    mat2 rotate2d(float _angle){
      return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
    }
    
    void main(){
      vec2 newUv = rotate2d(uTime*6.28) * (vUv-0.5);
      newUv += 0.5;
      float alpha =  1.0 - step(0.5, distance(newUv, vec2(0.5)));
      
      float angle = atan(newUv.x - 0.5,newUv.y - 0.5);
      float strength = (angle + 3.14) / 6.28;
      gl_FragColor = vec4(uColor, alpha * strength);
    }
  `
})
const radar = new THREE.Mesh(geometry, material)
radar.rotation.x = -Math.PI / 2
radar.position.y = 0.1
scene.add(radar)

// 动画光圈偏移
gsap.to(material.uniforms.uTime, {
  value: 1,
  duration: 1,
  repeat: -1,
  ease: "none",
})
```
