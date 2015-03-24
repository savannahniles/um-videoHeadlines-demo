//---------------------------Load the video-----------------------------

var _STATIC_URL = "/";
var videoId;

//download YouTube player API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); // Create YouTube player(s) after the API code downloads.

var player, startTime, endTime;
var timeUpdater = null;
var thumbnailUpdater = null;
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
	videoId = id;
	initLoopButtons();

}

//---------------------------JQuery UI slider-----------------------------

function initSlider() {
	$(function() {
		startTime = 10.05;
		endTime = 14.90;
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
	        loopVideo(); 
	        refreshThumbnails();
	      }
	    });
	    $( "#start" ).val(startTime);
	    $( "#end" ).val(endTime);

	    $( "#start" ).change(function() {
	    	startTime = $(this).val();
		    $( "#slider-range" ).slider( "values", [startTime, endTime] );
		    loopVideo();
		    refreshThumbnails();
		});
	    $( "#end" ).change(function() {
	    	endTime = $(this).val();
		    $( "#slider-range" ).slider( "values", [startTime, endTime] );
		    loopVideo();
		    refreshThumbnails();
		});

	});

}

//---------------------------Thumbnails & youtube preview looping -----------------------------

function loopVideo() {
	console.log ("startTime: " + startTime);
	console.log ("endTime: " + endTime);

	player.mute();
  	clearInterval(timeUpdater);
	player.seekTo(startTime);
	function updateTime () {
		if (player.getCurrentTime() > endTime) {
			console.log("the video reached the end time! " + endTime);
			player.seekTo(startTime);
		}
	}
	timeUpdater = setInterval(updateTime, 100);
}

function refreshThumbnails() {
	clearTimeout(thumbnailUpdater);
	function getThumbnails() {
		console.log ("refreshThumbnails " + startTime + " " + endTime);
		var thumbnailUrl = _STATIC_URL + 'authoringTool/makeThumbnails/' + videoId + '?start=' + startTime + '&end=' + endTime;
		var errorMessage = 'There was a problem. The thumbnails could not be loaded.';
		handleRequest(thumbnailUrl, errorMessage, showThumbnails);
	}
	thumbnailUpdater = setTimeout(getThumbnails, 1000);
}


//---------------------------JQuery UI buttonset for loops -----------------------------

function initLoopButtons () {
	//init radio buttons
	$(function() {
	    $( "#loop" ).buttonset();
	});

}

function getLoopVal() {
    var val = "";
    // get list of radio buttons with specified name
    var radios = document.getElementsByClassName("loopButton");
    
    // loop through list of radio buttons
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            val = radios[i].value; // if so, hold its value in val
            break; // and break out of for loop
        }
    }
    return val; // return value of checked radio or undefined if none checked
}

//---------------------------The place where shit gets built-----------------------------

function resetGifContainer () {
	document.getElementById("gifContainer").innerHTML='<p id="loadingGif"><i class="fa fa-spinner fa-spin fa-3x fa-fw margin-bottom"></i></br>Generating your gif...</p>'; 
}

var showGif = function () {
	gifContainer = document.getElementById("gifContainer");
	response = JSON.parse(this.responseText);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}	
	// console.log (response);
	imagePath = response.gif;
	var gif = document.createElement("img");
	gif.setAttribute('src', imagePath);
	gif.setAttribute('class', 'gif');

	gifContainer.innerHTML="";
	gifContainer.appendChild(gif);
	document.getElementById("rightColTitle").innerHTML = "Like it? Right click to save."
	
}

//we could clean these two up if we wanted

var showThumbnails = function () {
	console.log ("here!")
	startContainer = document.getElementById("startFrame");
	endContainer = document.getElementById("endFrame");
	response = JSON.parse(this.responseText);
	console.log (response);
	if (!response) {
		handleError ("Whoops, error getting response.")
		return;
	}
	var startThumbnail = document.createElement("img");
	startThumbnail.setAttribute('src', response.startThumb);
	startThumbnail.setAttribute('class', 'thumb');
	var endThumbnail = document.createElement("img");
	endThumbnail.setAttribute('src', response.endThumb);
	endThumbnail.setAttribute('class', 'thumb');

	startContainer.innerHTML="";
	startContainer.appendChild(startThumbnail);
	endContainer.innerHTML="";
	endContainer.appendChild(endThumbnail);

}

//---------------------------Click listeners-----------------------------

function focusLeft () {
	document.getElementById("gifBuilder").style.left = "0";
}

function focusRight () {
	document.getElementById("gifBuilder").style.left = "-70%";
}

function outputGif() {
	//check length of gif
	if (endTime - startTime > maxGifLength) {
		handleError("This clip is too long. Get the clip under " + maxGifLength + " seconds, and then you can process it.");
		return;
	}

	clearError ();
	player.pauseVideo();
	resetGifContainer();

	var loop = getLoopVal(); //get loop value
	var mask = ""; //get mask value, needs fixing

	var createGifUrl = _STATIC_URL + 'authoringTool/makeGif/' + videoId + '?start=' + startTime + '&end=' + endTime + '&loop=' + loop + '&mask=' + mask;
	var errorMessage = 'There was a problem. The gif could not be loaded.';
	handleRequest(createGifUrl, errorMessage, showGif);

}

// function mask () {
// 	console.log ('Masking...');
// 	var gifBuilder = document.getElementById("gifBuilder");
// 	resetGifContainer();

// 	var createGifUrl = _STATIC_URL + 'authoringTool/mask/' + videoId + '?start=' + startTime + '&end=' + endTime;
// 	var errorMessage = 'There was a problem. The mask could not be created.';
// 	handleRequest(createGifUrl, errorMessage, showGif);
// }

// function loop1 () {
// 	console.log ('Masking...');
// 	var gifBuilder = document.getElementById("gifBuilder");
// 	resetGifContainer();

// 	var createGifUrl = _STATIC_URL + 'authoringTool/loop1/' + videoId + '?start=' + startTime + '&end=' + endTime;
// 	var errorMessage = 'There was a problem. The mask could not be created.';
// 	handleRequest(createGifUrl, errorMessage, showGif);
// }

// function fade1 () {
// 	console.log ('Masking...');
// 	var gifBuilder = document.getElementById("gifBuilder");
// 	resetGifContainer();

// 	var createGifUrl = _STATIC_URL + 'authoringTool/fade1/' + videoId + '?start=' + startTime + '&end=' + endTime;
// 	var errorMessage = 'There was a problem. The mask could not be created.';
// 	handleRequest(createGifUrl, errorMessage, showGif);
// }

// function fade2 () {
// 	console.log ('Masking...');
// 	var gifBuilder = document.getElementById("gifBuilder");
// 	resetGifContainer();

// 	var createGifUrl = _STATIC_URL + 'authoringTool/fade2/' + videoId + '?start=' + startTime + '&end=' + endTime;
// 	var errorMessage = 'There was a problem. The mask could not be created.';
// 	handleRequest(createGifUrl, errorMessage, showGif);
// }

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

function clearError () {
	document.getElementById("error").innerHTML = "";
}

//---------------------------Helpers---------------------------

// function formatTime(seconds) {
// 	var totalSec = seconds;
// 	var hours = parseInt( totalSec / 3600 ) % 24;
// 	var minutes = parseInt( totalSec / 60 ) % 60;
// 	var seconds = parseInt(totalSec) % 60;
// 	var millis = parseInt((totalSec % 1)*1000);

// 	var result = (hours == 0 ? "" : hours + ":") + minutes + ":" + (seconds  < 10 ? "0" + seconds : seconds) + "." + millis
// 	return result;
// }







