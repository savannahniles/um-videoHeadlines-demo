var urlForm, thumbnailContainer, gifEditor;

//---------------------------Prompt the user to input a url-----------------------------

function submitUrl() { //called when the user clicks submit
	urlForm = document.getElementById('url-form');
	var url = document.getElementById('url').value //needs to be validated. 
	console.log(url);
	getContent(url); //passes the url to getContent which passes it off to init
	urlForm.innerHTML = "Get cozy, this shit takes a minute."; //replace with a loading animation
}

function getContent(url) {
	var request = new XMLHttpRequest();
	request.onload = init; //calls init once response is received

	request.open('GET', '/demo1/sceneDetection/' + url, true); // request a renderObject from the server
	request.send();
}

//---------------------------Create the video scene/gif selector-----------------------------

function init() {
	console.log("init");
	//initialize variables
	thumbnailContainer = document.getElementById('thumbnails-container');
	gifEditor = document.getElementById('gif-editor');

	var response = JSON.parse(this.responseText);
	if (response.errorCode != 0) {
		console.log ("whoops error"); // there was an error, replace something here on the site with error
		return;
	}

	urlForm.remove();
	console.log("response: ");
	console.log(response);
	buildThumbnails(response);

}

function buildThumbnails (response) {
	console.log ("Building thumbnails.");
	totalScenes = response.scenes.length
	for (var i = 0; i < totalScenes; i++) {
		startTime = parseInt(response.scenes[i]['startTime']);
		endTime = parseInt(response.scenes[i]['endTime']);
		// if (i == totalScenes-1) { //if i is the last one
		// 	endTime = -1
		// }
		// else {
		// 	endTime = response.scenes[i+1]['startTime']
		// }
		imagePath = response.videoPath + "-" + i + ".jpg"

		var thumb = document.createElement("img");
		console.log (thumb);
		thumb.setAttribute('src', imagePath);
		thumb.setAttribute('startTime', startTime);
		thumb.setAttribute('endTime', endTime);
		thumb.setAttribute('videoPath', response.videoPath);
		thumb.setAttribute('class', 'thumbnail');
		thumb.setAttribute('onclick', 'thumbnailClicked(event)');

		thumbnailContainer.appendChild(thumb);
	};

}

function thumbnailClicked (event) {
	console.log ("Building edittor.");
	thumbnailContainer.innerHTML = "";
	console.log(event);
	startTime = event.target.attributes.startTime.nodeValue;
	endTime = event.target.attributes.endTime.nodeValue;
	videoPath = event.target.attributes.videoPath.nodeValue + '.mp4';

	//add movie
	var video = document.createElement("video");
	video.setAttribute('src', videoPath + '#t=' + startTime + ',' + endTime);
	video.setAttribute('type', 'video/mp4');
	video.setAttribute('controls', true);
	video.setAttribute('autoplay', true);
	video.setAttribute('loop', true);

	gifEditor.appendChild(video);

	
}

