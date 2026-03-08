import https from 'https';
https.get('https://ais-dev-bbjzrh7xcmvgl3azftwjgz-201411114051.asia-east1.run.app/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(res.statusCode); console.log(data.substring(0, 200)); });
});
