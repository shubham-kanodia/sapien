import torch

from zk.model import ZKClassifierModel
from training.model import ClassifierModel

from inference.embeddings import Generator
from PIL import Image

classifier_model = ClassifierModel()
classifier_model.load_state_dict(torch.load("../model/face_classification_model.pt"))

zk_classifier_model = ZKClassifierModel()
zk_classifier_model.eval()

layers = list(classifier_model.state_dict().keys())
snark_layers = layers[-2:]
pre_snark_layers = layers[:-2]

zk_classifier_model.fc1.weight.data = classifier_model.fc1.weight.data
zk_classifier_model.fc2.weight.data = 1000 * classifier_model.fc2.weight.data

zk_classifier_model.fc1.bias.data = classifier_model.fc1.bias.data
zk_classifier_model.fc2.bias.data = 1000 * classifier_model.fc2.bias.data

snark_weights = 1000 * classifier_model.fc3.weight.data
snark_biases = 1000000 * classifier_model.fc3.bias.data

# Test Logic
image = Image.open("../data/processed-images/subject08.happy.jpeg").convert("RGB")

# Generate embeddings
generator = Generator()
embeds = generator.generate(image)

op = (
        torch.matmul(
            zk_classifier_model(torch.Tensor(embeds).unsqueeze(0)),
            snark_weights.t()
        ) + snark_biases) \
    .argmax() \
    .detach() \
    .item()

# This must match the expected output
assert(op == 7)

# Export model for frontend use
PATH = "../model/frontend_model.onnx"
dummy_input = torch.Tensor(embeds).unsqueeze(0)

torch.onnx.export(zk_classifier_model, dummy_input, PATH, verbose=True)

# Export snark weights
snark_weights_arr = snark_weights.numpy()
shape = snark_weights_arr.shape

weights_file = open("../data/snark-data/snark_weights.txt", "w")
biases_file = open("../data/snark-data/snark_biases.txt", "w")
sample_input_file = open("../data/snark-data/input.txt", "w")

weights_file.write("[" + "\n")
for i in range(0, shape[0]):
    line = ",".join(map(lambda x: str(int(x)), snark_weights_arr[i]))
    weights_file.write("[" + line + "],\n")
weights_file.write("]")

snark_biases_arr = snark_biases.numpy()
biases_line = ",".join(map(lambda x: str(int(x)), snark_biases_arr))
biases_file.write("[" + biases_line + "]")

sample_input = zk_classifier_model(torch.Tensor(embeds).unsqueeze(0)).detach().numpy()[0]
inputs_line = ",".join(map(lambda x: str(int(x)), sample_input))
sample_input_file.write("[" + inputs_line + "]")
