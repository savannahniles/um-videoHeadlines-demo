//prepare a json object that we're going to fill with data
//show them an intro and ask them to get started
//accept a collection of images/gifs from the server in a big json object much like the grid does it
//show the image and start a timer
//when they click the images, show the video and stop the timer
//resume the timer if they exit the video
//when they click to the next image, record the time and the interaction
//when they end, send the whole info set to the server

var data;
var currentImage = 0;
var nextImage = 1;
var evenImageDiv, oddImageDiv;
var _STATIC_URL = "/";


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


function next () {

	//reset
	currentImage += 1;
	nextImage += 1;
	if (data.length == currentImage) {
		currentImage = 0;
		nextImage = 1;

		evenImageDiv.innerHTML = buildImage (currentImage);
		evenImageDiv.setAttribute( "id", "current" );
		oddImageDiv.innerHTML = buildImage (nextImage);
		oddImageDiv.setAttribute( "id", "next" );

	}
	else {
		setImages ();
	}	
}

function fullscreen() {

	if (document.webkitFullscreenEnabled) { 
		document.body.webkitRequestFullscreen();
	}

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
	//set text 
	document.getElementById("headline").innerHTML = data[currentImage].title + " " + "<span class='specialFont'>" + data[currentImage].source + "</span>";

	html = '<img src=" ' +data[index].gifUrl+  '  ">';
	return html;
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







