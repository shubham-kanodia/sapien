import torch.nn as nn
import torch.nn.functional as F


class ZKClassifierModel(nn.Module):
    def __init__(self):
        super(ZKClassifierModel, self).__init__()
        self.fc1 = nn.Linear(512, 256)
        self.fc2 = nn.Linear(256, 84)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))

        return x


