from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 
import cv2
import os
from roboflow import Roboflow

rf = Roboflow(api_key="LF4lxbBefvMh8W3awrgv")

project_f = rf.workspace().project("face-emotion-s9kw9")
model_f = project_f.version(1).model

project_d = rf.workspace().project("dress-model-gknib")
model_d = project_d.version(1).model

def save_frames_as_images(video_file):
    cap = cv2.VideoCapture(video_file)
    frame_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    step = int(0.1 * frame_total)
    image_fol = "images"
    if not os.path.exists(image_fol):
        os.makedirs(image_fol)
    
    for i in range(0,frame_total,step):
        cap.set(1, i)
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imwrite(f"{image_fol}/frame_{i}.jpg", frame)

app=Flask(_name_)
CORS(app, resources={r"/": {"origins": ""}})

@app.route('/')
def home():
  return jsonify({"hello":"world"})

app = Flask(__name__)
@app.route('/')
def home():
    return render_template('index.html')

if _name=='main_':
  app.run(debug=True)