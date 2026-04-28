# Blogify Platform

A modern, full-stack blogging platform where users can read, write, and manage stories.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT

## Getting Started

### Prerequisites
- Node.js
- MongoDB database (local or Atlas)

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` or update the existing `.env` with your MongoDB URI and JWT secret.
4. Run the development server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Admin Credentials for Testing

To review the application as an Admin, we have provided a seed script. Run the following command in the `backend` directory:

```bash
npm run seed:admin
```

This will create an admin user in the database with the following credentials:
- **Email**: admin@blogify.com
- **Password**: admin123

You can use these credentials to log in and test administrative features.
