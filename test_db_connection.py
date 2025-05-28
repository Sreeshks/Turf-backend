import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI")

print(f"MongoDB URI is {'set' if MONGODB_URI else 'NOT SET'}")

if not MONGODB_URI:
    print("ERROR: MONGODB_URI environment variable is not set!")
    print("Please set MONGODB_URI in your .env file")
    print("Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority")
    sys.exit(1)

# Try to connect with different TLS settings
connection_options = [
    {
        "name": "Default settings",
        "options": {}
    },
    {
        "name": "With TLS enabled",
        "options": {"tls": True}
    },
    {
        "name": "With TLS and allow invalid certificates",
        "options": {"tls": True, "tlsAllowInvalidCertificates": True}
    },
    {
        "name": "With TLS disabled",
        "options": {"tls": False}
    },
    {
        "name": "With longer timeouts",
        "options": {
            "tls": True, 
            "tlsAllowInvalidCertificates": True,
            "connectTimeoutMS": 30000,
            "socketTimeoutMS": 30000,
            "serverSelectionTimeoutMS": 30000
        }
    }
]

for config in connection_options:
    print(f"\nTrying connection with {config['name']}...")
    try:
        client = MongoClient(MONGODB_URI, **config["options"])
        # Test the connection
        client.admin.command('ping')
        print(f"✅ SUCCESS: Connected to MongoDB with {config['name']}")
        
        # List databases
        print("Available databases:")
        for db_name in client.list_database_names():
            print(f"  - {db_name}")
            
        # Success - we can stop here
        break
    except Exception as e:
        print(f"❌ FAILED: {config['name']} - Error: {e}")

print("\nIf all connection attempts failed, please check:")
print("1. Your MongoDB Atlas connection string is correct")
print("2. Your network allows connections to MongoDB Atlas")
print("3. Your MongoDB Atlas IP whitelist includes your current IP address")
print("4. Your MongoDB Atlas user credentials are correct")
