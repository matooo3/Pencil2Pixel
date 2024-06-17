from diffusers import StableDiffusionXLAdapterPipeline, StableDiffusionAdapterPipeline, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
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

    # load adapter
    # adapter = T2IAdapter.from_pretrained(
    #   "TencentARC/t2i-adapter-sketch-sdxl-1.0", torch_dtype=torch.float16, varient="fp16").to("cuda")

    adapter = T2IAdapter.from_pretrained("TencentARC/t2iadapter_sketch_sd15v2", torch_dtype=torch.float16).to("cuda")

    #Change modelID and modelName to get a different style
    modelID = photographyID
    modelName = photographyName
    
    imageArray = []
    # load euler_a scheduler
    # model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
    model_id = "runwayml/stable-diffusion-v1-5"
    # euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    # vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    # pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
    #     model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
    # ).to("cuda")
    pipe = StableDiffusionAdapterPipeline.from_pretrained(
    model_id, adapter=adapter, safety_checker=None, torch_dtype=torch.float16, variant="fp16"
    ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()
	
    #loads the chosen style by the user
    pipe.load_lora_weights(modelID, weight_name=modelName)
    
    if image.mode != "RGB":
         image = image.convert("RGB")

    try:
        i = int(amountOfImages)
        num_inference_steps = int(num_inference_steps)
        adapter_conditioning_scale = float(adapter_conditioning_scale)
        guidance_scale = float(guidance_scale)

        while i > 0:
             # Generate images
            gen_images = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=image,
                num_inference_steps=num_inference_steps,
                adapter_conditioning_scale=adapter_conditioning_scale,
                guidance_scale=guidance_scale,
            ).images[0]

            print("Generated image successfully")
            imageArray.append(gen_images)
            gen_images.save('test_17_05' + str(i) + '.png')
            i -= 1
            print("Image saved successfully")

        return imageArray
    except Exception as e:
        print(f"An error occurred during image generation: {e}")