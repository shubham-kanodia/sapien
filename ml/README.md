# Instructions

Download the **Yale Face Database** from https://www.kaggle.com/datasets/olgabelitskaya/yale-face-database

- Extract the downloaded database and put the images in `data/yale-dataset` folder

- Create `data/processed-images` folder

- Run `python3 pre_process_dataset.py` (cd training)

- Create `data/processed-dataset` folder

- `python3 data_prep.py` (cd training)

- Create `model` folder

- Run `python3 train.py` (cd training)

- Create data/snark-data folder

- Run `python3 populate_model_weights.py` (cd zk)

- Copy the generated onnx model to the frontend

**Note:**
Use the below fix if you face the **no module named "xyz"** issue

* You need to add the root directory to your python path
* If using pycharm you can set the root directory as source path by right clicking the directory and selecting `Sources Root` under `Mark Directory as` 
* Run all python commands from the root directory itself
