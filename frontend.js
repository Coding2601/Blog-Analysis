const searchBut = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const search = document.getElementById("search");
const clearBut = document.getElementById("clearButton");
const row1 = document.getElementById("row1");

const search2 = document.getElementById("search2");
const wordInput = document.getElementById("searchWord");
const searchWord = document.getElementById("wordSearch");
const clearWord = document.getElementById("wordClear");
const label = document.querySelector(".word");
const row = document.getElementById("row");

const number = document.getElementById("number");
const long = document.getElementById("long");
const unq = document.getElementById("unq");

const list = document.getElementById('list');

const p = document.createElement("p");
const img = document.createElement("img");

const make = (message)=>{
	toastr.options = {
		positionClass: 'toast-top-right',
		timeOut: 3000,
		hideProgressBar: false,
		closeOnClick: true
	};
	toastr.info(message);
}

searchBut.addEventListener("click", ()=>{
	var x = searchInput.value;
	p.classList.add("title")
	img.classList.add("blog");
	fetch("http://localhost:8080/api/blog-search", {
		method: "POST",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({x})
	}).then(res=>res.json()).then(data=>{
		if(data.status === "No title entered"){
			make(data.status);
		}else if(data.status === "No blog found with this title" || data.status === ""){
			alert(data.status);
		}else{
			console.log(data);
			if(row1 === null || row1 === undefined) row1 = document.createElement("div");
			row1.classList.add("row1");
			p.innerText = data.y;
			img.src = data.url;
			row1.appendChild(p);
			row1.appendChild(img);
		}
	});
});

clearBut.addEventListener("click", ()=>{
	p.remove();
	img.remove();
	row1.remove();
	searchInput.value = "";
});

searchWord.addEventListener("click", ()=>{
	var x = wordInput.value;
	fetch("http://localhost:8080/api/blog-search-word", {
		method: "POST",
        crossDomain: true,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({x})
	}).then(res=>res.json()).then(data=>{
		if(data.status === "No word entered"){
			make(data.status);
			
		}else if(data.status === "No blog found with this substring" || data.status === ""){
			alert(data.status);
			//const p = document.createElement("p");
			//p.innerText = data.status;
			//search2.appendChild(p);
		}else{
			console.log(data);
			row.classList.add("row");
			for(let i=0;i<data.objs.length;i++){
				const p = document.createElement("p"), img = document.createElement("img");
				const title = document.createElement("div");
				p.innerText = data.objs[i].y;
				img.src = data.objs[i].url;
				title.classList.add("title1")
				img.classList.add("blog1");
				const ele = document.createElement("div");
				ele.classList.add("col-sm-6");
				title.appendChild(p);
				ele.appendChild(title);
				ele.appendChild(img);
				row.appendChild(ele);
			}
			label.innerText = "Total number of blogs title containing word '"+x+"' is: "+data.objs.length;
			search2.appendChild(label);
			search2.appendChild(row);
		}
	});
});

clearWord.addEventListener("click", ()=>{
	row.remove();
	label.remove();
	wordInput.value = "";
});

fetch("http://localhost:8080/api/blog-stats").then(res=>res.json()).then(data=>{
	number.innerText = data.blogs.length;
});

fetch("http://localhost:8080/api/blog-longest-title").then(res=>res.json()).then(data=>{
	long.innerText = data.longest;
});

fetch("http://localhost:8080/api/blog-unique").then(res=>res.json()).then(data=>{
	unq.innerText = data.answer.length;
	const ol = document.createElement("ol");
	for(const value of data.answer){
		const li = document.createElement("li");
		li.innerText = value.title;
		li.classList.add("ele");
		li.addEventListener("click", ()=>{
			window.open(value.img_url);
		});
		ol.appendChild(li);
	}
	list.appendChild(ol);
});