import os

from pymongo import MongoClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "resume_analyzer")

client = MongoClient(MONGO_URL)

db = client[MONGO_DB_NAME]

users = db["users"]
resumes = db["resumes"]