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

def chooseStyle(styles):
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
            modelName = ""

    return [modelID, modelName]