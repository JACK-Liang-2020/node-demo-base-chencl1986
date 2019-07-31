const http = require('http')
const fs = require('fs')
const url = require('url')
const { URL } = url
const querystring = require('querystring')

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

  {
    // 方法一：
    const [pathname, queryStr] = req.url.split('?')
    const query = querystring.parse(queryStr)
    console.log(pathname, query)
  }
  {
    // 方法二：
    const url = new URL(`http://localhost:8080${req.url}`)
    const { pathname, search } = url
    const query = querystring.parse(search.substring(1, url.search.length))
    // console.log(pathname, query)
  }
  {
    // 方法三：
    // parse方法第二个参数若传true，则会直接将解析出的query值转为对象形式，否则它只是字符串形式
    const { pathname, query } = url.parse(req.url, true)
    // console.log(pathname, query)
  }
})

server.listen(8080)