import os, sys

def download(url):
    return "static/video/starbucks/starbucks" #hardcoded for now, can't have mp4 in it I guess

def detectScenes(videoPath): #to dos: remove need for text file, figure out first scene
    scenes = []

    print ' ================= '
    print 'Detecting shot boundaries...'
    print ' ================= '
    if os.path.exists('scenes.txt'):
        os.remove('scenes.txt')
    cmd = 'ffprobe -show_frames -of compact=p=0 -f lavfi "movie='+ videoPath + '.mp4,select=gt(scene\,0.3)">> scenes.txt'
    os.system(cmd)

    # # uncompress the movie file for accurate partition
    # # skip this if you do not need high accuracy
    # print ' ================= '
    # print 'computing raw video for accurate segmentation...'
    # print ' ================= '
    # cmd = 'ffmpeg -i starbucks.mp4 -vcodec rawvideo -acodec copy uncompressed.avi' #pcm_s16le
    # os.system(cmd)

    # read time stamps for keyframes
    print ' ================= '
    print 'Partitioning video...'
    print ' ================= '
    seginfo = 'scenes.txt'
    te = '0'
    count = 0
    #get start time
    for line in open(seginfo,'r'):
    	scene = {
            'startTime': "",
            'endTime': ""
        }
        line = line.replace("|"," ")
        line = line.replace("="," ")
        parts = line.split()
        te = parts[11] # timestamp
        #same the frame for the scene
        if os.path.exists(videoPath + '-' + str(count) + '.jpg'):
            os.remove(videoPath + '-' + str(count) + '.jpg')
        cmd = 'ffmpeg -ss ' + te + ' -i '+ videoPath + '.mp4 -frames:v 1 ' + videoPath + '-' + str(count) + '.jpg' #generate a thumbnail image for each scene
        os.system(cmd)
        #save the scene start time
        te = float(te)
        scene['startTime'] = te
        scenes.append(scene)
        count = count + 1 #increment scene count
    os.remove('scenes.txt')
    for i, scene in enumerate(scenes):
    	if i+1 != len(scenes):
    		scene['endTime'] = scenes[i+1]["startTime"]
    return scenes







