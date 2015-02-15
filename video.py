import os, sys, io, json, subprocess
from bs4 import BeautifulSoup
from moviepy.editor import *


_STATIC_URL		= "http://localhost:5000/"
_STATIC_BASE	= "static/video/"

def getVideoInfo(url):
	print "////////////////"
	print "Getting video info..."
	cmd = 'youtube-dl -j ' + url
	try:
		response = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
		videoInfo = json.loads(response)
		videoId = videoInfo['extractor'].strip().replace("-","") + '-' + videoInfo['id']

		outputDir = os.path.join(_STATIC_BASE, videoId)
		infoFileName = os.path.join(outputDir, videoId + '.json')
		if not os.path.exists(outputDir):
			os.makedirs(outputDir)
			with open(infoFileName, "w") as f:
				f.write(json.dumps(videoInfo))
			download(videoId, url)
		return videoId

	except subprocess.CalledProcessError as e:
		error = e.output
		print error
		return False

def download(videoId, url):
	print "////////////////"
	print "Downloading video..."
	videoPath = getVideoPath(videoId)
	# videoPath = os.path.join(_STATIC_BASE, videoId, videoId + '.mp4')
	cmd = 'youtube-dl --recode-video mp4 -o ' + videoPath + ' ' + url
	try:
		response = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
		print response
		detectScenes(videoId)
	except subprocess.CalledProcessError as e:
		error = e.output #we probably want to log the errors somewhere for each file
		print error

def createJson(videoId, input):
	print "////////////////"
	print "Creating json for scenes..."
	f = open(input, 'r')
	shot_xml = BeautifulSoup(f.read())
	f.close()
	shots = []

	for shot in shot_xml.shotdetect.body.shots:
		imgs = shot.findAll("img")
		shot = {"start": float(float(shot["msbegin"])/1000),
				"end": float(float(float(shot["msbegin"])+float(shot["msduration"]))/1000),
				"keyframes": {"in_img": os.path.join(_STATIC_URL,_STATIC_BASE, imgs[0]["src"]),
						   "out_img": os.path.join(_STATIC_URL,_STATIC_BASE, imgs[1]["src"])}}
		shots.append(shot)

	f = open(os.path.dirname(input)+"/scenes.json", "w")
	f.write(json.dumps(shots))
	f.close()

def detectScenes(videoId): #I think I need an error message system here....
	print "////////////////"
	print "Detecting scenes..."
	videoFile = getVideoPath(videoId)
	outputDir = os.path.join(_STATIC_BASE, videoId)
	cmd = 'modules/Shotdetect/build/shotdetect-cmd -i %s -a %s -o %s -v -c -f -l -r'% (videoFile, videoId, _STATIC_BASE)
	os.system(cmd) #need to catch errors here I think
	scenes = createJson(videoId, os.path.join(outputDir, "result.xml"))

def processGif(videoId, start, end):
	print "////////////////"
	print "Processing gif..."
	videoFile = getVideoPath(videoId)
	outputDir = os.path.join(_STATIC_BASE, videoId, "gifs") #output for everything here
	if not os.path.exists(outputDir):
		os.makedirs(outputDir)
	gifName = videoId + "_scene_" + start.replace('.', '-') + "_" + end.replace('.', '-') + ".gif"
	gifPath = os.path.join(outputDir, gifName)
	clip = (VideoFileClip(videoFile)
			.subclip(float(start),float(end)))
	clip.write_gif(gifPath)
	return os.path.join(_STATIC_URL, gifPath)

#-------------------------------------- getters -------------------------------------- 

def getScenes(videoId): #returns shots
	#this is all wrong
	scenesJson = os.path.join(_STATIC_BASE, videoId, 'scenes.json')
	jsonData = open(scenesJson).read()
	scenes = json.loads(jsonData)
	return scenes

def getVideoPath(videoId): #returns shots
	#this is all wrong
	videoFile = os.path.join(_STATIC_BASE, videoId, videoId + '.mp4')
	return videoFile