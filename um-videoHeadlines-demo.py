from flask import Flask, render_template, request, redirect, url_for     # for running the Flask server
import sys                                                               # for obtaining command line arguments
import json

#helper functions
import video

app = Flask(__name__)
app.debug=True

#ultimately how we'll input a URL and be forewarded to that page
@app.route('/')
def umVideoHeadlinesDemo():
    return render_template('um-videoHeadlines-demo.html')

#POST request to download video on submit and redirect to editting tool
@app.route('/authoringTool/', methods=['POST'])
def submitUrl():
    url=request.form['url']
    videoId = video.getVideoInfo(url) #testing
    if videoId:
        return redirect(url_for('authoringTool', videoId=videoId)) #eventually what we want to do is redirect to a different page if not youtube
    else:
        error = "Looks like that's not a valid url."
        return redirect(url_for('umVideoHeadlinesDemo', error=error))

#ultimately how we'll get to access editing a video
@app.route('/authoringTool/<videoId>')
def authoringTool(videoId):
    return render_template('authoringTool.html', videoId=videoId)

@app.route('/authoringTool/sceneDetection/<videoId>')
def sceneDetection(videoId):
    errorCode = 0
    scenes = video.getScenes(videoId)
    videoPath = video.getVideoPath(videoId)
    response = {'errorCode' : errorCode, 'videoPath': videoPath, 'scenes': scenes}
    return json.dumps(response)

@app.route('/authoringTool/makeGif/<videoId>', methods=['GET'])
def makeGif(videoId):
    start = request.args.get('start')
    end = request.args.get('end')
    gif = None
    if (not start or not end):
        errorCode = 1
    else:
        errorCode = 0
        gif = video.processGif(videoId, start, end);
    response = {'errorCode' : errorCode, 'videoId': videoId, 'start': start, 'end': end, 'gif': gif}
    return json.dumps(response)


#this is just a little demo page
@app.route('/ambient-implementations')
def ambientImplementations():
    return render_template('ambient-implementations.html')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "USAGE: python um-videoHeadlines-demo.py [port #]"
    else:
        # app.run(port = int(sys.argv[1])) # run on the specified port number
        app.run(host = "0.0.0.0", port = int(sys.argv[1]))
