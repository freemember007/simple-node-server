/*
 * simple node server
 */
// prettier-ignore
const fs   = require('fs')
const path = require('path')
const http = require('http')
const url = require('url')

// 预加载全部api(加至内存，以提升响应速度)
const handlers = {}
fs.readdirSync(__dirname + '/api').forEach(filename => {
  if (!/\.js$/.test(filename)) return
  const name = path.basename(filename, '.js')
  handlers[name] = require('./api/' + name)
})

// 请求响应逻辑
const handle = async (request, response) => {
  const handler = handlers[request.pathname]
  // 如果资源存在
  if (typeof handler === 'function') {
    let result
    const Allow = {
      'Content-Type': 'application/json charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, OPTIONS',
    }
    switch (request.method) {
      case 'OPTIONS':
        response.writeHead(200, Allow)
        response.end()
        break
      case 'POST':
        try {
          result = await handler(request)
          console.info('result', result)
          response.writeHead((result && result.statusCode) || 200, Allow)
          response.write(JSON.stringify(result || '{}'))
          response.end()
        } catch (err) {
          response.writeHead(err.statusCode, {
            'Content-Type': 'application/json charset=utf-8',
          })
          ;(err.statusCode === 400 &&
            response.write(
              JSON.stringify({
                message: `400请求错误，${err.message}`,
              }),
            )) ||
            response.write(
              JSON.stringify({
                message: `500服务器错误，${err.message}`,
              }),
            )
          response.end()
        }
        break
      default:
        response.writeHead(400, {
          'Content-Type': 'application/json charset=utf-8',
        })
        response.write(
          JSON.stringify({ message: '400请求错误，不允许的请求方法' }),
        )
        response.end()
    }
    // 如果资源不存在
  } else {
    response.writeHead(404, {
      'Content-Type': 'application/json charset=utf-8',
    })
    response.write(JSON.stringify({ message: '404错误，请求的资源不存在！' }))
    response.end()
  }
}

// 请求/响应主函数
const onRequest = (request, response) => {
  console.info(request.method, request.url)
  request.pathname = url.parse(request.url).pathname.replace(/^\//, '')
  request.query = url.parse(request.url, true).query || {}
  request.setEncoding('utf8')
  let body = ''
  request.addListener('data', function(bodyChunk) {
    body += bodyChunk
  })
  request.addListener('end', function() {
    console.info('body: ' + body)
    request.body = JSON.parse(body || '{}')
    handle(request, response)
  })
}

// 开启服务器
const PORT = process.env.PORT || 3000
http.createServer(onRequest).listen(PORT)
console.info(`cli node server is listen on ${PORT}!`)
