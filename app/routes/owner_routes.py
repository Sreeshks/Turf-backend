from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from bson import ObjectId
from typing import List
from app.models.owner_models import (
    OwnerCreate, 
    OwnerResponse, 
    TurfCreate, 
    TurfResponse,
    Token
)
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.database.db import get_db

router = APIRouter()


@router.post("/register", response_model=OwnerResponse, status_code=status.HTTP_201_CREATED)
async def register_owner(owner: OwnerCreate):
    """Register a new turf owner"""
    db = get_db()
    
    # Check if owner already exists
    if db.owners.find_one({"email": owner.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password
    hashed_password = get_password_hash(owner.password)
    
    # Create owner document
    owner_dict = owner.dict(exclude={"password"})
    owner_dict["hashed_password"] = hashed_password
    owner_dict["_id"] = ObjectId()
    owner_dict["id"] = str(owner_dict["_id"])
    owner_dict["user_type"] = "owner"
    
    # Insert owner into database
    db.owners.insert_one(owner_dict)
    
    # Return owner without password
    return OwnerResponse(
        id=owner_dict["id"],
        email=owner_dict["email"],
        name=owner_dict["name"],
        phone=owner_dict["phone"],
        created_at=owner_dict.get("created_at"),
    )


@router.post("/login", response_model=Token)
async def login_owner(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login owner and return JWT token"""
    db = get_db()
    
    # Find owner by email
    owner = db.owners.find_one({"email": form_data.username})
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, owner["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": owner["email"], "user_type": "owner"},
        expires_delta=access_token_expires,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=OwnerResponse)
async def get_owner_me(current_user: dict = Depends(get_current_user)):
    """Get current owner profile"""
    if current_user.get("user_type", "") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )
    
    return OwnerResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        name=current_user["name"],
        phone=current_user["phone"],
        created_at=current_user.get("created_at"),
    )


@router.post("/turfs", response_model=TurfResponse, status_code=status.HTTP_201_CREATED)
async def create_turf(
    turf: TurfCreate, 
    current_user: dict = Depends(get_current_user)
):
    """Create a new turf"""
    if current_user.get("user_type", "") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only turf owners can create turfs",
        )
    
    db = get_db()
    
    # Create turf document
    turf_dict = turf.dict()
    turf_dict["owner_id"] = str(current_user["_id"])
    turf_dict["_id"] = ObjectId()
    turf_dict["id"] = str(turf_dict["_id"])
    
    # Insert turf into database
    db.turfs.insert_one(turf_dict)
    
    return TurfResponse(**turf_dict)


@router.get("/turfs", response_model=List[TurfResponse])
async def get_owner_turfs(current_user: dict = Depends(get_current_user)):
    """Get all turfs for the current owner"""
    if current_user.get("user_type", "") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )
    
    db = get_db()
    
    # Find all turfs for the current owner
    turfs = list(db.turfs.find({"owner_id": str(current_user["_id"])}))
    
    # Convert ObjectId to string
    for turf in turfs:
        turf["id"] = str(turf["_id"])
    
    return turfs


@router.get("/turfs/{turf_id}", response_model=TurfResponse)
async def get_turf(
    turf_id: str, 
    current_user: dict = Depends(get_current_user)
):
    """Get a specific turf by ID"""
    if current_user.get("user_type", "") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )
    
    db = get_db()
    
    # Find turf by ID
    turf = db.turfs.find_one({"_id": ObjectId(turf_id), "owner_id": str(current_user["_id"])})
    if not turf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turf not found",
        )
    
    # Convert ObjectId to string
    turf["id"] = str(turf["_id"])
    
    return turf
