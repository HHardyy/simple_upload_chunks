function axios(options) {
  return new Promise((resolve, reject) => {
    options = Object.assign({
      url: '',
      method: 'post',
      data: null,
      headers: {}
    }, options);
    let xhr = new XMLHttpRequest()

    xhr.open(options.method, options.url)

    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key])
    })

    xhr.onreadystatechange = function handleLoad() {
      if (xhr.readyState === 4) {
        if (/^(2|3)\d{2}$/.test(xhr.status)) {
          resolve(JSON.parse(xhr.responseText));
          return
        }
        reject(xhr)
      }
    }
    xhr.send(options.data)
  })
}


function _formMatFileNameToMd5(filename) {
  let dotIndex = filename.lastIndexOf('.');
  let name = filename.substring(0, dotIndex);
  let suffix = filename.substring(dotIndex + 1);
  let hash = md5(name) + new Date().getTime();
  return {
    hash,
    suffix,
    filename: `${hash}.${suffix}`
  }
}