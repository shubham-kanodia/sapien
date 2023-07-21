import torch

from inference.embeddings import Generator
from PIL import Image

from glob import glob

from training.model import ClassifierModel

# Load model
model = ClassifierModel()
model.load_state_dict(torch.load("../model/face_classification_model.pt"))
model.eval()

correct_prediction = 0
image_paths = glob("../data/processed-images/subject16.*.jpeg")

for image_path in image_paths:
    # Pick any sample image
    image = Image.open(image_path).convert("RGB")

    # Generate embeddings
    generator = Generator()
    embeds = generator.generate(image)

    # Inference
    output = model.forward(torch.Tensor(embeds).unsqueeze(0)).argmax().detach().item()

    if output + 1 == 16:
        correct_prediction += 1

print(f"Predicted {correct_prediction} / {len(image_paths)} correctly")
