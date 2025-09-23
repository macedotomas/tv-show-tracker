# TV Show Tracker API


[**APPROACH EXPLAINED HERE**](./approach.md)


 * Note: Certain functionalities have not been implemented in this code.
   
   * Background worker that sends emails with the tv shows recommendations (I tried to use nodemailer but was getting some errors but with a little bit more of time I could do it)
   
   * Export information to csv/pdf (didn't fully understand what information to export users, tv-shows, etc)
   
   * Unit & Integration Tests (I took a bad approach by doing this in the end, because I was overwhelmed by the numbers of bugs I was getting by trying to do tests with full app working. Next time I should do tests at the same time I develop the app)

## User details to test
email: admin@admin.com
password: 123

 


## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **TV Show Management**: CRUD operations for TV shows
- **Episode Tracking**: View episodes by show and season
- **Actor Information**: Browse actors and their associated shows
- **Favorites System**: Users can add/remove shows from favorites
- **Cache System**: Built-in caching for improved performance
- **Dashboard**: User dashboard with personalized data

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Docker** for containerization
- **Jest** for testing

### Frontend
- **React 19** with Vite
- **TailwindCSS** + DaisyUI for styling
- **Zustand** for state management
- **Axios** for API calls
- **React Router** for navigation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if not using Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/macedotomas/tv-show-tracker.git
   cd tv-show-tracker
   ```



2. **Start the database**
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Install backend dependencies**
   ```bash
   npm install
   ```

4. **Start the backend server**
   (from a new terminal window and from the root directory)
   ```bash
   npm run dev
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

### Environment Variables

Since this is just a exercise the .env file is public

## 📋 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer ${token}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": "jwt-token-here"
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": "jwt-token-here"
}
```

### Verify Token
```http
GET /auth/is-verify
```
**Headers:** `Authorization: Bearer ${token}`

**Response:**
```json
true
```

---

## 📺 TV Shows Endpoints

### Get All TV Shows
```http
GET /api/tv-shows
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "show_id": 1,
      "title": "Game of Thrones",
      "description": "Nobles battle for control of the Iron Throne...",
      "genre": "Fantasy",
      "type": "Series",
      "release_date": "2011-04-17",
      "rating": 9.3,
      "created_at": "2025-09-19T10:00:00Z",
      "actors": [
        {
          "actor_id": 1,
          "name": "Sean Bean",
          "birth_date": "1959-04-17",
          "biography": "English actor..."
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Get TV Show by ID
```http
GET /api/tv-shows/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "show_id": 1,
    "title": "Game of Thrones",
    "description": "Nobles battle for control of the Iron Throne...",
    "genre": "Fantasy",
    "type": "Series",
    "release_date": "2011-04-17",
    "rating": 9.3,
    "created_at": "2025-09-19T10:00:00Z",
    "actors": [...]
  }
}
```

### Create TV Show
```http
POST /api/tv-shows
```

**Request Body:**
```json
{
  "title": "New TV Show",
  "description": "A great new show",
  "genre": "Drama",
  "type": "Series",
  "release_date": "2025-01-01",
  "rating": 8.5
}
```

### Update TV Show
```http
PATCH /api/tv-shows/:id
```

**Request Body:** (partial update)
```json
{
  "title": "Updated Title",
  "rating": 9.0
}
```

### Delete TV Show
```http
DELETE /api/tv-shows/:id
```

---

## 🎭 Actors Endpoints

### Get All Actors
```http
GET /api/actors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "actor_id": 1,
      "name": "Sean Bean",
      "birth_date": "1959-04-17",
      "biography": "English actor known for..."
    }
  ]
}
```

### Get Actor with TV Shows
```http
GET /api/actors/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "actor_id": 1,
    "name": "Sean Bean",
    "birth_date": "1959-04-17",
    "biography": "English actor...",
    "tv_shows": [
      {
        "show_id": 1,
        "title": "Game of Thrones",
        "genre": "Fantasy"
      }
    ]
  }
}
```

### Get Actor's TV Shows
```http
GET /api/actors/:id/tv-shows
```

---

## 📺 Episodes Endpoints

### Get Episodes by Show
```http
GET /api/episodes/show/:showId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "episode_id": 1,
      "show_id": 1,
      "title": "Winter Is Coming",
      "episode_number": 1,
      "season_number": 1,
      "release_date": "2011-04-17",
      "created_at": "2025-09-19T10:00:00Z"
    }
  ]
}
```

### Get Episodes Grouped by Season
```http
GET /api/episodes/show/:showId/seasons
```

**Response:**
```json
{
  "success": true,
  "data": {
    "1": [
      {
        "episode_id": 1,
        "title": "Winter Is Coming",
        "episode_number": 1,
        "season_number": 1,
        "release_date": "2011-04-17"
      }
    ],
    "2": [...]
  }
}
```

---

## ⭐ Favorites Endpoints

**Note:** All favorites endpoints require authentication.

### Get User's Favorites
```http
GET /api/favorites
```
**Headers:** `Authorization: Bearer ${token}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "show_id": 1,
      "title": "Game of Thrones",
      "genre": "Fantasy",
      "rating": 9.3
    }
  ]
}
```

### Add to Favorites
```http
POST /api/favorites/:showId
```
**Headers:** `Authorization: Bearer ${token}`

### Remove from Favorites
```http
DELETE /api/favorites/:showId
```
**Headers:** `Authorization: Bearer ${token}`

### Check Favorite Status
```http
GET /api/favorites/check/:showId
```
**Headers:** `Authorization: Bearer ${token}`

**Response:**
```json
{
  "success": true,
  "isFavorite": true
}
```

---

## 📊 Dashboard Endpoint

### Get Dashboard Data
```http
GET /dashboard
```
**Headers:** `Authorization: Bearer ${token}`

**Response:**
```json
{
  "username": "john_doe"
}
```

---

## 🗄️ Cache Endpoints

### Get Cache Statistics
```http
GET /api/cache/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalKeys": 15,
    "totalSize": "2.5MB",
    "cacheHitRatio": 0.85,
    "uptime": 3600,
    "memory": {
      "rss": 45678912,
      "heapTotal": 32768000,
      "heapUsed": 24567890
    }
  }
}
```

### Clear All Cache
```http
DELETE /api/cache/clear
```

### Delete Cache Key
```http
DELETE /api/cache/key/:key
```

---

## 🗃️ Database Schema

### Main Tables

- **users**: User accounts and authentication
- **tv_shows**: TV show information
- **episodes**: Episode details linked to shows
- **actors**: Actor information
- **show_actors**: Many-to-many relationship between shows and actors
- **favorites**: User favorite shows
- **tokens**: JWT tokens for authentication

### Show Types
- `Series`
- `Miniseries`
- `Documentary`
- `Movie`

---


## 📝 Error Handling

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error



