from PIL import Image
from glob import glob

DATA_PATH = "../data/yale-dataset"
image_paths = glob(f"{DATA_PATH}/*")

for image_path in image_paths:
    image = Image.open(image_path)
    image.save(
        f"{DATA_PATH}/../processed-images/{image_path.split('/')[-1]}"+".jpeg", 'jpeg', optimize=True, quality=100)
