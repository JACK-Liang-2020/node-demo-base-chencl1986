const fs = require('fs')

let readUrl = './server.js'
let writeUrl = './test.txt'

readFun(readUrl, writeFun)


function readFun (url, fn) {
  fs.readFile(url, (error, data) => {
    if (error) {
      console.log('文件读取失败', error)
    } else {
      // 此处因确定读取到的数据是字符串，可以直接用toString方法将Buffer转为字符串。
      // 若是需要传输给浏览器可以直接用Buffer，机器之间通信是直接用Buffer数据。
      // console.log('文件读取成功', data.toString())
      // fn(data.toString())
      // return data.toString();
      fn(writeUrl, data.toString())
    }
  })
}

function writeFun (url, data) {
  fs.writeFile(url, data, (error) => {
    if (error) {
      console.log('文件写入失败', error)
    } else {
      console.log('文件写入成功')
    }
  })
}