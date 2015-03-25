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
var maxGifLength = 15;

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
	$('document').ready(function(){
		buildSplitMaskCanvas();
	});

}

//---------------------------Set up mask canvases-----------------------------

function buildSplitMaskCanvas () {
	var canvas = document.getElementById('region-mask'),
    ctx = canvas.getContext('2d'),
    rect = {},
    drag = false;

	function draw() {
	  ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
	}

	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
		  x: evt.clientX - rect.left,
		  y: evt.clientY - rect.top
		};
	}

	function mouseDown(e) {
	  // rect.startX = e.pageX - this.offsetLeft;
	  // rect.startY = e.pageY - this.offsetTop;
	  rect.startX = getMousePos(canvas, e).x;
	  rect.startY = getMousePos(canvas, e).y;
	  drag = true;
	}

	function mouseUp() {
	  drag = false;
	}

	function mouseMove(e) {
	  if (drag) {
	    rect.w = (e.pageX - this.offsetLeft) - rect.startX;
	    rect.h = (e.pageY - this.offsetTop) - rect.startY ;
	    ctx.clearRect(0,0,canvas.width,canvas.height);
	    draw();
	  }
	}

	function init() {
	  canvas.addEventListener('mousedown', mouseDown, false);
	  canvas.addEventListener('mouseup', mouseUp, false);
	  canvas.addEventListener('mousemove', mouseMove, false);
	}

	init();
}

function maskButtonClicked () {
	$( "#split-mask-button" ).toggleClass( "hide-mask-button" );
	$( "#region-mask-button" ).toggleClass( "hide-mask-button" );
	$( "#region-mask" ).addClass( "mask-hidden" );
	$( "#split-mask" ).addClass( "mask-hidden" );
}

function splitMaskButtonClicked () {
	$( "#region-mask" ).addClass( "mask-hidden" );
	$( "#split-mask" ).toggleClass( "mask-hidden" );
}

function regionMaskButtonClicked () {
	$( "#split-mask" ).addClass( "mask-hidden" );
	$( "#region-mask" ).toggleClass( "mask-hidden" );
}

//---------------------------JQuery UI slider-----------------------------

function initSlider() {
	$(function() {
		startTime = 10.05;
		duration = 5;
		endTime = startTime + duration;
		var videoDuration = player.getDuration();
	    $( "#slider-range" ).slider({
	      min: 0,
	      max: videoDuration,
	      step: .001,
	      value: startTime,
	      slide: function(event, ui) {
            startTime = ui.value;
            endTime = startTime + duration;
	        $( "#start" ).val(startTime);
	        loopVideo(); 
	        refreshThumbnails();
	      }
	    });
	    $( "#start" ).val(startTime);
	    $( "#duration" ).val(duration);

	    $( "#start" ).change(function() {
	    	startTime = $(this).val();
		    $( "#slider-range" ).slider( "value", startTime );
		    loopVideo();
		    refreshThumbnails();
		});
	    $( "#duration" ).change(function() {
	    	duration = parseFloat($(this).val());
	    	endTime = startTime + duration;
		    loopVideo();
		    refreshThumbnails();
		});

	});

}

//---------------------------Thumbnails & youtube preview + looping -----------------------------

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


//---------------------------JQuery UI buttonset for loop type selection -----------------------------

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

//---------------------------The place where shit gets built as a result of asynch calls-----------------------------

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







