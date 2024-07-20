from diffusers import StableDiffusionAdapterPipeline, MultiAdapter, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.pidi import PidiNetDetector
from controlnet_aux.midas import MidasDetector
from PIL import Image
import torch
import numpy as np
import cv2
import torchvision.transforms as transforms


def run_multiadapter(image, colorpalette, prompt, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale):

    # load 2 adapters with new MultiAdapter function
    adapters = MultiAdapter(
        [#T2IAdapter.from_pretrained("TencentARC/t2iadapter_sketch_sd14v1", torch_dtype=torch.float16),
         #T2IAdapter.from_pretrained("TencentARC/t2iadapter_depth_sd14v1"),
         T2IAdapter.from_pretrained("TencentARC/t2iadapter_zoedepth_sd15v1", torch_dtype=torch.float16),
         T2IAdapter.from_pretrained("TencentARC/t2iadapter_color_sd14v1", torch_dtype=torch.float16)
        ]).to(torch.float16)

    color_image = load_image(
    "https://huggingface.co/datasets/diffusers/docs-images/resolve/main/t2i-adapter/color_ref.png"
)

    color_image = colorpalette
    color_palette = color_image.resize((8, 8))
    color_palette = color_palette.resize((512, 512), resample=Image.Resampling.NEAREST) # pil image 512,512
    color_palette.save('color_test.png')

    #sketch_image = Image.open('images_sketch_in.png')

    pipe = StableDiffusionAdapterPipeline.from_pretrained(
     "CompVis/stable-diffusion-v1-4",
     adapter=adapters,
     safety_checker=None, 
     torch_dtype=torch.float16, 
     variant="fp16"
     ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()

    '''midas_depth = MidasDetector.from_pretrained(
     "valhalla/t2iadapter-aux-models", filename="dpt_large_384.pt", model_type="dpt_large"
    ).to("cuda")
    depthimage = midas_depth(
     depth_image, detect_resolution=512, image_resolution=512
    )'''
    #pidinet edge detection
    pidinet = PidiNetDetector.from_pretrained("lllyasviel/Annotators")
    sketch_image = pidinet(image)
    sketch_image.save('weird_sketch.png')
    

    try:
        imageArray = [] 
        i = int(amountOfImages)
        num_inference_steps = int(num_inference_steps)
        adapter_conditioning_scale = float(adapter_conditioning_scale)
        guidance_scale = float(guidance_scale)

        while i > 0:
            
             # Generate images
            gen_images = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                # load multiple images from array corresponding with their adapters
                image= [sketch_image, color_palette],
                num_inference_steps=num_inference_steps,
                #two values for two different adapters
                adapter_conditioning_scale=[adapter_conditioning_scale, 1.0],
                guidance_scale=guidance_scale,
            ).images[0]
            
            imageArray.append(gen_images)

            print("Generated image successfully")
        
            gen_images.save('multiadapters_extrascript' + str(i) + '.png')
            i -= 1
            print("Image saved successfully")

        return imageArray
    except Exception as e:
        print(f"An error occurred during image generation: {e}")


#if __name__ == "__main__":
#    image = load_image("edgedetection1.png")
#    prompt = "A bed chamber with fancy bed and window"
#    run_multiadapter(image, prompt, amountOfImages = 1, num_inference_steps= 25, 
#                     negative_prompt = "extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, disfigured",
#                    adapter_conditioning_scale = 0.6, guidance_scale = 7.5)