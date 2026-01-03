# Story App Backend

Backend API for a professional story-sharing platform, built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: JWT-based auth, password hashing, rate limiting
- **Stories**: CRUD operations, easy sharing via short IDs, extensive filtering
- **Interactions**: Upvote/downvote system, commenting
- **Moderation**: Admin panel APIs for managing users, stories, and reports
- **Translation**: Integrated Google Translate API for multilingual support
- **GDPR**: Endpoints for data export and "Right to Erasure"
- **Security**: Helmet headers, CORS, Input validation, Rate limiting

## Prerequisites

- Node.js >= 18.0.0
- MongoDB (Local or Atlas)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` and `JWT_SECRET`
   - (Optional) Add `GOOGLE_TRANSLATE_API_KEY` for translation features

## Running the Server

- **Development**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```
- **Seed Database**:
  ```bash
  npm run seed
  ```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint references.

## Project Structure

```
src/
├── config/         # Database and app configuration
├── constants/      # App-wide constants (enums)
├── controllers/    # Request handlers
├── middleware/     # Auth, validation, error handling
├── models/         # Mongoose models
├── routes/         # API route definitions
├── services/       # Business logic layer
├── utils/          # Helper functions
└── index.js        # App entry point
```

## License

ISC
