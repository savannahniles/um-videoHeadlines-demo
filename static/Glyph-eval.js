//prepare a json object that we're going to fill with data
//show them an intro and ask them to get started
//accept a collection of images/gifs from the server in a big json object much like the grid does it
//show the image and start a timer
//when they click the images, show the video and stop the timer
//resume the timer if they exit the video
//when they click to the next image, record the time and the interaction
//when they end, send the whole info set to the server

var data;
var results = [];
var currentImage = 0;
var nextImage = 1;
var evenImageDiv, oddImageDiv;
var _STATIC_URL = "/";
var clickedVideo = false;
var start, elapsed;

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
	console.log ("player ready");
    player.mute();

}

function init () {

	dataUrl = _STATIC_URL + "static/gridData/news.json"
	handleRequest(dataUrl, "The glyphs couldn't be loaded.", setup);
}

var setup = function () {

	//get response from data
	response = JSON.parse(this.responseText);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}

	data = response;

	evenImageDiv = document.getElementById("evenImage");
	oddImageDiv = document.getElementById("oddImage");

	evenImageDiv.innerHTML = buildImage (currentImage);
	evenImageDiv.setAttribute( "id", "current" );
	oddImageDiv.innerHTML = buildImage (nextImage);
	oddImageDiv.setAttribute( "id", "next" );

}

function begin () {
	//hide title
	document.getElementById("start").remove();
	setTimer();
}

function next () {
	collectDataPoint(currentImage);
	closeVideo();

	//reset
	setYtid ('123');
	clickedVideo = false;
	currentImage += 1;
	nextImage += 1;
	if (data.length == currentImage) {
		endStudy();
	}
	else {
		setImages ();
	}
	setTimer();	
}

function collectDataPoint(index) {
	stopTimer();
	var result = {
		index: index,
		imageUrl: data[index].gifUrl, 
		Ytid: data[index].Ytid, 
		time: elapsed, 
		clicked: clickedVideo,
		timeVideo: player.getCurrentTime()
	};
	console.log(result);
	results.push(result);

}

function setImages () {
	if (currentImage%2 == 0) { //if current image is even, then next Image is odd
		evenImageDiv.setAttribute( "id", "current" );
		oddImageDiv.setAttribute( "id", "next" );
		if (nextImage < data.length) {
			oddImageDiv.innerHTML = buildImage (nextImage);			
		}
	}
	else { //if current image is odd, then next image is even
		oddImageDiv.setAttribute( "id", "current" );
		evenImageDiv.setAttribute( "id", "next" );
		if (nextImage < data.length) {
			evenImageDiv.innerHTML = buildImage (nextImage);
		}
	}

}

function buildImage (index) {
	html = '<img src=" ' +data[index].gifUrl+  '  " onclick="imageClicked(&#39;'  +data[index].Ytid+   '&#39;)">';
	return html;
}

function setYtid (Ytid) {
	playerDiv = document.getElementById("player");
	playerDiv.setAttribute('src', "http://www.youtube.com/embed/" + Ytid + "?enablejsapi=1&theme=light&showinfo=0&modestbranding=1&controls=0&autoplay=1");
	player.mute();
}

function closeVideo () {
	modal = document.getElementById("modal");
	modal.style.zIndex = "-10";
	modal.style.display = "none";
	document.body.style.background = "white";
}

function imageClicked(Ytid) {
	if (event.target.parentNode.id == "current") {
		clickedVideo = true;
		setYtid(Ytid);
		document.body.style.background = "#ff7651";
		document.getElementById("modal").style.display = "block";
		document.getElementById("modal").style.zIndex = 10;
	}
}

function setTimer() {
	console.log ('timer on');
	start = new Date();
}

function stopTimer() {
	console.log ('timer off');
	elapsed = new Date() - start;
	elapsed = elapsed / 1000
	start = 0;
}

function endStudy() {
	document.body.innerHTML = "Congrats you're done!"
	console.log (results);
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







