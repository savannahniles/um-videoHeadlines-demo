//---------------------------Prompt the user to input a url-----------------------------

var _STATIC_URL = "http://localhost:5000/";
var videoId;

//download YouTube player API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); // Create YouTube player(s) after the API code downloads.

var player, startTime, endTime;
var timeupdater = null;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player');
}

//---------------------------Set the page up (content + listeners)-----------------------------

function init(id) {
	videoId = id

	// call and load scene thumbnails
	scenesUrl = _STATIC_URL + 'authoringTool/sceneDetection/' + videoId;
	errorMessage = 'The scenes for this video could not be loaded.';
	handleRequest(scenesUrl, errorMessage, buildScenes);

}

//---------------------------The place where shit gets built-----------------------------

var buildScenes = function () {
	document.getElementById("loading").innerHTML = "";
	response = JSON.parse(this.responseText);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}
	console.log (response);
	thumbnailContainer = document.getElementById("thumbnailContainer")
	totalScenes = response.scenes.length
	for (var i = 0; i < totalScenes; i++) {
		start = response.scenes[i]['start'];
		end = response.scenes[i]['end'];
		imagePath = _STATIC_URL + response.scenes[i]['keyframes']['in_img'];

		var thumb = document.createElement("img");
		// console.log (thumb);
		thumb.setAttribute('src', imagePath);
		thumb.setAttribute('start', start);
		thumb.setAttribute('end', end);
		thumb.setAttribute('class', 'thumbnail');
		thumb.setAttribute('onclick', "loopVideo(" + start + ", " + end + ")");

		thumbnailContainer.appendChild(thumb);
	};
}

var showGif = function () {

	videoCol = document.getElementById("videoCol");
	response = JSON.parse(this.responseText);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}
	console.log (response);
	imagePath = _STATIC_URL + response.gif;
	var gif = document.createElement("img");
	gif.setAttribute('src', imagePath);
	gif.setAttribute('class', 'gif');

	videoCol.appendChild(gif);
	
}

//---------------------------Event listeners-----------------------------

function loopVideo(start, end) {
  	clearInterval(timeupdater);
  	startTime = start;
  	endTime = end;
	player.seekTo(start);
	function updateTime () {
		if (player.getPlayerState() == 1 & player.getCurrentTime() > end) {
			console.log("the video reached the end time!");
			player.seekTo(start);
		}
	}
	timeupdater = setInterval(updateTime, 100);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById("outputGif").addEventListener("click", function () {
  		console.log ('outputting gif');
  		console.log ('startTime');
  		console.log (startTime);
  		console.log ('endTime');
  		console.log (endTime);

  		createGifUrl = _STATIC_URL + 'authoringTool/makeGif/' + videoId + '?start=' + startTime + '&end=' + endTime;
		console.log("createGifUrl");
		errorMessage = 'There was a problem. The gif could not be loaded.';
		handleRequest(createGifUrl, errorMessage, showGif);

    });
});

//---------------------------Asynch Helpers-----------------------------

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
	document.getElementById("loading").innerHTML = "";
	document.getElementById("error").innerHTML = errorMessage;
}