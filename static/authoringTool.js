//---------------------------Load the video-----------------------------

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
		handleError ("Whoops, error getting response.");
		return;
	}
	console.log (response);
	var thumbnailContainer = document.getElementById("thumbnailContainer");
	var thumbnailWidth = (thumbnailContainer.offsetWidth / 7) - 11; //padding
	var totalScenes = response.scenes.length;
	for (var i = 0; i < totalScenes; i++) {
		start = response.scenes[i]['start'];
		end = response.scenes[i]['end'];
		imagePath = response.scenes[i]['keyframes']['in_img'];
		thumbId = imagePath.replace(/:/g,"");

		var thumb = document.createElement("img");
		thumb.setAttribute('src', imagePath);
		thumb.setAttribute('start', start);
		thumb.setAttribute('end', end);
		thumb.setAttribute('class', 'thumbnail');
		thumb.setAttribute('id', thumbId);
		thumb.setAttribute('onclick', "previewVideo('" + thumbId + "', " + start + ", " + end + ")");
		thumb.setAttribute('width', thumbnailWidth);

		thumbnailContainer.appendChild(thumb);
	};
	//set youtube iFrame to be the same size
	var videoPlayer = document.getElementById("player");
	videoPlayer.setAttribute('width', thumbnailWidth);
}

function resetGifContainer () {
	document.getElementById("gifContainer").innerHTML='<p id="loadingGif">Loading...<i class="fa fa-cog fa-spin fa-lg"></i></p>'; 
}

var showGif = function () {
	gifContainer = document.getElementById("gifContainer");
	response = JSON.parse(this.responseText);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}	
	console.log (response);
	imagePath = response.gif;
	var gif = document.createElement("img");
	gif.setAttribute('src', imagePath);
	gif.setAttribute('class', 'gif');

	gifContainer.innerHTML="";
	gifContainer.appendChild(gif);
	
}

//---------------------------Click listeners-----------------------------

function previewVideo(thumbId, start, end) {
	thumb = document.getElementById(thumbId);
	videoHeight = thumb.offsetHeight - 11;
	
	var bodyRect = document.documentElement.getBoundingClientRect(),
    	elemRect = thumb.getBoundingClientRect(),
    	topOffset = elemRect.top - bodyRect.top,
    	leftOffset = elemRect.left - bodyRect.left;

    var videoPlayer = document.getElementById("player");
	videoPlayer.setAttribute('height', videoHeight);
	videoPlayer.style.top = topOffset + "px";
	videoPlayer.style.left = leftOffset + "px";
	
	var button = document.getElementById("outputGif");
	button.style.top = topOffset + videoHeight/2 + "px";
	button.style.left = leftOffset - 50 + "px";

	videoPlayer.style.visibility = 'visible';
	button.style.opacity = 1

	loopVideo(start, end);
}

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

function outputGif() {
	console.log ('outputting gif');
	console.log ('startTime');
	console.log (startTime);
	console.log ('endTime');
	console.log (endTime);

	var gifBuilder = document.getElementById("gifBuilder");
	resetGifContainer();
	gifBuilder.style.height = "100%";
	gifBuilder.style.opacity = 1;

	createGifUrl = _STATIC_URL + 'authoringTool/makeGif/' + videoId + '?start=' + startTime + '&end=' + endTime;
	console.log("createGifUrl");
	errorMessage = 'There was a problem. The gif could not be loaded.';
	handleRequest(createGifUrl, errorMessage, showGif);

}

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