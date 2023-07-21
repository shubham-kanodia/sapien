import random
from PIL import Image
from glob import glob

from inference.embeddings import Generator

import pickle


def get_subject_image_paths(subject_number):
    filtered_image_paths = []
    for image_path in image_paths:
        image_subject_number = int(image_path.split("/")[-1].split(".")[0].strip("subject"))

        if image_subject_number == subject_number:
            filtered_image_paths.append(image_path)
    return filtered_image_paths


def prepare_dataset(dataset_image_paths, generator, type):
    X = []
    y = []

    for image_path in dataset_image_paths:
        image = Image.open(image_path).convert("RGB")
        embedding = generator.generate(image)

        X.append(embedding)
        y.append(int(image_path.split("/")[-1].split(".")[0].strip("subject")))

    with open(f"{DATA_PATH}/../processed-dataset/{type}.pkl", "wb") as fl:
        pickle.dump((X, y), fl)


DATA_PATH = "../data/processed-images"
image_paths = glob(f"{DATA_PATH}/*")

train_image_paths = []
test_image_paths = []


for subject_number in range(1, 17):
    subject_image_paths = get_subject_image_paths(subject_number)

    subject_test_image_paths = random.sample(subject_image_paths, 2)

    test_image_paths.extend(subject_test_image_paths)
    train_image_paths.extend([_ for _ in subject_image_paths if _ not in subject_test_image_paths])


generator = Generator()

prepare_dataset(train_image_paths, generator, type="train")
prepare_dataset(test_image_paths, generator, type="test")

print(len(pickle.load(open(f"{DATA_PATH}/../processed-dataset/train.pkl", "rb"))[0]))
print(len(pickle.load(open(f"{DATA_PATH}/../processed-dataset/test.pkl", "rb"))[0]))
