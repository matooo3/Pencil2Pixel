from diffusers import StableDiffusionXLAdapterPipeline, MultiAdapter, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.pidi import PidiNetDetector
from controlnet_aux.midas import MidasDetector
import torch
from styles import chooseStyle

def run(image, prompt, styles, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale):
    #load style name and ID chosen by User
    styleIDandName = chooseStyle(styles)
    modelID = styleIDandName[0]
    modelName = styleIDandName[1]

    # load adapter
    adapter = T2IAdapter.from_pretrained(
    "TencentARC/t2i-adapter-sketch-sdxl-1.0", torch_dtype=torch.float16, varient="fp16"
    ).to("cuda")

    # load euler_a scheduler
    model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
    euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
        model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
    ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()

    #loads the chosen style by the user
    if(modelID != "No Style"):
         pipe.load_lora_weights(modelID, weight_name=modelName)
    
    if image.mode != "RGB":
         image = image.convert("RGB")

    try:
        #Cast arguments to make sure they are of the right type
        i = int(amountOfImages)
        num_inference_steps = int(num_inference_steps)
        adapter_conditioning_scale = float(adapter_conditioning_scale)
        guidance_scale = float(guidance_scale)

        while i > 0:

             # Generate images
            generated_images = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=image,
                num_inference_steps=num_inference_steps,
                adapter_conditioning_scale=adapter_conditioning_scale,
                guidance_scale=guidance_scale,
            ).images[0]

            #Array to return images
            resultArray = []
            resultArray.append(generated_images)

            print("Generated image successfully")
        
            generated_images.save('test_multipleadapters' + str(i) + '.png')
            i -= 1
            print("Image saved successfully")

        return resultArray
    except Exception as e:
        print(f"An error occurred during image generation: {e}")
