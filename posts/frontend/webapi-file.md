### FileList

从最简单的上传代码说起

``` html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>upload</title>
  </head>
  <body>
    <input type="file" id="file" >
    <img id="show">

    <script>
      // 从 MDN 行可以知道，通常在属性为 type="file" 的 input 标签中有一个 files 属性，这个属性是一个 FileList 对象，这个对象存储着用户选择正要准备上传的文件（此时还没有真正上传）
      document.getElementById('file').addEventListener('change', function(evt) {
        const fileList = this.files
        // 从控制台打印的信息可以知道 fileList 是一个类似数组的结构，具备 iterator 接口，意味着可以迭代它
        console.log(fileList)
        // fileList 有一个 length 属性，可以知道用户上传了多少个文件
        console.log(fileList.length)
        // fileList 还有一个 item 方法，可以指定获取上传的第几个文件，item 返回以后是一个 File 对象
        console.log(fileList.item(0))
      })
    </script>
  </body>
</html>
```

看上去 `FileList` 对象还是挺简单的，那么继续看一下 `FileList` 中的 `File` 对象

### File

从 MDN 资料中，我们知道 `File` 对象通常来源于 `FileList` 对象，也可以是施放操作的 `DataTransfer` 的对象，而且 `File` 对象还是特殊类型的 `Blob`

``` html
<!-- ... -->
<input type="file" id="file" >
<img id="show-pic">

<script>
  // 常见的例如，文件名称啊，最后一个修改时间啊，文件大小的属性就不详细赘述了，来看一下对 File 对象比较常见的操作
  document.getElementById('file').addEventListener('change', function(evt) {
    // 例如图片上传预览，这时可以使用 createObjectURL 方法来实现，createObjectURL 方法会返回一个 对象形式的 URL，它的生命周期和创建的 document 是绑定的，相当于选择上传的文件临时的引用 URL 地址，赋值到 img 标签的 src 属性就可以实现上传图片预览了，其中在图片加载完成之后需要调用 revokeObjectURL 用来释放 URL 对象
    const iamgeFile = this.files.item(0)
    document.getElementById('show-pic').addEventListener('load', function() {
      URL.revokeObjectURL(this.src)
    })
    document.getElementById('show-pic').src = URL.createObjectURL(iamgeFile)
  })
</script>
<!-- ... -->
```

### FileReader

从名称上可以看到 `FileReader` 对象和 `File` 有关系，但是它也可以用于读取 `Blob` 的数据，首先来看常见的用法

``` html
<!-- ... -->
<input type="file" id="file" >

<script>
  document.getElementById('file').addEventListener('change', function(evt) {
    // 获取当前上传文件
    const file = evt.files.item(0)
    // 创建 FileReader 对象
    const reader = new FileReader()
    reader.addEventListener('load', function(evt) {
      console.log(evt.target.result)
    })

    // 读取的文件如果是文本文件，且希望以字符串的形式读取
    reader.readAsText(file)
    // 读取的文件如果是图片，且希望以 data: URL 的格式读取，最终是 base64 编码过表示图片的字符串
    // reader.readAsText(file)
  })
</script>
<!-- ... -->
```

### Blob

通过前面几个例子，最后引出 `Blob` 对象，它的说明在 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob) 上有详细说明，下面来看个例子，导出 Office 办公套件格式的文件，不过比较疑惑的是，我在 Mac 上导出用官方 Office 办公套件打不开，但是 WPS 却可以，没有任何问题

``` html
<!-- ... -->

<div id="table-container">
  <table style="border: 1px solid; border-collapse:collapse;">
    <tr>
      <td style="border: 1px solid;">单元格a1</td>
      <td style="border: 1px solid;">单元格a2</td>
      <td style="border: 1px solid;">单元格a3</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">单元格b1</td>
      <td style="border: 1px solid;">单元格b2</td>
      <td style="border: 1px solid;">单元格b3</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">单元格c1</td>
      <td style="border: 1px solid;">单元格c2</td>
      <td style="border: 1px solid;">单元格c3</td>
    </tr>
  </table>
</div>

<a id="export-doc">导出doc</a>
<a id="export-docx">导出docx</a>
<a id="export-xls">导出xls</a>
<a id="export-xlsx">导出xlsx</a>

<script>
  const exportHtml = document.getElementById('table-container').innerHTML
  
  function exportOfficeFile(linkId, exportHtml, type) {
    const officeMIME = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
    // 通过 html 代码还有 MIME 类似生成 Blob 对象，然后通过 createObjectURL 方法生成对象形式的 URL 地址，最后让用户进行下载，就可以直接导出了
    const officeBlob = new Blob([exportHtml], {
      type: `${officeMIME[type]};charset=utf-8`
    })
    
    document.getElementById(linkId).setAttribute("download", `test.${type}`);
    document.getElementById(linkId).href = URL.createObjectURL(officeBlob)
  }

  exportOfficeFile('export-doc', exportHtml, 'doc')
  exportOfficeFile('export-docx', exportHtml, 'docx')
  exportOfficeFile('export-xls', exportHtml, 'xls')
  exportOfficeFile('export-xlsx', exportHtml, 'xlsx')
</script>
<!-- ... -->
```