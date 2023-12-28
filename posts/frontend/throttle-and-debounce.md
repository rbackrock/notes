### 节流

日常开发中，我们经常会遇到下面两个问题

* 用户疯狂的点击某个按钮，点击多少次就向服务器请求多少次。理想状况中，我们希望就算用户疯狂点击，我们也不是立马就像服务器请求，而是有一段时间的间隔
* 搜索框中根据用户输入的内容向服务器进行请求实现搜索联想功能。理想状况中，我们希望用户输入完毕以后再和服务器端进行请求，而不是在用户还在输入中，输入的每个字符都进行请求

要解决这两个应用场景，就要谈到今天的主题，节流和防抖，那么，直接上代码

``` html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>throttle</title>
  </head>
  <body>
    <button id="btn1">节流1测试</button>
    <button id="btn2">节流2测试</button>
    <script>
      // 第一种节流方法，通过对比当前时间差实现
      function throttle1(cb, wait = 3000) {
        let previousTime = 0

        return (...evt) => {
          const nowTime = +new Date()
          if (nowTime - previousTime > wait) {
            previousTime = nowTime
            cb.apply(this, evt)
          }
        }
      }

      // 第二种节流方法，通过定时器实现
      function throttle2(cb, wait = 3000) {
        let timer = null

        return (...evt) => {
          if (timer) {
            return
          }

          timer = window.setTimeout(() => {
            timer = null
            cb.apply(this, evt)
          }, wait)
        }
      }

      document.getElementById('btn1').addEventListener('click', throttle1(evt => console.log(evt)))
      document.getElementById('btn2').addEventListener('click', throttle2(evt => console.log(evt)))
    </script>
  </body>
</html>
```

### 抖动

``` html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="./js/jquery-3.5.1.min.js"></script>
    <title>Document</title>
  </head>
  <body>
    <input type="text" id="search">
    <script>
      function debounce(cb, wait = 1500) {
        let timer = null

        return (...evt) => {
          if (timer) {
            window.clearTimeout(timer)
          }

          timer = window.setTimeout(() => {
            timer = null
            cb.apply(this, evt)
          }, wait)
        }
      }

      document.getElementById('search').addEventListener('input', debounce(evt => console.log(evt)))
    </script>
  </body>
</html>
```

以上就是节流和防抖最简版本，开发中可以使用 `lodash` 库的 `_.throttle` 和 `_.debounce` 方法进行开发。另外关于节流和防抖更加详细的文章可以参考 [Debouncing and Throttling Explained Through Examples](https://css-tricks.com/debouncing-throttling-explained-examples/)
