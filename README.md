# Turf Booking API

A FastAPI application for booking turf facilities with user and owner modules.

## Features

- User authentication (registration and login)
- Owner authentication (registration and login)
- Turf management (create, list, and view turfs)
- MongoDB integration
- JWT authentication
- Swagger UI documentation

## Prerequisites

- Python 3.7+
- MongoDB Atlas account (or local MongoDB instance)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env` file (already created)

## Running the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Swagger UI documentation is available at http://localhost:8000/docs

## API Endpoints

### User Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user and get JWT token
- `GET /api/users/me` - Get current user profile

### Owner Endpoints

- `POST /api/owners/register` - Register a new turf owner
- `POST /api/owners/login` - Login owner and get JWT token
- `GET /api/owners/me` - Get current owner profile
- `POST /api/owners/turfs` - Create a new turf
- `GET /api/owners/turfs` - Get all turfs for the current owner
- `GET /api/owners/turfs/{turf_id}` - Get a specific turf by ID

## Database Structure

- `users` collection - Stores user information
- `owners` collection - Stores owner information
- `turfs` collection - Stores turf information
