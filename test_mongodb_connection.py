import os
import sys
import certifi
import pymongo
from dotenv import load_dotenv
from pymongo import MongoClient
import dns.resolver

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI")

print("=" * 50)
print("MongoDB Connection Diagnostic Tool")
print("=" * 50)
print(f"Python version: {sys.version}")
print(f"PyMongo version: {pymongo.__version__}")
print(f"Certifi version: {certifi.__version__}")
print(f"MongoDB URI is {'set' if MONGODB_URI else 'NOT SET'}")

if not MONGODB_URI:
    print("\nERROR: MONGODB_URI environment variable is not set!")
    print("Please set MONGODB_URI in your .env file")
    print("Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority")
    sys.exit(1)

# Extract hostname from URI for DNS testing
try:
    # Simple extraction for mongodb+srv:// format
    if "mongodb+srv://" in MONGODB_URI:
        hostname = MONGODB_URI.split("mongodb+srv://")[1].split("/")[0]
        if "@" in hostname:
            hostname = hostname.split("@")[1]
    else:
        # Simple extraction for mongodb:// format
        hostname = MONGODB_URI.split("mongodb://")[1].split("/")[0]
        if "@" in hostname:
            hostname = hostname.split("@")[1]
        if ":" in hostname:
            hostname = hostname.split(":")[0]
    
    print(f"\nHostname extracted from URI: {hostname}")
    
    # Test DNS resolution
    print("\nTesting DNS resolution...")
    try:
        answers = dns.resolver.resolve(hostname, 'A')
        print(f"DNS resolution successful. IP addresses:")
        for rdata in answers:
            print(f"  - {rdata}")
    except Exception as e:
        print(f"DNS resolution failed: {e}")
except Exception as e:
    print(f"Could not extract hostname from URI: {e}")

# Try different connection approaches
print("\nTrying different connection approaches...")

connection_approaches = [
    {
        "name": "Approach 1: Default settings",
        "options": {}
    },
    {
        "name": "Approach 2: With certifi CA bundle",
        "options": {"tlsCAFile": certifi.where()}
    },
    {
        "name": "Approach 3: With TLS disabled (not recommended for production)",
        "options": {"tlsAllowInvalidCertificates": True}
    },
    {
        "name": "Approach 4: With longer timeouts and certifi",
        "options": {
            "tlsCAFile": certifi.where(),
            "connectTimeoutMS": 30000,
            "socketTimeoutMS": 30000,
            "serverSelectionTimeoutMS": 30000
        }
    },
    {
        "name": "Approach 5: With direct connection",
        "options": {
            "tlsCAFile": certifi.where(),
            "directConnection": True
        }
    }
]

success = False
successful_approach = None

for approach in connection_approaches:
    print(f"\n{approach['name']}...")
    try:
        client = MongoClient(MONGODB_URI, **approach["options"])
        # Test the connection
        client.admin.command('ping')
        print(f"✅ SUCCESS: Connected to MongoDB!")
        
        # List databases
        print("Available databases:")
        for db_name in client.list_database_names():
            print(f"  - {db_name}")
        
        # Remember successful approach
        success = True
        successful_approach = approach
        break
    except Exception as e:
        print(f"❌ FAILED: Error: {e}")

print("\n" + "=" * 50)
if success:
    print(f"SUCCESS! Connected using: {successful_approach['name']}")
    print("\nTo fix your application, update your db.py file with these connection options:")
    print(successful_approach['options'])
else:
    print("All connection attempts failed.")
    print("\nPossible issues to check:")
    print("1. Your MongoDB Atlas connection string might be incorrect")
    print("2. Your network might be blocking connections to MongoDB Atlas")
    print("3. Your MongoDB Atlas IP whitelist might not include your current IP")
    print("4. Your MongoDB Atlas user credentials might be incorrect")
    print("5. You might need to update your SSL/TLS certificates")
    print("\nTry updating your .env file with a fresh connection string from MongoDB Atlas.")
print("=" * 50)
