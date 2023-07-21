import pickle
import torch
import numpy as np

from torch.utils.data.dataset import Dataset


class FacialRecognitionDataset(Dataset):
    def __init__(self, pkl_file):
        self.X, self.y = pickle.load(open(pkl_file, "rb"))

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        item_X = np.array(self.X[idx])
        item_y = self.y[idx] - 1

        return torch.FloatTensor(item_X), item_y
