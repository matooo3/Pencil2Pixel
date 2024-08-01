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

- Python 3.x installed on your system: [Python installation](https://www.python.org/downloads/)
- Conda installed on your system: [Conda installation](https://docs.anaconda.com/miniconda/)

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

   ```sh
   pip install -r requirements.txt
   ```

4. **Set up the Conda environment**
   ```sh
   conda env create -f environment.yml
   ```
   
5. **Activate the Conda environment**

   ```sh
   conda activate t2i
   ```

6. **Start the backend server**

   ```sh
   python3 generate.py
   ```

### Update Port if needed:

If you already use multiple Ports, check if the port of this project is already used. If not, then you can skip this part.

If a conflict is found, change the port number to an available one. For example, if the current port is 6873 and it’s in use, you might change it to 6874.
Save the changes to the configuration file.

   ```sh
   const url = `${window.location.protocol}//${window.location.hostname}:6873/generate`;
   ```

   Open the necessary Port (6873 if you didn't change it) in your Firewall.

## Usage

1. **Open the application**

   Navigate to the `frontend` directory and open `index.html` in your web browser.

2. **Draw your sketch**

   Use the drawing tools to create a sketch on the canvas.
   You can change the thickness of the lines on the left.
   To undo changes, you can use the eraser, the undo/redo buttons, or the delete button. The latter clears the canvas.

3. **Enter a prompt**

   Input a text prompt to describe the image you want the AI to generate. You can find the designated text box under the canvas.

4. **Select a style**

    Click on "Select Style" to see the dropdown menu of the style options. Here you can select the style you want your image to be generated with.

5. **Adjust advanced settings**

   You customize the advanced settings to fine-tune the generation process.
   To do this, click on "Advanced Options" and the advanced settings should appear.

   - **Negative Prompt:** Describe things here, that you explicitly DON'T want in your picture

   - **Number of Steps:** This describes the number of iterations the AI goes through when generating your image. Increasing this will lead to a more detailed image. Decreasing this will lead to quicker image generation.

   - **Guidance scale:** This represents how much the AI focuses on the prompt, compared to other things.

   - **Adapter conditioning scale:** This represents how much the AI focuses on the sketch, compared to other things

      - *For example:* If you change the adapter conditioning scale to the maximum and reduce the guidance scale, the AI is going to pay more attention to sticking to your exact lines, than to comply with the description in the prompt.

   - **Amount of generated images:** Adjust this to generate up to 4 images at a time.

7. **Generate the image**

   When your sketch is finished and you have entered a text prompt, you're ready to start the image generation!
   Click the "Generate Image" button to create an image based on your sketch and prompt.
   This might take a little, especially if you changed the advanced settings, but your image(s) should appear soon.

## Contributing

We welcome contributions to enhance Pencil2Pixel! Please fork the repository and submit a pull request with your changes. Ensure that your code adheres to our coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or feedback, please reach out to us at matze2948@gmail.com.
