import os
import sys
import ssl
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI")

# Check if MongoDB URI is available
if not MONGODB_URI:
    print("ERROR: MONGODB_URI environment variable is not set!")
    print("Please set MONGODB_URI in your .env file")
    print("Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority")

# Initialize MongoDB client
client = None
db = None

def initialize_db():
    """Initialize MongoDB connection"""
    global client, db
    if not MONGODB_URI:
        print("ERROR: Cannot connect to MongoDB. MONGODB_URI is not set.")
        return None
        
    try:
        print(f"Connecting to MongoDB...")
        # Configure MongoDB client with proper TLS settings
        client = MongoClient(
            MONGODB_URI,
            tls=True,
            tlsAllowInvalidCertificates=True,  # For development only
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            serverSelectionTimeoutMS=30000
        )
        
        # Test the connection
        client.admin.command('ping')
        
        # Initialize the database
        db = client.turf_booking_db
        
        # Ensure the users collection exists
        if 'users' not in db.list_collection_names():
            db.create_collection('users')
            print("Created 'users' collection")
            
        print("Connected to MongoDB successfully!")
        return db
    except Exception as e:
        print(f"ERROR connecting to MongoDB: {e}")
        print("Please check your MongoDB connection string and network connection.")
        return None

def get_db():
    """Get database instance"""
    global db
    if db is None:
        db = initialize_db()
        if db is None:
            print("ERROR: Failed to initialize database connection")
    return db
