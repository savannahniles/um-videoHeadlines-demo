from moviepy.editor import VideoFileClip
from moviepy.video.tools.cuts import FramesMatches

# Open a video file (any format should work)
clip = VideoFileClip("looping-tests/patriots.mp4")

# Downsize the clip to a width of 150px to speed up things
clip_small = clip.resize(width=150)

# Find all the pairs of matching frames an return their
# corresponding start and end times. Takes 15-60 minutes.
matches = FramesMatches.from_clip(clip_small, 5, 3)

# (Optional) Save the matches for later use. 
matches.save("myvideo_matches.txt")
matches = FramesMatches.load("myvideo_matches.txt")

# Filter the scenes: keep only segments with duration >1.5 seconds,
# where the first and last frame have a per-pixel distance < 1,
# with at least one frame at a distance 2 of the first frame,
# and with >0.5 seconds between the starts of the selected segments.
selected_scenes = matches.select_scenes(match_thr=10, min_time_span=1.5, nomatch_thr=.5, time_distance=1)
print " ______ selected_scenes ______ "
# print selected_scenes

# The final GIFs will be 450 pixels wide
clip_medium = clip.resize(width=450)

# Extract all the selected scenes as GIFs in folder "myfolder"
selected_scenes.write_gifs(clip_medium, "myfolder")