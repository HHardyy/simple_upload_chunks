const express = require('express');
const multiparty = require('multiparty');
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const port = 8081

let router = express.Router();
let upload_dir = 'nodeServer/upload'

// 处理静态资源
app.use(express.static(path.join(__dirname)))
app.use(bodyParser())

// 处理跨域
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  )
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.send(200)
  else next()
})

router.post('/chunk', (req, res) => {
  new multiparty.Form().parse(req, function (err, fields, file) {
    if (err) {
      res.send({
        code: 1,
        codeText: err
      })
      return
    }
    let [chunk] = file.chunk, [filename] = fields.filename;
    let filepath = filename.substring(0, filename.indexOf('-')),
      chunk_dir = `${upload_dir}/${filepath}`
    if (!fs.existsSync(chunk_dir)) {
      fs.mkdirSync(chunk_dir)
    }
    chunk_dir = `${upload_dir}/${filepath}/${filename}`
    let readStream = fs.createReadStream(chunk.path),
      writeStream = fs.createWriteStream(chunk_dir);
    readStream.pipe(writeStream);
    readStream.on('end', function () {
      fs.unlinkSync(chunk.path)
    });
    res.send({
      code: 0,
      codeText: 'success'
    })
  })
})

router.post('/merge', (req, res) => {
  console.log('destructure:', req.body)
  let { filename } = req.body
  if (!filename) {
    console.log(typeof filename)
    return
  }
  let dotIn = filename.lastIndexOf('.'),
    filepath = `${upload_dir}/${filename.substring(0, dotIn)}`,
    filenamePath = `${upload_dir}/${filename}`;
  fs.writeFileSync(filenamePath, '');
  let pathList = fs.readdirSync(filepath);
  pathList.sort((a, b) => a.localeCompare(b)).forEach(item => {
    fs.appendFileSync(filenamePath, fs.readFileSync(`${filepath}/${item}`))
    fs.unlinkSync(`${filepath}/${item}`)
  })
  fs.rmdirSync(filepath)
  res.send({
    code: 0,
    codeText: '',
    path: `http://127.0.0.1:${port}/upload/${filename}`
  })
})

app.use(router)
app.use((req, res) => {
  res.status(404)
  res.send('NOT FOUND!!!')
})

app.listen(port, () => {
  console.log('server is start at port 8081')
})