from diffusers import StableDiffusionXLAdapterPipeline, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.pidi import PidiNetDetector
import torch
import argparse


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

def get_args():
    parser = argparse.ArgumentParser()

    parser.add_argument('--num_inference_steps', type=int, default=30, help='')
    parser.add_argument("--adapter_conditioning_scale", type=float, default=0.6, help='')
    parser.add_argument("--guidance_scale", type=float, default=7.5, help='')
    parser.add_argument("--style", type=str, default=None, help='')        

    args = parser.parse_args()
    styles = args.style
    print(styles)
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
            modelID = animeID
            modelName = animeName  
    return args

def run(args):

    # load adapter
    adapter = T2IAdapter.from_pretrained(
      "TencentARC/t2i-adapter-sketch-sdxl-1.0", torch_dtype=torch.float16, varient="fp16").to("cuda")

    #Change modelID and modelName to get a different style
    modelID = watercolorID
    modelName = watercolorName

    # load euler_a scheduler
    model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
    euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
        model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
    ).to("cuda")
    pipe.enable_xformers_memory_efficient_attention()

    #loads image that will be used as the sketch
    image = load_image("test_pics/house.png")

    #loads the chosen style by the user
    pipe.load_lora_weights(modelID, weight_name=modelName)
    prompt = "house on lake, Mount Fuji in the background, sunset, realistic, 4k"
    negative_prompt = "extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, disfigured"

    gen_images = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        image=image,
        num_inference_steps=args.num_inference_steps,
        adapter_conditioning_scale=args.adapter_conditioning_scale,
        guidance_scale=args.guidance_scale,
    ).images[0]
    gen_images.save('test_pics/house_anime_test.png')

def main():
    args = get_args()
    run(args)

if __name__ == '__main__':
    main()
