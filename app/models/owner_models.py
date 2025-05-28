from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class OwnerBase(BaseModel):
    email: EmailStr
    name: str
    phone: str


class OwnerCreate(OwnerBase):
    password: str


class OwnerLogin(BaseModel):
    email: EmailStr
    password: str


class OwnerResponse(OwnerBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class OwnerInDB(OwnerBase):
    id: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class TurfBase(BaseModel):
    name: str
    description: str
    location: str
    price_per_hour: float
    available_hours: List[str]
    amenities: List[str]
    owner_id: str


class TurfCreate(TurfBase):
    pass


class TurfResponse(TurfBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TurfInDB(TurfBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    user_type: str = "owner"  # To differentiate between user and owner
