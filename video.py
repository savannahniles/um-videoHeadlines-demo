import os, sys, io, json, subprocess
from bs4 import BeautifulSoup
from moviepy.editor import *
import moviepy.video.tools.drawing as dw #for masking
from moviepy.video.tools.cuts import FramesMatches #for loop detection


_STATIC_URL		= "/"
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
	cmd = 'youtube-dl --recode-video mp4 -o ' + videoPath + ' ' + url
	try:
		response = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
		print response
	except subprocess.CalledProcessError as e:
		error = e.output #we probably want to log the errors somewhere for each file
		print error

def createThumbnail(videoId, time, startOrEnd):
	print "////////////////"
	print "Processing thumbnail..."
	videoFile = getVideoPath(videoId)
	thumbnailPath = os.path.join(_STATIC_BASE, videoId, startOrEnd + ".png" )
	clip = VideoFileClip(videoFile, audio=False)
	clip.save_frame(thumbnailPath, t=float(time)) # saves the frame a t=2s
	return os.path.join(_STATIC_URL, thumbnailPath)

def loopDetection(videoId):
	print "////////////////"
	print "Looking for loops..."

	outputDir = os.path.join(_STATIC_BASE, videoId)
	selected_scenes_file = os.path.join(outputDir, "selected_scenes.txt") #ultimately what we want to fill
	if not os.path.exists(selected_scenes_file):

		videoFile = getVideoPath(videoId)
		clip = VideoFileClip(videoFile, audio=False)
		
		clip_small = clip.resize(width=150) # Downsize the clip to a width of 150px to speed up things

		matches = FramesMatches.from_clip(clip_small, 5, 3) # Find all the pairs of matching frames an return their corresponding start and end times.
		# matchesFile = os.path.join(outputDir, "matches.txt") # (Optional) Save the matches for later use. 
		# matches.save(matchesFile)
		# matches = FramesMatches.load(matchesFile)

		# Filter the scenes: keep only segments with duration >1.5 seconds,
		# where the first and last frame have a per-pixel distance < 1,
		# with at least one frame at a distance 2 of the first frame,
		# and with >0.5 seconds between the starts of the selected segments.
		selected_scenes = matches.select_scenes(match_thr=10, min_time_span=1.5, nomatch_thr=.5, time_distance=1)

		print " ______ selected_scenes ______ " #if any
		selected_scenes.save(selected_scenes_file) #save selected scenes

	scenes = []
	ss = open(selected_scenes_file, "r")
	for line in ss:
		start, end, c, d = line.split("\t")
		scene = {
			'start': start,
			'end': end
		}
		scenes.append(scene)
	return scenes

def time_symetrize(clip):
	""" Returns the clip played forwards then backwards. In case
	you are wondering, vfx (short for Video FX) is loaded by
	>>> from moviepy.editor import * """
	return concatenate([clip, clip.fx( vfx.time_mirror )])

def mask_outsideRegion(clip):
	return clip.fx(vfx.freeze_region, outside_region=(200, 200, 379, 322))

