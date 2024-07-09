from diffusers import StableDiffusionXLAdapterPipeline, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.pidi import PidiNetDetector
from controlnet_aux.midas import MidasDetector
import torch


#links to the huggingface website on which the sdxl files are located
photographyID = "f0ster/PhotographyLoRA"
embroideryID = "ostris/embroidery_style_lora_sdxl"
origamiID = "RalFinger/origami-style-sdxl-lora"
animeID = "Linaqruf/pastel-anime-xl-lora"
watercolorID = "ostris/watercolor_style_lora_sdxl"
crayonsID = "ostris/crayon_style_lora_sdxl"

#Names of the safetensor files on the huggingface website
photographyName = "photography-lora-xl_10.safetensors"
embroideryName = "embroidered_style_v1_sdxl.safetensors"
origamiName = "ral-orgmi-sdxl.safetensors"
animeName = "pastel-anime-xl-latest.safetensors"
watercolorName = "watercolor_v1_sdxl.safetensors"
crayonsName = "crayons_v1_sdxl.safetensors"


def run(image, prompt, styles, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale):
    # change the chosen style
    match styles:
        case "Watercolor":
            modelID = watercolorID
            modelName = watercolorName
        case "Photography":
            modelID = photographyID
            modelName = photographyName
        case "Embroidery":
            modelID = embroideryID
            modelName = embroideryName
        case "Crayon":
            modelID = crayonsID
            modelName = crayonsName
        case "Origami":
            modelID = origamiID
            modelName = origamiName
        case "Anime":
            modelID = photographyID
            modelName = photographyName
        case _:
            modelID = "No Style"

    # load 2 adapters with new MultiAdapter function
    adapter = T2IAdapter.from_pretrained("TencentARC/t2i-adapter-depth-midas-sdxl-1.0").to(torch.float16)    

    #
    modelID = embroideryID
    modelName = embroideryName

    # load euler_a scheduler
    model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
    euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    #load pipeline with the chosen adapter as argument
    pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
        model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
    ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()

    #SDXL depth adapter
    '''midas_depth = MidasDetector.from_pretrained(
     "valhalla/t2iadapter-aux-models", filename="dpt_large_384.pt", model_type="dpt_large"
    ).to("cuda")
    depthimage = midas_depth(
     depth_image, detect_resolution=512, image_resolution=1024
    )'''

    #pidinet edge detection
    pidinet = PidiNetDetector.from_pretrained("lllyasviel/Annotators").to("cuda")
    image = pidinet(
       image, detect_resolution=1024, image_resolution=1024, apply_filter=True
      )

    #loads the chosen style by the user
    if(modelID != "No Style"):
        pipe.load_lora_weights(modelID, weight_name=modelName)
    
    #Makes sure the image is in RGB so the Sketch adapter can use it
    if image.mode != "RGB":
         image = image.convert("RGB")

    #
    try:
        #create Array that will be returned at the end of the function
        imageArray = []

        #casting the given values to make sure they are of the expected type
        i = int(amountOfImages)
        num_inference_steps = int(num_inference_steps)
        adapter_conditioning_scale = float(adapter_conditioning_scale)
        guidance_scale = float(guidance_scale)

        #While loop saving 
        while i > 0:
             # Generate images
            gen_images = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                # load multiple images from array corresponding with their adapters
                image=image,
                num_inference_steps=num_inference_steps,
                #two values for two different adapters
                adapter_conditioning_scale=adapter_conditioning_scale,
                guidance_scale=guidance_scale,
            ).images[0]
            
            imageArray.append(gen_images)
            print("Generated image successfully")

            #save the image to the local directory
            gen_images.save('test_multipleadapters' + str(i) + '.png')
            i -= 1
            print("Image saved successfully")

        return imageArray
    except Exception as e:
        print(f"An error occurred during image generation: {e}")
