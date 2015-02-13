Telecorrelator
==============

To start the server
-------------------

python telecorrelator.py [portnumber]





---

dependencies:
installing openCV via brew, you need a soft link to cv2 from brew cellar where openCV is and you need to put that softlink into your Venv site-packages
in site-packages of venv
ln -s /usr/local/Cellar/opencv/2.4.9/lib/python2.7/site-packages/cv* .

hugin, which we installed with brew cask:
brew install caskroom/cask/brew-cask
brew cask install hugin
Hugin has a scripting interface thats called hsi which is a huge pain.
ln -s /opt/homebrew-cask/Caskroom/hugin/2014.0.0/Hugin.app/Contents/Frameworks/Python27.framework/Versions/2.7/lib/python2.7/site-packages/* .


install ffmpeg 
(write this)

all the pip freeze stuff

shotdetect
and 
loop detect

brew install numpy