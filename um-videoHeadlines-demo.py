from flask import Flask, render_template, request   # for running the Flask server
import sys                                          # for obtaining command line arguments
import json

#helper functions
import video

app = Flask(__name__)
app.debug=True

@app.route('/')
def umVideoHeadlinesDemo():
    return render_template('um-videoHeadlines-demo.html')

@app.route('/ambient-implementations')
def ambientImplementations():
    return render_template('ambient-implementations.html')

@app.route('/demo1')
def demo1():
    return render_template('demo1.html')

@app.route('/demo1/sceneDetection/<url>')
def sceneDetection(url):
    errorCode = 0
    videoPath = video.download(url);
    scenes = video.detectScenes(videoPath)
    response = {'errorCode' : errorCode, 'url' : url, 'videoPath': videoPath, 'scenes': scenes}
    return json.dumps(response)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "USAGE: python um-videoHeadlines-demo.py [port #]"
    else:
        # app.run(port = int(sys.argv[1])) # run on the specified port number
        app.run(host = "0.0.0.0", port = int(sys.argv[1]))
