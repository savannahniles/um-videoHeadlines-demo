from flask import Flask, render_template, request, redirect, url_for     # for running the Flask server
import sys                                                               # for obtaining command line arguments
import json
import csv
import time

#helper functions
import video

app = Flask(__name__)
app.debug=True

#landing page
@app.route('/')
def landingPage():
    return render_template('landing-page.html')

#home/start page
@app.route('/start')
def umVideoHeadlinesDemo():
    return render_template('um-videoHeadlines-demo.html')

#page for editing a video
@app.route('/authoringTool/<videoId>')
def authoringTool(videoId):
    return render_template('authoringTool.html', videoId=videoId)



#------- API ---------


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


@app.route('/authoringTool/makeGif/<videoId>', methods=['GET'])
def makeGif(videoId):
    errorCode = 0
    start = request.args.get('start')
    end = request.args.get('end')
    gif = None
    loop = request.args.get('loop')
    maskType = request.args.get('maskType')
    mask = request.args.get('mask')
    if (not start or not end): #check to make sure start and end are in the URL, change to None to avoid errors if not
        errorCode = "no start or end time"
        start = 0
        end = 0
    else:
        gif = video.processGif(videoId, start, end, loop, maskType, mask)
        if (not gif): #check to see if there was a problema nd there's no gif
            errorCode = "no gif"
    response = {'errorCode' : errorCode, 'videoId': videoId, 'start': float(start), 'end': float(end), 'loop': loop, 'maskType': maskType, 'mask': mask, 'gif': gif}
    return json.dumps(response)

#route to generate a thumbnail
@app.route('/authoringTool/makeThumbnails/<videoId>', methods=['GET'])
def makeThumbnails(videoId):
    errorCode = 0
    start = request.args.get('start')
    end = request.args.get('end')
    startThumb = None
    endThumb = None
    ts = str(time.time())
    if (not start or not end): #check to make sure start and end are in the URL, change to None to avoid errors if not
        errorCode = "no start or end time"
        start = 0
        end = 0
    else:
        startThumb = video.createThumbnail(videoId, start, "start") + "?time=" + ts
        endThumb = video.createThumbnail(videoId, end, "end") + "?time=" + ts
        if (not startThumb or not endThumb): #check to see if there was a problema nd there's no gif
            errorCode = "no thumbnails"
    response = {'errorCode' : errorCode, 'startThumb': startThumb, 'endThumb': endThumb}
    return json.dumps(response)

#route to look for loops
@app.route('/authoringTool/loopDetection/<videoId>', methods=['GET'])
def returnLoops(videoId):
    errorCode = 0
    loops = video.loopDetection(videoId)
    response = {'errorCode' : errorCode, 'loops': loops}
    return json.dumps(response)



#------- routes for demos ---------


#grid for demos
@app.route('/grid/<data>', methods=['GET'])
def grid(data): 
    w = request.args.get('w')
    h = request.args.get('h')
    m = request.args.get('m')
    head = request.args.get('head')
    return render_template('grid.html', data=data, w=w, h=h, m=m, head=head)

#ultimately how we'll input a URL and be forewarded to that page
@app.route('/slideshow-demo')
def home():
    data = "news"
    return render_template('slideshow-demo.html')

#------- Serving ---------


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "USAGE: python um-videoHeadlines-demo.py [port #]"
    else:
        # app.run(port = int(sys.argv[1])) # run on the specified port number
        app.run(host = "0.0.0.0", port = int(sys.argv[1]))

