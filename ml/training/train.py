import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

from dataset import FacialRecognitionDataset
from torch.utils.data.dataloader import DataLoader

from training.model import ClassifierModel

SEED = 2022
BATCH_SIZE = 4
LR = 1e-5
EPOCHS = 500
LOG_INTERVAL = 50


def train(model, device, train_loader, optimizer, epoch):
    model.train()

    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)

        output = model(data)

        loss = F.cross_entropy(output, target)

        optimizer.zero_grad()
        loss.backward()

        optimizer.step()

        if batch_idx == len(train_loader) - 1:
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, batch_idx * len(data), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item()))


def test(model, device, test_loader):
    model.eval()

    test_loss = 0
    correct = 0

    with torch.no_grad():
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            test_loss += F.cross_entropy(output, target, reduction='sum').item()
            pred = output.argmax(dim=1, keepdim=True)

            correct += pred.eq(target.view_as(pred)).sum().item()

    test_loss /= len(test_loader.dataset)

    print('\nTest set: Average loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))


torch.manual_seed(SEED)
device = torch.device("cpu")

model = ClassifierModel().to(device)

optimizer = optim.Adam(model.parameters(), lr=LR)
criterion = nn.CrossEntropyLoss()

train_loader = DataLoader(
    FacialRecognitionDataset("../data/processed-dataset/train.pkl"),
    batch_size=BATCH_SIZE, shuffle=True)

test_loader = DataLoader(
    FacialRecognitionDataset("../data/processed-dataset/test.pkl"),
    batch_size=BATCH_SIZE, shuffle=True)

for epoch in range(1, EPOCHS + 1):
    train(model, device, train_loader, optimizer, epoch)
    test(model, device, test_loader)

torch.save(model.state_dict(), "../model/face_classification_model.pt")
