var data, w, h, m, head;
var _STATIC_URL = "/";

function init (DATA, W, H, M, HEAD) {

	data = DATA;
	w = W;
	h = H;
	m = M;
	head = HEAD;

	//read data and build grid
	dataUrl = _STATIC_URL + "static/gridData/" + data + ".json"
	handleRequest(dataUrl, "The glyphs couldn't be loaded.", setup);

}

//download YouTube player API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); // Create YouTube player(s) after the API code downloads.

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
		events: {
			'onReady': onPlayerReady
		}
	}); 
}

function onPlayerReady(evt) {
    player.mute();

}

var setup = function () {

	//set margins so shit is centered horizontally
	var totalGifWidth = parseFloat(w) + 2*parseFloat(m);
	screenWidth = window.innerWidth;
	var numberOfGifsInARow = Math.floor(screenWidth/totalGifWidth);
	document.getElementById('grid').style.width = numberOfGifsInARow*totalGifWidth + "px";
	
	//center modal vertically 
	screenHeight = window.innerHeight;
	glyphHeight = 350;
	modalMargin = (screenHeight - glyphHeight)/2;
	document.getElementById("modal").style.padding = modalMargin + "px 0";

	//set title if there is one
	if (head) {
		var title = document.getElementById("title")
		title.innerHTML = head;
		title.style.width = numberOfGifsInARow*totalGifWidth + "px";
	}

	//get response from data
	response = JSON.parse(this.responseText);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}

	//iterate through each image and build/insert it
	for (var i = 0; i < response.length; i++) {
		gifUrl = response[i].gifUrl;
		title = response[i].title;
		YTid = response[i].Ytid;
		var glyph = document.createElement("img");

		glyph.setAttribute('src', gifUrl);
		glyph.setAttribute('width', w);
		glyph.setAttribute('height', h);
		glyph.setAttribute('onclick', 'glyphClicked("'+gifUrl+'", "'+title+'", "'+YTid+'")');
		glyph.style.margin = m + "px";
		glyph.setAttribute('class', 'glyph');

		document.getElementById('grid').appendChild(glyph);
	};

}

var glyphClicked = function (gifUrl, title, YTid) {
	console.log(title);
	document.getElementById("large-glyph").setAttribute('src', gifUrl);
	document.getElementById("large-glyph").setAttribute('onclick', 'largeGlyphClicked(event, "'+YTid+'")');
	document.getElementById("large-title").innerHTML = title;

	playerDiv = document.getElementById("player");
	playerDiv.setAttribute('src', "http://www.youtube.com/embed/" + YTid + "?enablejsapi=1&theme=light&showinfo=0&modestbranding=1&controls=0");
	player.mute();

	var modal = document.getElementById("modal");
	modal.style.zIndex = 2;
	modal.style.opacity = 1;
}

var closeModal = function () {
	console.log("closing");
	modal.style.opacity = 0;
	modal.style.zIndex = -1;

	playerDiv = document.getElementById("player");
	playerDiv.style.zIndex = -4;
	playerDiv.style.opacity = 0;
}

var largeGlyphClicked = function (event, YTid) {
	event.stopPropagation();
	playerDiv = document.getElementById("player");
	playerDiv.style.zIndex = 2;
	playerDiv.style.opacity = 1;
}

function handleRequest (url, error, onloadCallback) {
	var response;
	var request = new XMLHttpRequest();
	request.onreadystatechange=function() {
	    if (request.readyState === 4){   //if complete
	        if(request.status === 200){  //check if "OK" (200)
	            request.onload = onloadCallback;
	        } else {
	            handleError(error); //otherwise, some other code was returned
	        }
	    } 
	}
	request.open('GET', url, true); 
	request.send();
}

// does something with error messages
function handleError (errorMessage) {
	console.log(errorMessage);
	document.getElementById("error").innerHTML = errorMessage;
}