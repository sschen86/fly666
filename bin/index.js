#!/usr/bin/env node

const http = require('http')
const fs = require('fs')
const baseurl = process.argv[2]
const outpath = process.cwd() +'/'+ process.argv[3]

const requestUrl = (!/\/$/.test(baseurl) ? baseurl + '\\' :baseurl) + 'openapi\\client-gateway-config'
const requestOption = {
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0
    }
}



const req = http.request(requestUrl, requestOption, function(res){
    if(res.statusCode === 200){
        res.setEncoding('utf8');
        const datas = []
          res.on('data', (chunk) => {
              datas.push(chunk)
          });
          res.on('end', () => {
              const json = JSON.parse(datas.join(''))
              console.info(json)
              if(json.code === 0){
                  createFile('module.exports = '+ json.data)
              }else{
                    console.error('更新配置项出错')
              }
          });
    }else{
        console.error(`请求遇到问题: 请重试`);
    }
})

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

// 将数据写入请求主体。
req.write('');
req.end();

function createFile(content){
    fs.writeFileSync(outpath, content)
    console.info('文件创建成功：'+ outpath.replace(/\//g, '\\'))
}


//console.info('hello my-cli', requestUrl)