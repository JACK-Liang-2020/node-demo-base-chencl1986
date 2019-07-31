const http = require('http')
const querystring = require('querystring')
const fs = require('fs')

const server = http.createServer((req, res) => {

  fs.readFile(`./${req.url}`, (error, buffer) => { // 根据URL查找读取相应的文件。
    if (error) {  // 若读取错误，则向前端返回404状态码，以及内容Not Found。
      res.writeHead(404)
      res.write('Not Found')
    } else {  // 若读取成功，则向前端返回读取到的文件。
      res.write(buffer)
    }
    res.end()  // 关闭连接。
  })

  let bufferArray = []  // 用于存储data事件获取的Buffer数据。

  req.on('data', (buffer) => {
    bufferArray.push(buffer)  // 将Buffer数据存储在数组中。
  })

  req.on('end', () => {
    // Buffer 类是一个全局变量，使用时无需 require('buffer').Buffer。
    // Buffer.concat方法用于合并Buffer数组。
    const buffer = Buffer.concat(bufferArray)
    // 已知Buffer数据只是字符串，则可以直接用toString将其转换成字符串。
    const post = querystring.parse(buffer.toString())
    console.log(post)
  })
})

server.listen(8080)