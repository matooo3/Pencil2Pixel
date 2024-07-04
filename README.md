# Pencil2Pixel

Pencil2Pixel is an interactive web application that allows you to create high quality images based on a sketch and a prompt by using AI.
The application is built using HTML, JavaScript, and CSS.

## Features

- Draw sketches directly on the canvas.
- Input text prompts to guide the AI generation.
- Customize advanced settings for the image generation.
- Choose from different styles to create unique images.

## Getting Started

### Prerequisites

- Python 3.x installed on your system. (https://www.python.org/downloads/)
- Conda installed on your system. (https://docs.anaconda.com/miniconda/) #TODO 

### Installation

The following steps must be taken in a terminal (right click => open terminal / git bash):

1. **Clone the repository**

   ```sh
   git clone git@github.com:matooo3/Pencil2Pixel.git
   cd pencil2pixel
   ```

2. **Navigate to the backend directory**

   ```sh
   cd backend
   ```

3. **Install the required Python packages**

   (If there's a `requirements.txt` file, use the following command)

   ```sh
   pip install -r requirements.txt
   ```

4. **Activate the Conda environment**

   ```sh
   conda activate t2i
   ```

5. **Start the backend server**

   ```sh
   python3 generate.py
   ```

### Update Local IP Address

To run the application locally, you need to update the IP address in the scripts. Open the necessary script files and replace the placeholder IP with your local IP address.

1. **Find your local IP address**

   On most systems, you can find your local IP address by running:

   ```sh
   ipconfig (Windows)
   ifconfig (Mac/Linux)
   ```

2. **Update the IP address in the script files**

   Open the JavaScript files in the `frontend` directory and update the IP address accordingly.

   Example:
   ```js
   const backendUrl = 'http://YOUR_LOCAL_IP:5000';
   ```
   Hier war ich mir nicht mehr ganz sicher, wo das im Code ist. #TODO

## Usage

1. **Open the application**

   Navigate to the `frontend` directory and open `index.html` in your web browser.

2. **Draw your sketch**

   Use the drawing tools to create a sketch on the canvas.

3. **Enter a prompt**

   Input a text prompt to describe what you want the AI to generate.

4. **Enter a prompt**

    Select a style for your image.

5. **Adjust advanced settings**

   Customize the advanced settings to fine-tune the generation process.

6. **Generate the image**

   Click the "Generate" button to create an image based on your sketch and prompt.

## Contributing

We welcome contributions to enhance Pencil2Pixel! Please fork the repository and submit a pull request with your changes. Ensure that your code adheres to our coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or feedback, please reach out to us at matze2948@gmail.com.
