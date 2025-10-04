# AgriWei Backend

A Node.js backend for the AgriWei farm management system, migrated from Django.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Farm Management**: Parcels, equipment, personnel, and agricultural inputs
- **Operations**: Plan and track agricultural operations
- **Calendar**: Calendar view of operations
- **News**: News management system
- **Database**: MySQL with Sequelize ORM

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MySQL (via XAMPP)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Configure your database settings in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agri_wei
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
```

4. Create the database in MySQL:
```sql
CREATE DATABASE agri_wei;
```

5. Run the migration:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new farmer
- `POST /api/users/login` - Login
- `POST /api/users/token/refresh` - Refresh access token
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Farm Management
- `GET /api/farm/parcels` - Get all parcels
- `POST /api/farm/parcels` - Create a new parcel
- `GET /api/farm/equipment` - Get all equipment
- `POST /api/farm/equipment` - Create new equipment
- `GET /api/farm/personnel` - Get all personnel
- `POST /api/farm/personnel` - Create new personnel
- `GET /api/farm/inputs` - Get all inputs
- `POST /api/farm/inputs` - Create new input

### Operations
- `GET /api/farm/operations` - Get all operations
- `POST /api/farm/operations` - Create new operation
- `GET /api/farm/operations/calendar` - Get operations for calendar

### News
- `GET /api/news` - Get all news
- `GET /api/news/:id` - Get specific news item

## Database Schema

The system uses the following main entities:

- **Farmers**: User accounts
- **Parcels**: Farm land with GPS boundaries
- **Equipment**: Farm equipment and machinery
- **Personnel**: Farm workers and staff
- **AgriculturalInputs**: Seeds, fertilizers, pesticides, etc.
- **AgriculturalOperations**: Planned farm activities
- **News**: News and announcements

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migration

## Environment Variables

See `env.example` for all available environment variables.
