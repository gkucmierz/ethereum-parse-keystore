#!/usr/bin/env node

const fs = require('fs');
const rp = require('request-promise');

let map = {};

let addr = fs.readdirSync('./').map(fileName => {
  let json = JSON.parse(fs.readFileSync(fileName));
  map[json.address] = fileName;
  return json.address;
});


console.log('found addresses:');
console.log(addr.join('\n'));

let res = [];

addr.map(a => {
  rp('https://etherscan.io/address/'+a).then(html => {
    let m = html.match(/title=\'([\d\.]+) Ether\'/);
    res.push({
      addr: a,
      balance: m ? +m[1] : 'error'
    });
    check();
  });
});

function check() {
  if (res.length < addr.length) return;

  console.log('balances:');
  res.sort((a, b) => b.balance-a.balance);

  console.log(res.map(o => [map[o.addr], o.addr, o.balance].join('\t')).join('\n'));
}
