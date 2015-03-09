<h1>Glyph</h1>

<h2>About:</h2>

Glyph is a tool for visually manipulating video for integration onto wearable devices, ambient displays, and media interfaces. The web-based tool allows anyone to create highly compressive and editorialized looping gifs from video. A series of small, screen-equipped objects integrate the resulting, subtly-dynamic images quietly and meaningfully into the background of our environments. 

Pixels increasingly occupy our peripheries, via mobile devices, wearables, and ambient displays. But a future of ubiquitous, peripheral pixels is a problem for video. Video is high-cognitive load, requiring most of your attention to take in. On the other hand, video is high-impact: in both narrative and in news media, video surpasses text or still images in its ability to provide a window to the settings, the faces, and the first-person accounts that actualize the stories it depicts.

Most media interfaces (such as mobile devices and social feeds) are accessed by users with divided attentions. In these contexts, there’s value in presenting video in a way that reduces its high cognitive load but preserves its high emotional impact. Gifs often do this. They excerpt enough data from video to approximate the “glanceability” of still images. They invite our attention, rather than demand it.

Existing web-based gif-generation tools afford few editorial controls beyond choosing a clip start and end time. The problem with this is that deriving succinct and meaningful excerpts from video suitable for the interfaces in our peripheries might require 'paraphrasing’-- diminishing some regions of movement in the clip, and highlighting others; erasing a jarring jump between the start and end of the gif; imbuing a still image with just enough dynamism to hold our eyes and pique our interest.

Glyph is a tool that facilitates such “paraphrasing” to quickly build cogent and expressive gifs from web and YouTube videos in order to atomize video to compressive and evocative excerpts. The tool integrates existing methods for scene detection, video stabilization, video manipulation, and loop detection into a simple, web-based authoring interface.

Glyph creates output that includes seamless or nearly seamless loops and cinemagraphs. The subtle, dynamic images produced with Glyph are lightweight, evocative, and transmissible, and thus better suited than video for integration onto wearable devices, ambient displays, and other media interfaces where content is high-velocity and user attention is divided, such as news and social feeds. Reflecting the participatory spirit of audiences today, Glyph allows audiences to create expressive edits from most news and narrative video on the web.

<h2>Installation</h2>

To install this application, first block out a few hours of an afternoon. Just kidding. I think this should take care of things:

First nstall OpenCV, ffmpeg, and Imagemagik on your system. You can use Homebrew.

Then install python dependencies in your virtual environment:

```
pip install flask moviepy beautifulsoup4
```

3. Then just run:

```
python um-videoHeadlines-demo.py 5000
```

You might get an error about a failure to import cv2. MoviePy requires cv2 to run and is the one calling it. You should link your Python wrapper to the Python you're running via your vitural environment. 


