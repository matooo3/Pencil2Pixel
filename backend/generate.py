from flask import Flask, request, jsonify, make_response
from PIL import Image
from flask_cors import CORS
import io
import base64
from t2iadapter import run

app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": "*"}})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    print(data)    

    # Extracting the base64 string from the data URL
    img_base64 = data["image"].split(",")[1]
    img_data = base64.b64decode(img_base64)

    image = Image.open(io.BytesIO(img_data))
    prompt = data["prompt"]
    style = data["style"]
    amountOfImages = data["amountOfImages"]
    num_inference_steps = data["num_inference_steps"]
    negative_prompt = data["negative_prompt"]
    adapter_conditioning_scale = data["adapter_conditioning_scale"]
    guidance_scale = data["guidance_scale"]

    #running function from the t2i script
    images = run(image, prompt, style, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale)
    
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