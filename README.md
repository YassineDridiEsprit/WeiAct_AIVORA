# AgriWei_Zitounti - Farm Management System
BLOCKCHAIN IA DEV IOT

A comprehensive farm management system built with React + TypeScript frontend and Node.js backend, migrated from Django. This system helps farmers manage their parcels, equipment, personnel, agricultural operations, and inventory.

## Features

### 🚜 Farm Management
- **Parcel Management**: Create and manage farm parcels with GPS boundaries
- **Interactive Maps**: View parcels on interactive maps using Leaflet
- **Crop Tracking**: Track different crop types and soil conditions
- **Area Calculations**: Automatic area and perimeter calculations

### 👥 Personnel & Equipment
- **Personnel Management**: Manage farm workers and their roles
- **Equipment Tracking**: Track farm equipment and machinery
- **Cost Management**: Calculate hourly costs for personnel and equipment

### 🌱 Agricultural Operations
- **Operation Planning**: Plan and schedule agricultural activities
- **Resource Allocation**: Assign personnel, equipment, and inputs to operations
- **Calendar View**: Visual calendar for operation scheduling
- **Cost Tracking**: Automatic cost calculations for operations

### 📦 Inventory Management
- **Input Tracking**: Manage seeds, fertilizers, pesticides, and fuel
- **Stock Alerts**: Low stock notifications
- **Usage Tracking**: Track input consumption in operations

### 📰 News & Updates
- **News System**: Admin can post news and updates
- **Information Sharing**: Keep farmers informed about industry updates

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Leaflet** for maps
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MySQL** database (via XAMPP)
- **Sequelize** ORM
- **JWT** authentication
- **bcryptjs** for password hashing

## Project Structure

```
project/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # API controllers
│   ├── middleware/         # Authentication & validation
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── scripts/           # Migration scripts
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── lib/              # API and utilities
│   ├── pages/            # Page components
│   └── App.tsx           # Main app component
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- XAMPP (for MySQL database)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure your database settings in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agri_wei
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
```

5. Start XAMPP and create the database:
```sql
CREATE DATABASE agri_wei;
```

6. Run the migration:
```bash
npm run migrate
```

7. Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure the API URL in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

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

## Usage

1. **Registration**: Create a new farmer account
2. **Parcel Creation**: Add farm parcels with GPS coordinates
3. **Resource Management**: Add equipment, personnel, and agricultural inputs
4. **Operation Planning**: Plan agricultural operations and assign resources
5. **Monitoring**: Track operations and inventory through the dashboard

## Database Schema

The system includes the following main entities:
- **farmers**: User accounts
- **parcels**: Farm land with GPS boundaries
- **equipment**: Farm equipment and machinery
- **personnel**: Farm workers and staff
- **agricultural_inputs**: Seeds, fertilizers, pesticides, etc.
- **agricultural_operations**: Planned farm activities
- **news**: News and announcements

## Development

### Backend Commands
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migration

### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Migration from Django

This project was migrated from a Django backend to Node.js while maintaining all functionality:

- **Models**: Converted Django models to Sequelize models
- **Views**: Converted Django REST views to Express controllers
- **Authentication**: Migrated from Django auth to JWT
- **Database**: Switched from PostgreSQL to MySQL
- **Frontend**: Updated to work with new Node.js API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository.
