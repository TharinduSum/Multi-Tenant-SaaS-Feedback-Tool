# Backend API - Multi-Tenant Feedback Tool

FastAPI-based REST API for a multi-tenant feedback management system with JWT authentication, role-based access control, and complete tenant isolation.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Development](#development)

## Features

- **FastAPI Framework**: High-performance, modern Python web framework
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and User roles
- **Multi-Tenant Isolation**: Complete data separation between tenants
- **RESTful API**: Well-structured endpoints following REST principles
- **Automatic API Documentation**: Interactive Swagger UI and ReDoc
- **SQLAlchemy ORM**: Database abstraction layer
- **Pydantic Validation**: Request/response validation with type hints
- **CORS Support**: Configurable cross-origin resource sharing

## Tech Stack

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM and database toolkit
- **PyMySQL** - MySQL database driver
- **python-jose** - JWT token handling
- **passlib** - Password hashing (bcrypt)
- **pydantic** - Data validation
- **python-dotenv** - Environment variable management
- **uvicorn** - ASGI server

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI application and routes
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # Database connection and session management
│   └── auth.py              # Authentication utilities (JWT, password hashing)
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup

### Prerequisites

- Python 3.8 or higher
- MySQL 5.7+ or MySQL 8.0+
- pip (Python package manager)

### Installation

1. **Create a virtual environment** (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Create MySQL database**:

```sql
CREATE DATABASE feedback_tool;
```

4. **Create `.env` file** in the `backend` directory:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/feedback_tool
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Configuration

### Environment Variables

| Variable                      | Description                            | Default | Required |
| ----------------------------- | -------------------------------------- | ------- | -------- |
| `DATABASE_URL`                | MySQL connection string                | -       | Yes      |
| `SECRET_KEY`                  | Secret key for JWT signing             | -       | Yes      |
| `ALGORITHM`                   | JWT algorithm                          | `HS256` | No       |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time                  | `30`    | No       |
| `CORS_ORIGINS`                | Allowed CORS origins (comma-separated) | -       | No       |

### Database URL Format

```
mysql+pymysql://[username]:[password]@[host]:[port]/[database_name]
```

Example:

```
mysql+pymysql://root:mypassword@localhost:3306/feedback_tool
```

## Running the Server

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Access Points

- **API Base URL**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc

## API Documentation

### Base URL

```
http://localhost:8000
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user",
  "tenant_id": 1
}
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "tenant_id": 1
}
```

#### Login

```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Tenant Endpoints

#### Get All Tenants

```http
GET /tenants
```

**Response:**

```json
[
  {
    "id": 1,
    "company_name": "Acme Corp",
    "slug": "acme-corp"
  }
]
```

#### Create Tenant

```http
POST /tenants
Content-Type: application/json

{
  "company_name": "Acme Corp",
  "slug": "acme-corp"
}
```

### Post Endpoints

#### Get Posts

```http
GET /posts?skip=0&limit=100
X-Tenant-ID: 1
```

**Query Parameters:**

- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Maximum number of records (default: 100)

**Headers:**

- `X-Tenant-ID` (required): Tenant ID for data isolation

**Response:**

```json
[
  {
    "id": 1,
    "title": "Feature Request",
    "description": "Add dark mode",
    "status": "planned",
    "user_id": 1,
    "tenant_id": 1
  }
]
```

#### Create Post

```http
POST /posts
Authorization: Bearer <token>
X-Tenant-ID: 1
Content-Type: application/json

{
  "title": "Feature Request",
  "description": "Add dark mode",
  "status": "planned"
}
```

**Headers:**

- `Authorization: Bearer <token>` (required): JWT access token
- `X-Tenant-ID` (required): Tenant ID

#### Upvote Post

```http
POST /posts/{post_id}/upvote
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": 1,
  "post_id": 1,
  "user_id": 1,
  "tenant_id": 1
}
```

### Admin Endpoints

#### Update Post Status

```http
PUT /posts/{post_id}/status?status=in_progress
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (enum): `planned`, `in_progress`, or `completed`

**Headers:**

- `Authorization: Bearer <token>` (required): JWT access token (Admin role required)

**Response:**

```json
{
  "id": 1,
  "title": "Feature Request",
  "description": "Add dark mode",
  "status": "in_progress",
  "user_id": 1,
  "tenant_id": 1
}
```

## Database Schema

### Tables

#### Tenants

| Column       | Type        | Constraints     |
| ------------ | ----------- | --------------- |
| id           | Integer     | Primary Key     |
| company_name | String(255) | Unique, Indexed |
| slug         | String(255) | Unique, Indexed |

#### Users

| Column        | Type        | Constraints              |
| ------------- | ----------- | ------------------------ |
| id            | Integer     | Primary Key              |
| email         | String(255) | Unique, Indexed          |
| password_hash | String(255) | -                        |
| role          | Enum        | `admin` or `user`        |
| tenant_id     | Integer     | Foreign Key → tenants.id |

#### Posts

| Column      | Type        | Constraints                           |
| ----------- | ----------- | ------------------------------------- |
| id          | Integer     | Primary Key                           |
| title       | String(255) | Indexed                               |
| description | Text        | -                                     |
| status      | Enum        | `planned`, `in_progress`, `completed` |
| user_id     | Integer     | Foreign Key → users.id                |
| tenant_id   | Integer     | Foreign Key → tenants.id              |

#### Upvotes

| Column    | Type    | Constraints              |
| --------- | ------- | ------------------------ |
| id        | Integer | Primary Key              |
| user_id   | Integer | Foreign Key → users.id   |
| post_id   | Integer | Foreign Key → posts.id   |
| tenant_id | Integer | Foreign Key → tenants.id |

### Relationships

- **Tenant** → has many **Users**, **Posts**, **Upvotes**
- **User** → belongs to **Tenant**, has many **Posts**, **Upvotes**
- **Post** → belongs to **User** and **Tenant**, has many **Upvotes**
- **Upvote** → belongs to **User**, **Post**, and **Tenant**

## Authentication

### JWT Token Flow

1. User registers or logs in via `/auth/register` or `/auth/login`
2. Server returns a JWT access token
3. Client includes token in `Authorization` header: `Bearer <token>`
4. Server validates token and extracts user information
5. Token expires after configured time (default: 30 minutes)

### Password Security

- Passwords are hashed using bcrypt before storage
- Plain passwords are never stored in the database
- Password verification uses constant-time comparison

### Protected Endpoints

Endpoints requiring authentication:

- `POST /posts` - Create post
- `POST /posts/{post_id}/upvote` - Upvote post
- `PUT /posts/{post_id}/status` - Update post status (Admin only)

## Multi-Tenant Architecture

### Tenant Isolation

The application implements tenant isolation at multiple levels:

1. **Header-Based Identification**: `X-Tenant-ID` header identifies the tenant context
2. **Database Filtering**: All queries are filtered by `tenant_id`
3. **User Validation**: Users can only access resources within their tenant
4. **Data Scoping**: All models include `tenant_id` for data separation

### Tenant ID Header

Most endpoints require the `X-Tenant-ID` header:

```http
X-Tenant-ID: 1
```

### Security Considerations

- Users are validated against their tenant on every request
- Cross-tenant access is prevented by filtering queries
- Admin users can only manage resources within their tenant
- Tenant ID is validated and enforced at the dependency level

## Development

### Code Structure

- **`main.py`**: FastAPI app, routes, and dependencies
- **`models.py`**: SQLAlchemy ORM models
- **`schemas.py`**: Pydantic models for request/response validation
- **`database.py`**: Database engine, session management
- **`auth.py`**: JWT and password utilities

### Adding New Endpoints

1. Define request/response schemas in `schemas.py`
2. Add route handler in `main.py`
3. Use dependencies for authentication and tenant isolation:
   ```python
   @app.get("/endpoint")
   def my_endpoint(
       db: Session = Depends(get_db),
       current_user: models.User = Depends(get_current_user),
       tenant_id: int = Depends(get_tenant_id)
   ):
       # Implementation
   ```

### Database Migrations

Currently, tables are created automatically using:

```python
models.Base.metadata.create_all(bind=engine)
```

For production, consider using Alembic for proper migrations.

### Testing

Example test structure:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login():
    response = client.post("/auth/login", data={
        "username": "user@example.com",
        "password": "password"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### Error Handling

The API uses FastAPI's built-in exception handling:

- `HTTPException` for custom error responses
- Status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secret Key**: Use a strong, random secret key in production
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Restrict CORS origins to known domains
5. **Password Hashing**: Bcrypt with appropriate cost factor
6. **SQL Injection**: SQLAlchemy ORM prevents SQL injection
7. **Token Expiration**: Tokens expire after configured time
8. **Input Validation**: Pydantic validates all inputs

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check `DATABASE_URL` format
- Ensure database exists
- Verify credentials

### Import Errors

- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check Python path includes the backend directory

### CORS Issues

- Verify `CORS_ORIGINS` includes your frontend URL
- Check frontend is sending requests to correct backend URL

## License

This project is part of the Multi-Tenant SaaS Feedback Tool.
