from flask import Flask, request, jsonify, make_response
from PIL import Image
from flask_cors import CORS
from diffusers.utils import load_image, make_image_grid
import io
import base64
from t2i_sketchAndDepth import run_sketchAndDepth
from t2iadapter import run
from multiadapters import run_multiadapter


app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": "*"}})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    #print(data)    

    # Extracting the base64 string from the data URL
    img_base64 = data["image"].split(",")[1]
    img_data = base64.b64decode(img_base64)

    image = Image.open(io.BytesIO(img_data))
    prompt = data["prompt"]
    style = data["style"]
    #fetch uploaded style image from user here
    styleImage = load_image("colorPalette.png")
    amountOfImages = data["amountOfImages"]
    num_inference_steps = data["num_inference_steps"]
    negative_prompt = data["negative_prompt"]
    adapter_conditioning_scale = data["adapter_conditioning_scale"]
    guidance_scale = data["guidance_scale"]

    #running function from the t2i script
    #images = run(image.resize((1024, 1024)), prompt, style, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale)
    #running function that extracts sketch and depth from uploaded user image
    images = run_sketchAndDepth(image.resize((1024, 1024)), prompt, style, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale)
    #run alternative function incase user chooses to upload a style image
    #images = run_multiadapter(image.resize((512, 512)), prompt, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale)
    imgs = []

    for img in images:
        # Convert the processed images to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        imgs.append(base64.b64encode(buffered.getvalue()).decode("utf-8"))


    # Return the base64 encoded image data as JSON
    res = make_response(jsonify({"images": imgs}), 200)
    return res

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=6873)