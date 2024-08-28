from diffusers import StableDiffusionXLAdapterPipeline, MultiAdapter, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.pidi import PidiNetDetector
from controlnet_aux.midas import MidasDetector
from styles import chooseStyle
import torch

def run_sketchAndDepth(image, prompt, styles, amountOfImages, num_inference_steps, negative_prompt, adapter_conditioning_scale, guidance_scale):

    #load style name and ID chosen by User
    styleIDandName = chooseStyle(styles)
    modelID = styleIDandName[0]
    modelName = styleIDandName[1]

    # load 2 adapters with new MultiAdapter function
    adapters = MultiAdapter(
        [T2IAdapter.from_pretrained("TencentARC/t2i-adapter-sketch-sdxl-1.0"),
         T2IAdapter.from_pretrained("TencentARC/t2i-adapter-depth-midas-sdxl-1.0")
        ])

    adapters = adapters.to(torch.float16)    

    # load euler_a scheduler
    model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
    euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
        model_id, vae=vae, adapter=adapters, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
    ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()

    #extract depth from image
    midas_depth = MidasDetector.from_pretrained(
     "valhalla/t2iadapter-aux-models", filename="dpt_large_384.pt", model_type="dpt_large"
    ).to("cuda")
    depth_image = midas_depth(
     image, detect_resolution=512, image_resolution=1024
    )
    #resize image to standard SDXL size
    depth_image = depth_image.resize((1024, 1024))

    #pidinet edge detection
    pidinet = PidiNetDetector.from_pretrained("lllyasviel/Annotators").to("cuda")
    image = pidinet(
      image, detect_resolution=1024, image_resolution=1024, apply_filter=True
     )
    
    #loads the chosen style by the user
    if(modelID != "No Style"):
         pipe.load_lora_weights(modelID, weight_name=modelName)

    if image.mode != "RGB":
         image = image.convert("RGB")
         depth_image = depth_image.convert("RGB")

    try:
        #Cast arguments to make sure they are of the right type
        i = int(amountOfImages)
        num_inference_steps = int(num_inference_steps)
        adapter_conditioning_scale = float(adapter_conditioning_scale)
        guidance_scale = float(guidance_scale)

        image.save('extractedSketch.png')
        depth_image.save('extractedDepth.png')

        resultArray = []
        
        while i > 0:

             # Generate images
            gen_image = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                # load multiple images from array corresponding with their adapters
                image=[image, depth_image],
                num_inference_steps=num_inference_steps,
                #two values for two different adapters
                adapter_conditioning_scale=[adapter_conditioning_scale, adapter_conditioning_scale],
                guidance_scale=guidance_scale,
            ).images[0]

            resultArray.append(gen_image)

            print("Generated image successfully")

            gen_image.save('sketchAndDepth' + str(i) + '.png')
            i -= 1
            print("Image saved successfully")

        return resultArray
    except Exception as e:
        print(f"An error occurred during image generation: {e}")