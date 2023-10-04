const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("cross-fetch");
const fs = require('fs');
const lodash = require("lodash");
const bodyParser = require('body-parser');
const toastr = require("toastr");
var data = {};

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

app.listen(8080, ()=>{
	console.log("Listening to port 8080...");
});

const options = {
  method: 'GET',
  headers: {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
  }
};

const apiCall = async ()=>{
	const url = await fetch('https://intent-kit-16.hasura.app/api/rest/blogs', options)
  data = await url.json();
}

const removeDuplicates = (data)=>{
	const uniqueArray = [], answer = [];
	for (const value of data.blogs) {
	  if (!uniqueArray.includes(value.title)){
	    uniqueArray.push(value.title);
	    answer.push({
	    	title: value.title,
	    	img_url: value.image_url
	    });
	  }
	}
	return answer;
}

const fetchTitleSearch = (query, input)=>{
  var url = "", y = "", found = false, result = {};
  data.blogs.filter((x)=>{
		if(x.title.toLowerCase() === input.toLowerCase() && !found){
			url = x.image_url;
			y = x.title;
			found = true;
		}
	});
	if(url !== "" && y !== "" && found) result = {url: url, y: y, status: ""};
	else result = {status: "No blog found with this title"};
  return result;
}

const fetchWordSearch = (query, input)=>{
	var objs = [], id = undefined, result = {};
  data.blogs.filter((x)=>{
		if(x.title.toLowerCase().includes(input.toLowerCase())){
			const obj = {
				url: x.image_url,
				y: x.title
			}
			objs.push(obj);
		}
	});
	if(objs !== [] && id !== undefined && result !== {}) result = {objs: objs, status: ""};
	else result = {status: "No blog found with this substring"};
  return result;
}

const cacheTitleSearch = lodash.memoize(
  fetchTitleSearch,
  (data, input) => data,
  (data) => new Date().getTime() + 60000
);

const cacheWordSearch = lodash.memoize(
	fetchWordSearch,
	(data, input) => data,
	(data) => new Date().getTime() + 60000
);

app.get("/api/blog-search", async (req, res)=>{
	await apiCall();
	var input = req.query.query;
	if(input === "" || input === undefined || input === null) res.status(500).json({status: "No title entered"});
	else{
		const obj = cacheTitleSearch(data, input);
		if(obj.status !== "") res.status(200).json(obj);
		else res.status(500).json(obj);
	}
});

app.get("/api/blog-search-word", async (req, res)=>{
	await apiCall();
	var input = req.query.query;
	if(input == "") res.status(500).json({status: "No word entered"});
	else{
		const obj = cacheWordSearch(data, input);
		if(obj.status !== "") res.status(200).json(obj);
		else res.status(500).json(obj);
	}
});

app.post("/api/blog-search", async (req, res)=>{
	await apiCall();
	var input = req.body.x;
	if(input === "" || input === undefined || input === null) res.status(500).json({status: "No title entered"});
	else{
		const obj = cacheTitleSearch(data, input);
		if(obj.status !== "") res.status(200).json(obj);
		else res.status(500).json(obj);
	}
});

app.post("/api/blog-search-word", async (req, res)=>{
	await apiCall();
	var input = req.body.x;
	if(input == "") res.status(500).json({status: "No word entered"});
	else{
		const obj = cacheWordSearch(data, input);
		if(obj.status !== "") res.status(200).json(obj);
		else res.status(500).json(obj);
	}
});

app.get("/api/blog-stats", async (req, res)=>{
	await apiCall();
	const blogs = data.blogs
	res.status(200).json({blogs: blogs});
});

app.get("/api/blog-unique", async (req, res)=>{
	await apiCall();
	const answer = removeDuplicates(data);
	res.status(200).json({answer: answer});
});

app.get("/api/blog-longest-title", async (req, res)=>{
	await apiCall();
	var longest = 0, string = "";
	for(const value of data.blogs){
		if(longest < value.title.length){
			longest = value.title.length;
			string = value.title;
		}
	}
	res.status(200).json({longest: longest, string: string});
});