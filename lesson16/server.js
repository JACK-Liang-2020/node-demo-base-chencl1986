const http = require('http')
const url = require('url')
const fs = require('fs')
const bufferSplit = require('./bufferSplit')

const server = http.createServer((req, res) => {

  // 定义公共变量，存储请求方法、路径、数据
  const method = req.method
  let path = ''
  let get = {}
  let post = {}
  let boundary = null;


  if (req.headers['content-type']) {
    boundary = `--${req.headers['content-type'].split('; ')[1].split('=')[1]}`  // 获取分隔符
  }
  // 判断请求方法为GET还是POST，区分处理数据
  if (method === 'GET') {
    // 使用url.parse解析get数据
    const { pathname, query } = url.parse(req.url, true)

    path = pathname
    get = query

    complete()
  } else if (method === 'POST') {
    path = req.url
    let arr = []

    req.on('data', (buffer) => {
      // 获取POST请求的Buffer数据
      arr.push(buffer)
    })

    req.on('end', () => {
      const buffer = Buffer.concat(arr)
      // console.log(buffer.toString())

      // 1. 用<分隔符>切分数据
      let result = bufferSplit(buffer, boundary)
      // console.log(result.map(item => item.toString()))

      // 2. 删除数组头尾数据
      result.pop()
      result.shift()
      // console.log(result.map(item => item.toString()))

      // 3. 将每一项数据头尾的的\r\n删除
      result = result.map(item => item.slice(2, item.length - 2))
      // console.log(result.map(item => item.toString()))

      // 4. 将每一项数据中间的\r\n\r\n删除，得到最终结果
      result.forEach(item => {
        // console.log(bufferSplit(item, '\r\n\r\n').map(item => item.toString()))

        let [info, data] = bufferSplit(item, '\r\n\r\n')  // 数据中含有文件信息，保持为Buffer类型

        info = info.toString()  // info为字段信息，这是字符串类型数据，直接转换成字符串，若为文件信息，则数据中含有一个回车符\r\n，可以据此判断数据为文件还是为普通数据。

        if (info.indexOf('\r\n') >= 0) {  // 若为文件信息，则将Buffer转为文件保存
          // 获取字段名
          let infoResult = info.split('\r\n')[0].split('; ')
          let name = infoResult[1].split('=')[1]
          name = name.substring(1, name.length - 1)

          // 获取文件名
          let filename = infoResult[2].split('=')[1]
          filename = filename.substring(1, filename.length - 1)
          // console.log(name)
          // console.log(filename)

          // 将文件存储到服务器
          fs.writeFile(`./upload/${filename}`, data, err => {
            if (err) {
              console.log(err)
            } else {
              console.log('文件上传成功')
            }
          })
        } else {  // 若为数据，则直接获取字段名称和值
          let name = info.split('; ')[1].split('=')[1]
          name = name.substring(1, name.length - 1)
          const value = data.toString()
          // console.log(name, value)
        }
      })

      // console.log(result)

      complete()
    })
  }
  // 在回调函数中统一处理解析后的数据
  function complete () {
    try {
      if (path === '/reg') {
        // 获取get请求数据
        const {
          username,
          password
        } = get

        // 读取user.json文件
        fs.readFile('./users.json', (error, data) => {
          if (error) {
            res.writeHead(404)
          } else {
            // 读取用户数据
            const users = JSON.parse(data.toString())
            const usernameIndex = users.findIndex((item) => {
              return username === item.username
            })

            // 判断用户名是否存在
            if (usernameIndex >= 0) {
              res.write(JSON.stringify({
                error: 1,
                msg: '此用户名已存在'
              }))
              res.end()
            } else {
              // 用户名不存在则在用户列表中增加一个用户
              users.push({
                username,
                password
              })

              // 将新的用户列表保存到user.json文件中
              fs.writeFile('./users.json', JSON.stringify(users), (error) => {
                if (error) {
                  res.writeHead(404)
                } else {
                  res.write(JSON.stringify({
                    error: 0,
                    msg: '注册成功'
                  }))
                }
                res.end()
              })
            }
          }
        })
      } else if (path === '/login') {
        const {
          username,
          password
        } = post

        // 读取users.json
        fs.readFile('./users.json', (error, data) => {
          if (error) {
            res.writeHead(404)
          } else {
            // 获取user列表数据
            const users = JSON.parse(data.toString())
            const usernameIndex = users.findIndex((item) => {
              return username === item.username
            })

            if (usernameIndex >= 0) {
              // 用户名存在，则校验密码是否正确
              if (users[usernameIndex].password === password) {
                res.write(JSON.stringify({
                  error: 0,
                  msg: '登录成功'
                }))
              } else {
                res.write(JSON.stringify({
                  error: 1,
                  msg: '密码错误'
                }))
              }
            } else {
              res.write(JSON.stringify({
                error: 1,
                msg: '该用户不存在'
              }))
            }
          }
          res.end()
        })
      } else {
        // 若不是注册或登录接口，则直接返回相应文件
        fs.readFile(`.${path}`, (error, data) => {
          if (error) {
            res.writeHead(404)
          } else {
            res.write(data)
          }
          res.end()
        })
      }
    } catch (error) {
      console.error(error);
    }
  }
})

server.listen(8080)