# 1. Pick the gifs, copy them and paste them into a csv
# 2. open the CSV and turn that into an array
# 3. make a function that parses the name of the file into 
#	-- the YTid
#	-- the start time and end time 
# 4. then make a call to the thing to generate a gif from that start and end time
# 5. make a call to generate an image from the start time
# 6. save everything to the same directory named similar shit.

import os, sys, io, json, subprocess, csv
from moviepy.editor import *

#helper functions
import video

_STATIC_BASE	= "eval/"

def processId (data):
	return data.split('youtube-')[1]

def processTime(data):
	times = data.split('-')
	seconds = times[0]
	mils = '0'
	if len(times) > 1:
		mils = times[1]
	return float (seconds + "." + mils)

def downloadVideo(videoFile, id):
	print "////////////////"
	print "Downloading video..."
	videoURL = "https://www.youtube.com/watch?v=" + id
	cmd = 'youtube-dl --recode-video mp4 -o ' + videoFile + ' ' + videoURL
	try:
		response = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
		print response
	except subprocess.CalledProcessError as e:
		error = e.output 
		print error

def makeGif (id, start, end, gifFileName):
	#check to see if video is downloaded.
	videoFile = os.path.join(_STATIC_BASE, id + ".mp4")
	gifPath = os.path.join(_STATIC_BASE, gifFileName)
	if not os.path.exists(videoFile):
		downloadVideo(videoFile, id)
	#make the gif
	clip = (VideoFileClip(videoFile, audio=False)
		.subclip(float(start),float(end))
		.resize(width=600))
	clip.write_gif(gifPath)
	return

def makeImage (id, start, imageFileName):
	videoFile = os.path.join(_STATIC_BASE, id + ".mp4")
	imagePath = os.path.join(_STATIC_BASE, imageFileName)
	clip = VideoFileClip(videoFile, audio=False)
	clip.save_frame(imagePath, t=float(start)) # saves the frame a t=2s
	os.remove(videoFile)
	return

def addToTsv(id, fileName, gifFileName, imageFileName):
	line = "'" + id.rstrip() + "'\t'" + fileName.rstrip() + "'\t'" + gifFileName.rstrip() + "'\t'" + imageFileName.rstrip() + "'\n"
	w.write(line)
	return

#open the new CSV we'll generate 
w = open("image-data.tsv", 'w')
w.write('id,fileName,gifFileName,imageFileName\n')

#open CSV of images and turn that into an array
f = open("images.csv")
lines = f.readlines()
f.close()
for fileName in lines:
	data = fileName.split('_') #youtube-1WyghkselVE _ scene _ 0-25 _ 5-25--time _symetrize.gif
	id = processId(data[0]).replace('!', "_")
	# print "Id:" + id
	start = processTime(data[2])
	end = processTime(data[3])
	# print "time:" + str(start) + " " + str(end)
	gifFileName = fileName.split("--")[0] + ".gif"
	imageFileName = data[0] + "_still_" + data[2] + ".png"
	# print gifFileName + " " + imageFileName
	makeGif(id, start, end, gifFileName)
	makeImage(id, start, imageFileName)
	#remove youtube video
	addToTsv(id, fileName, gifFileName, imageFileName)

w.close()

