from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 
import cv2
import os
from flask_cors import CORS

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

if _name=='main_':
  app.run(debug=True)