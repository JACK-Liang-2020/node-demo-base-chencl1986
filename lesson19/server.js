const http = require('http')
const io = require('socket.io')
const fs = require('fs')
const url = require('url')

// 1. 建立HTTP服务器。
const server = http.createServer((req, res) => {
  // 使用url.parse解析get数据
  const { pathname, query } = url.parse(req.url, true)

  let path = pathname

  // 若不是注册或登录接口，则直接返回相应文件
  fs.readFile(`.${path}`, (error, data) => {
    if (error) {
      res.writeHead(404)
    } else {
      res.write(data)
    }
    res.end()
  })

})

server.listen(8080)

// 2. 建立WebSocket，让socket.io监听HTTP服务器，一旦发现是WebSocket请求，则会自动进行处理。
const ws = io.listen(server)

// 建立连接完成后，触发connection事件。
// 该事件会返回一个socket对象（https://socket.io/docs/server-api/#Socket），可以利用socket对象进行发送、接收数据操作。
ws.on('connection', (socket) => {
  // 根据事件名，向客户端发送数据，数据数量不限。
  socket.emit('msg', '服务端向客户端发送数据第一条', '服务端向客户端发送数据第二条')

  // 根据事件名接收客户端返回的数据
  socket.on('msg', (...msgs) => {
    console.log(msgs)
  })

  // 使用计时器向客户端发送数据
  setInterval(() => {
    socket.emit('timer', new Date().getTime() + '\n' + poetryArr[getRandom(0, poetryArr.length)])
  }, 1000);
})

//获取随机数      
function getRandom (x, y) {
  //x 下限 
  //y 上限
  return parseInt(Math.random() * (y - x + 1) + x);
}

function randomString (len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = $chars.length;
  var pwd = '';
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  let num = Math.round(len)
  // return pwd + len <= poetryArr.length ? poetryArr[len] : poetryArr[0];
  return pwd + poetryArr[num]
}

let poetryArr = [
  '洛阳亲友如相问，一片冰心在玉壶。——出处：王昌龄《芙蓉楼送辛渐》',
  '露从今夜白，月是故乡明。——出处：杜甫《月夜忆舍弟》',
  '秦时明月汉时关，万里长征人未还。——出处：王昌龄《出塞二首》',
  '仍怜故乡水，万里送舟行。——出处：李白《渡荆门送别》',
  '巴山楚水凄凉地，二十三年弃置身。——出处：刘禹锡《酬乐天扬州初逢席上见赠》',
  '近乡情更怯，不敢问来人。出处——宋之问《渡汉江》',
  '怀旧空吟闻笛赋。到乡翻似烂柯人。——出处：刘禹锡《酬乐天扬州初逢席上见赠》',
  '浊酒一杯家万里，燕然未勒归无计。——出处：范仲淹《渔家傲秋思》',
  '少小离家乡老大回，乡音无改鬓毛衰。——出处：贺知章：《回乡偶书二首》',
  '马作的卢飞快，弓如霹雳弦惊。——出处：辛弃疾《破阵子为陈同甫赋壮词以寄之》',
  '来日倚窗前，寒梅著花末。——出处：王维《在诗三首》',
  '羁鸟恋旧林，池鱼思故渊。——出处：陶渊明《归园田居其一》',
  '相顾无相识，长歌杯采薇。——出处：王绩《野望》',
  '画图省识春风面，环佩空归夜月魂。——出处：杜甫《咏怀古迹五首其三》',
  '共看明月应垂泪，一夜相信无处同。——出处：白居易《望月有感》',
  '书卷多情是故人，晨昏忧乐每相亲。——出处：于谦《观书》',
  '开荒南野际，守拙归田园。——出处:陶渊明《归园田居其一》',
  '落叶他乡树，寒灯独夜人。——出处：马戴《灞上秋居》',
  '家在梦中何日到，春来江上几人还？川原缭绕浮云外，宫阙参差落照间。——出处：卢纶《长安春望》',
  '人归落雁后，思发在花前。——出处：薛道衡《人日归思》',
  '洛阳城里春光好，洛阳才子他乡老。——出处：韦庄《菩萨蛮洛阳城里春光好》',
  '人言落日是天涯，望极天涯不见家。——出处：李觏《思乡》',
  '卧龙跃马终黄土，人事音书漫寂寥。——出处：杜甫《阁夜》',
  '唯有门前镜湖水，春风不改旧时波。——出处：贺知章《回乡偶书二首》',
  '未老莫还乡，还乡须断肠。——出处：韦庄《菩萨蛮人人尽说江南好》',
  '人言落日是天涯，望极天涯不见家。——出处：李觏《思乡》'
]