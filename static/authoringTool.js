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
var maxGifLength = 5;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player-toggle', {
		events: {
			'onReady': onPlayerReady
		}
	}); 
}

function onPlayerReady(evt) {
    initSlider();
}


//---------------------------Set the page up (content + listeners)-----------------------------

function init(id) {
	videoId = id
}

//---------------------------JQuery UI slider-----------------------------

function initSlider() {
	$(function() {
		startTime = 0;
		endTime = 14.9;
		var duration = player.getDuration();
		var maxLength = 15;
	    $( "#slider-range" ).slider({
	      range: true,
	      min: 0,
	      max: duration,
	      maxRange: maxLength,
	      step: .001,
	      values: [ startTime, endTime ],
	      slide: function(event, ui) {
            startTime = ui.values[0];
	      	endTime = ui.values[1]
	        $( "#start" ).val(startTime);
	        $( "#end" ).val(endTime);
	        loopVideo(startTime, endTime); 
	      }
	    });
	    $( "#start" ).val(startTime);
	    $( "#end" ).val(endTime);

	    $( "#start" ).change(function() {
	    	startTime = $(this).val();
		    $( "#slider-range" ).slider( "values", [startTime, endTime] );
		    loopVideo(startTime, endTime);
		});
	    $( "#end" ).change(function() {
	    	endTime = $(this).val();
		    $( "#slider-range" ).slider( "values", [startTime, endTime] );
		    loopVideo(startTime, endTime);
		});

	});

}

//---------------------------The place where shit gets built-----------------------------

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

function loopVideo(start, end) {
	player.mute();
  	clearInterval(timeupdater);
  	startTime = start;
  	endTime = end;
	player.seekTo(start);
	function updateTime () {
		if (player.getCurrentTime() > end) {
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

	if (endTime - startTime > maxGifLength) {
		handleError("This clip is too long. Get the clip under 20 seconds, and then you can process it.");
		return;
	}

	player.pauseVideo();


	var gifBuilder = document.getElementById("gifBuilder");
	resetGifContainer();

	var createGifUrl = _STATIC_URL + 'authoringTool/makeGif/' + videoId + '?start=' + startTime + '&end=' + endTime;
	var errorMessage = 'There was a problem. The gif could not be loaded.';
	handleRequest(createGifUrl, errorMessage, showGif);

}

function mask () {
	console.log ('Masking...');
	var gifBuilder = document.getElementById("gifBuilder");
	resetGifContainer();

	var createGifUrl = _STATIC_URL + 'authoringTool/mask/' + videoId + '?start=' + startTime + '&end=' + endTime;
	var errorMessage = 'There was a problem. The mask could not be created.';
	handleRequest(createGifUrl, errorMessage, showGif);
}

function loop1 () {
	console.log ('Masking...');
	var gifBuilder = document.getElementById("gifBuilder");
	resetGifContainer();

	var createGifUrl = _STATIC_URL + 'authoringTool/loop1/' + videoId + '?start=' + startTime + '&end=' + endTime;
	var errorMessage = 'There was a problem. The mask could not be created.';
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
	document.getElementById("error").innerHTML = errorMessage;
}

//---------------------------Helpers---------------------------

function formatTime(seconds) {
	var totalSec = seconds;
	var hours = parseInt( totalSec / 3600 ) % 24;
	var minutes = parseInt( totalSec / 60 ) % 60;
	var seconds = parseInt(totalSec) % 60;
	var millis = parseInt((totalSec % 1)*1000);

	var result = (hours == 0 ? "" : hours + ":") + minutes + ":" + (seconds  < 10 ? "0" + seconds : seconds) + "." + millis
	return result;
}







