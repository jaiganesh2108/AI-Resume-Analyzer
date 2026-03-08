from pymongo import MongoClient

MONGO_URL = "mongodb+srv://jaiganeshh574_db_user:LeRvn8kZo1dvdadc@cluster0.8urtiqk.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URL)

db = client["resume_analyzer"]

users = db["users"]
resumes = db["resumes"]

# LeRvn8kZo1dvdadc