def processGif(videoId, start, end, loop, maskType, mask):
	print "////////////////"
	print "Processing gif..."

	videoFile = getVideoPath(videoId)
	gifPath = getGifPath(videoId, start, end, loop, maskType, mask)
	print gifPath

	clip = (VideoFileClip(videoFile, audio=False)
			.subclip(float(start),float(end))
			.resize(width=600)) #.crop(x1=138.7,x2=640, y1=0, y2=512.8))
	composition = clip
	d = clip.duration

	#deal with looping
	if (loop == "time_symetrize"):
		composition = clip.fx( time_symetrize )
		d = d*2
		print("in time_symetrize")
	if (loop == "progressive_fade"):
		clip = clip.crossfadein(d/2)
		composition = (CompositeVideoClip([clip, clip.set_start(d/2), clip.set_start(d)]).subclip(d/2, 3*d/2))
	if (loop == "still_fade"):
		snapshot = (clip.to_ImageClip()
	            .set_duration(d/6)
	            .crossfadein(d/6)
	            .set_start(5*d/6))
		composition = CompositeVideoClip([clip, snapshot])

	#deal with masking
	if (maskType):
		p = mask.split(',')
	if (maskType == 'maskLeft' or maskType == 'maskRight'): #maskLeft means the left side will be masked, splitRight means right side will be masked
		colLeft = 1 #col1 determines if the left side of the images is still (1) or animated (0)
		colRight = 0
		if maskType == 'maskRight':
			colLeft = 0
			colRight = 1		
		clipMask = dw.color_split(clip.size, p1=(float(p[0]), float(p[1])), p2=(float(p[2]), float(p[3])), col1=colLeft, col2=colRight, grad_width=25) # blur the mask's edges
		snapshot = (clip.to_ImageClip(t=0)
				.set_duration(d)
				.set_mask(ImageClip(clipMask, ismask=True)))
		composition = CompositeVideoClip([composition,snapshot])
	if (maskType == 'maskOuter'):
		composition = clip.fx(vfx.freeze_region, outside_region=(p[0], p[1], p[2], p[3]))
	if (maskType == 'maskInner'):
		print("in mask_inner")
		freeze = (clip.fx(vfx.crop, x1=p[0], y1=p[1], x2=p[2], y2=p[3])
				.to_ImageClip(t=0)
				.set_duration(d)
				.set_position((p[0],p[1])))
		composition = CompositeVideoClip([composition, freeze])

	composition.write_gif(gifPath)
	return os.path.join(_STATIC_URL, gifPath)

#-------------------------------------- getters -------------------------------------- 

def getVideoPath(videoId):
	videoFile = os.path.join(_STATIC_BASE, videoId, videoId + '.mp4')
	return videoFile

def getGifPath(videoId, start, end, loop, maskType, mask): #returns shots
	outputDir = os.path.join(_STATIC_BASE, videoId, "gifs") #output for everything here
	if not os.path.exists(outputDir):
		os.makedirs(outputDir)
	gifOptions = ""
	if loop:
		gifOptions = "--" + loop
	if maskType:
		gifOptions = gifOptions + "--" + maskType + "_mask" + mask
	gifName = videoId + "_scene_" + start.replace('.', '-') + "_" + end.replace('.', '-') + gifOptions + ".gif"
	gifPath = os.path.join(outputDir, gifName)
	return gifPath










# def createJson(videoId, input):
# 	print "////////////////"
# 	print "Creating json for scenes..."
# 	f = open(input, 'r')
# 	shot_xml = BeautifulSoup(f.read())
# 	f.close()
# 	shots = []

# 	for shot in shot_xml.shotdetect.body.shots:
# 		imgs = shot.findAll("img")
# 		shot = {"start": float(float(shot["msbegin"])/1000),
# 				"end": float(float(float(shot["msbegin"])+float(shot["msduration"]))/1000),
# 				"keyframes": {"in_img": os.path.join(_STATIC_URL,_STATIC_BASE, imgs[0]["src"]),
# 						   "out_img": os.path.join(_STATIC_URL,_STATIC_BASE, imgs[1]["src"])}}
# 		shots.append(shot)

# 	f = open(os.path.dirname(input)+"/scenes.json", "w")
# 	f.write(json.dumps(shots))
# 	f.close()

# def detectScenes(videoId): #I think I need an error message system here....
# 	print "////////////////"
# 	print "Detecting scenes..."
# 	videoFile = getVideoPath(videoId)
# 	outputDir = os.path.join(_STATIC_BASE, videoId)
# 	cmd = 'modules/Shotdetect/build/shotdetect-cmd -i %s -a %s -o %s -v -c -f -l -r'% (videoFile, videoId, _STATIC_BASE)
# 	os.system(cmd) #need to catch errors here I think
# 	scenes = createJson(videoId, os.path.join(outputDir, "result.xml"))




