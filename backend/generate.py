from flask import Flask, request, jsonify, make_response
from PIL import Image
from flask_cors import CORS
import io
import base64

app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": "*"}})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    print(data)    

    # Extracting the base64 string from the data URL
    img_base64 = data["image"].split(",")[1]
    prompt = data["prompt"]

    img_data = base64.b64decode(img_base64)
    image = Image.open(io.BytesIO(img_data))
    
    # vv INSERT AI IMAGE GENERATION HERE vv #
    #                                       #
    #                                       #
    # ^^ INSERT AI IMAGE GENERATION HERE ^^ #

    # Convert the processed image to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Return the base64 encoded image data as JSON
    res = make_response(jsonify({"image": img_str}), 200)
    return res

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0' port=6873)