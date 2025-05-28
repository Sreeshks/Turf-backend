from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user_routes, owner_routes
from app.database.db import initialize_db

app = FastAPI(
    title="Turf Booking API",
    description="API for booking turf facilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database connection
initialize_db()

# Include routers
app.include_router(user_routes.router, prefix="/api/users", tags=["Users"])
app.include_router(owner_routes.router, prefix="/api/owners", tags=["Owners"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to Turf Booking API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
