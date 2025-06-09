# Turf Management API

A robust backend API for managing turf-related operations, built with Node.js and Express.

## Features

- User authentication and authorization
- Cloud storage integration with Cloudinary
- MongoDB database integration
- API documentation with Swagger
- File upload capabilities
- Secure password hashing
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for image storage)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd turf-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

Once the server is running, you can access the API documentation at:
```
http://localhost:3000/api-docs
```

## Dependencies

### Main Dependencies
- express: Web framework
- mongoose: MongoDB object modeling
- bcrypt: Password hashing
- jsonwebtoken: JWT authentication
- cloudinary: Cloud storage
- multer: File upload handling
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- swagger-jsdoc & swagger-ui-express: API documentation

### Development Dependencies
- nodemon: Development server with auto-reload

## Project Structure

```
src/
├── index.js          # Application entry point
├── config/           # Configuration files
├── controllers/      # Route controllers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
└── utils/           # Utility functions
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 