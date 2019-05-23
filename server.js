//1 导入模块
const http = require("http")
var request = require("request")
const querystring = require("querystring")
var WXBizDataCrypt = require("./WXBizDataCrypt")
const port = 3500
const serviceIp = "127.0.0.1"

//2 使用http模块,创建服务
const server = http.createServer()

//3 使用服务监听浏览器发送的请求,在回调函数中,响应数据给浏览器端
server.on("request", (req, res) => {

  if (req.url.includes("dedata")) {
    //1 定义变量暂存请求体的参数
    let body = ""
    //2 监听请求的data事件,每当接受到请求体的数据，就累加到body变量中
    req.on("data", chunk => {
      body += chunk
    })

    //接收完毕数据触发
    req.on("end", () => {
      //请求体参数转换为js对象
			const { code, iv, encryptedData } = querystring.parse(body)
			//appId和appSecret可以在微信公众平台获取,小程序appId需要和公众平台保持一致
			const appId = '替换为你的appid'
			const appSecret = '替换为你的appSecret'

			//使用appid,appSecret,code和grant_type换取session
			request(
        "https://api.weixin.qq.com/sns/jscode2session?appid=" +
				appId +
          "&secret=" +
          appSecret +
          "&js_code=" +
          code +
          "&grant_type=authorization_code",
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
						//取出session_key
						const sessionKey = JSON.parse(body).session_key
						
						const pc = new WXBizDataCrypt(appId, sessionKey)
						//解密已加密数据
						const deData = pc.decryptData(encryptedData , iv)
            //3 监听请求的end事件,浏览器发送数据完毕,做其他处理
            res.setHeader(
              "Content-Type",
              "application/json;charset=utf-8"
						)
						console.log(deData)
						const result = {
							code: 200,
							msg: '解密成功',
							data: deData
						}
            res.end(JSON.stringify(result))
          }
        }
      )
		})

	} else {
		res.setHeader("Content-Type", "application/json;charset=utf-8")
		// end方法能接受的参数是二进制数据和字符串
		res.end(JSON.stringify(""))
	}
})

//4 开启服务
server.listen(port, serviceIp, err => {
  if (err) {
    console.log(err)
    return false
  }
  console.log("start server ok,at " + serviceIp + ":" + port)
})
