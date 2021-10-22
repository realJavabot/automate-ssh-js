#!/bin/node

const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const port = 3000
const util = require('util')
const exec = util.promisify(require("child_process").exec);

function fetch(password, user, ip, request){ 
	return exec(`sshpass -p ${password} ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user}@${ip} \"${request}\"`);
}

app.get('/inv/*', (req, res) => {
	var queryObject = decodeURI(req.url.substring('/inv/'.length));
	var ipList = queryObject.split(",");
	var dataFilepath = path.join(__dirname, 'request.json');
	var ipmi = ipList.splice(ipList.length - 1, 1);
	var ub   = ipList.splice(ipList.length - 1, 1);
	
	fs.readFile(dataFilepath, {encoding: 'utf-8'}, function(err,data){
    if (err) {
			console.log(err);
			return;
		}
		
		let dataOb = JSON.parse(data);
		let cred = dataOb["cred_" + ub];
		let requestOb = dataOb["request"];
		let results = [];
		let promises = [];
		ipList = ipList.filter(ip=> ip.split('.').length > 3);
		
		ipList.forEach((ip,i)=>{
			let p = Promise.resolve();
			results[i] = {};
			
			// create a promise chain (one chain per ip) so that the commands run one at a time
			// and dont exceed SSH's maximum number of connections
			for (const [key, command] of Object.entries(requestOb)){
				p = p
					.then(() => fetch( cred["password"], cred["login"], ip, command ))
					.then(data=>{
						if(!data)
							return;

						if(key == "MAC"){
							var macs = data["stdout"].split("\n");
							macs = macs.filter(mac => mac.split(':').length > 3);
							macs.forEach((mac, index)=>{
								results[i][key + " " + index] = mac;
							});
							return;
						}

						results[i][key] = data["stdout"].replace(/\n/g, "");
					})
					.catch(e => {
						console.log(e["cmd"] + "\n" + e["stderr"]);
					});
			}
			
			promises.push(p);
		});

		Promise.all(promises).then(()=>{
			res.render("layouts/index.ejs", {state: ub, ips:ipList.join(","), data:results});
		});
	});
});

app.get('/',(req, res)=>{
		res.render("layouts/index.ejs", {state: "dell", ips:"", data:""});
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
