from diffusers import StableDiffusionAdapterPipeline, MultiAdapter, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.pidi import PidiNetDetector
from PIL import Image
import torch


def run_multiadapter(image, colorpalette, prompt, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale):
    # load 2 adapters (color adapter and depth) with MultiAdapter function
    adapters = MultiAdapter(
        [T2IAdapter.from_pretrained("TencentARC/t2iadapter_zoedepth_sd15v1", torch_dtype=torch.float16),
         T2IAdapter.from_pretrained("TencentARC/t2iadapter_color_sd14v1", torch_dtype=torch.float16)
        ]).to(torch.float16)

    #loading color palette which will be used for the color adapter
    color_image = colorpalette

    #resizing to 8 by 8 pixels to generate at max 64 colors
    color_palette = color_image.resize((8, 8))
    color_palette = color_palette.resize((512, 512), resample=Image.Resampling.NEAREST) # pil image 512,512
    color_palette.save('color_test.png')

    #loading pipeline
    pipe = StableDiffusionAdapterPipeline.from_pretrained(
     "CompVis/stable-diffusion-v1-4",
     adapter=adapters,
     safety_checker=None, 
     torch_dtype=torch.float16, 
     variant="fp16"
     ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()

    #loading depth image and downsizing it for better performance and compatibility
    depth_image = image
    depth_image = depth_image.resize((512, 512), resample=Image.Resampling.NEAREST) # pil image 512,512
    depth_image.save('weird_sketch.png')
    

    try:
        #Cast arguments to make sure they are of the right type
        i = int(amountOfImages)
        num_inference_steps = int(num_inference_steps)
        adapter_conditioning_scale = float(adapter_conditioning_scale)
        guidance_scale = float(guidance_scale)
        #while loop that generates images, i = amount of images the user wants to generate
        while i > 0:           
             # Generate images
            generated_images = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                # load multiple images from array corresponding with their adapters
                image= [depth_image, color_palette],
                num_inference_steps=num_inference_steps,
                #two values for two different adapters
                adapter_conditioning_scale=[adapter_conditioning_scale, 1.0],
                guidance_scale=guidance_scale,
            ).images[0]
            
            #Array to return images
            resultArray = []
            resultArray.append(generated_images)

            print("Generated image successfully")
        
            generated_images.save('multiadapters_extrascript' + str(i) + '.png')
            i -= 1
            print("Image saved successfully")

        return resultArray
    except Exception as e:
        print(f"An error occurred during image generation: {e}")
