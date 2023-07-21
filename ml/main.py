import io

from PIL import Image
from inference.embeddings import Generator

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

generator = Generator()


@app.post("/embeddings")
async def get_embeddings(file: UploadFile = File(...)):
    request_object_content = await file.read()
    image = Image.open(io.BytesIO(request_object_content))
    embeddings = [float(_) for _ in generator.generate(image)]

    return {"embeddings": embeddings}
