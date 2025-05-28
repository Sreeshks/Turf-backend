import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI")

# Initialize MongoDB client
client = None
db = None

def initialize_db():
    """Initialize MongoDB connection"""
    global client, db
    try:
        client = MongoClient(MONGODB_URI)
        db = client.turf_booking_db
        print("Connected to MongoDB successfully!")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def get_db():
    """Get database instance"""
    global db
    if db is None:
        initialize_db()
    return db
