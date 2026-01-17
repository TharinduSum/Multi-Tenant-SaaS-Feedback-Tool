# Multi-Tenant SaaS Feedback Tool

A full-stack multi-tenant feedback management system built with FastAPI and React. This application allows multiple organizations (tenants) to manage their feedback posts independently with user authentication, upvoting, and admin controls.

## Features

- **Multi-Tenant Architecture**: Complete tenant isolation with separate data scoping
- **User Authentication**: JWT-based authentication with role-based access control (Admin/User)
- **Feedback Management**: Create, view, and manage feedback posts
- **Upvoting System**: Users can upvote feedback posts
- **Admin Dashboard**: Admins can update post statuses (Planned, In Progress, Completed)
- **Public Board**: View feedback posts for a specific tenant
- **RESTful API**: Well-structured FastAPI backend with automatic API documentation

## Tech Stack

### Backend

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **MySQL** - Relational database (via PyMySQL)
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Pydantic** - Data validation using Python type annotations

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## Project Structure

```
Multi-Tenant-SaaS-Feedback-Tool/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── models.py        # SQLAlchemy database models
│   │   ├── schemas.py       # Pydantic schemas for request/response validation
│   │   ├── database.py      # Database connection and session management
│   │   └── auth.py          # Authentication utilities (JWT, password hashing)
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/            # API client configuration
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers (Auth, Tenant)
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── PublicBoard.jsx
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- MySQL 5.7+ or MySQL 8.0+
- Git

## Installation

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the `backend` directory with the following variables:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/feedback_tool
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

5. Create the MySQL database:

```sql
CREATE DATABASE feedback_tool;
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies:

```bash
npm install
```

## Running the Application

### Backend

From the `backend` directory:

```bash
# Activate virtual environment if not already active
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- API: http://localhost:8000
- Interactive API docs (Swagger UI): http://localhost:8000/docs
- Alternative API docs (ReDoc): http://localhost:8000/redoc

### Frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token

### Tenants

- `GET /tenants` - Get all tenants
- `POST /tenants` - Create a new tenant

### Posts (Feedback)

- `GET /posts` - Get all posts for a tenant (requires `X-Tenant-ID` header)
- `POST /posts` - Create a new post (requires authentication)
- `POST /posts/{post_id}/upvote` - Upvote a post (requires authentication)
- `PUT /posts/{post_id}/status` - Update post status (requires admin role)

### Headers

- `Authorization: Bearer <token>` - Required for protected endpoints
- `X-Tenant-ID: <tenant_id>` - Required for tenant-scoped endpoints

## Database Models

- **Tenant**: Organizations using the system
- **User**: System users with email, password, role, and tenant association
- **Post**: Feedback posts with title, description, and status
- **Upvote**: User upvotes on posts

## Usage

1. **Create a Tenant**: Use the `/tenants` endpoint to create a tenant organization
2. **Register Users**: Register users associated with a tenant
3. **Login**: Users can login to get an access token
4. **Create Posts**: Authenticated users can create feedback posts
5. **Upvote Posts**: Users can upvote posts within their tenant
6. **Admin Actions**: Admins can update post statuses

## Development

### Backend Development

- The backend uses FastAPI's automatic reload feature when running with `--reload`
- Database migrations are handled automatically via SQLAlchemy's `create_all()`
- API documentation is automatically generated at `/docs`

### Frontend Development

- The frontend uses Vite's hot module replacement (HMR) for fast development
- ESLint is configured for code quality
- Tailwind CSS is used for styling

## Environment Variables

### Backend (.env)

- `DATABASE_URL`: MySQL connection string
- `SECRET_KEY`: Secret key for JWT token signing
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Tenant isolation ensures data separation
- CORS is configured to restrict origins
- SQL injection protection via SQLAlchemy ORM

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.
