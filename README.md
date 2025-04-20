# Attendance Tracker

A multi-role attendance tracking system with location monitoring for companies and their staff.

## Features

### Admin Features
- Full control over the entire system
- CRUD operations for companies, staff users, reports, and system configurations
- View and manage all data across the platform
- Access a dashboard with system-wide analytics

### Company Features
- Register and manage company account
- Add, edit, or delete staff profiles
- View and download attendance reports (daily, weekly, monthly)
- Track staff location logs
- Dashboard overview of staff activities and alerts

### Staff Features
- Log in to personal account
- Check in when arriving at work (captures GPS location)
- Check out when leaving (captures GPS location)
- Automated hourly location tracking
- View personal attendance history

## Tech Stack

- **Frontend**: Next.js with React and TypeScript
- **UI Library**: TailwindCSS for styling
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based authentication
- **Location**: Google Maps API integration

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or cloud instance)
- Google Maps API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd attendance-tracker
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Routes

The application provides the following API routes:

### Authentication
- `POST /api/auth/login`: Log in a user
- `POST /api/auth/register`: Register a new user

### Staff Endpoints
- `POST /api/staff/check-in`: Check in with location
- `POST /api/staff/check-out`: Check out with location
- `POST /api/staff/track-location`: Track current location
- `GET /api/staff/track-location`: Get location history

### Company Endpoints
- `GET /api/company/attendance`: Get attendance records
- `POST /api/company/generate-report`: Generate attendance report

### Admin Endpoints
- Admin endpoints for managing users, companies, and system settings

## Deployment

The application can be deployed to any Node.js hosting platform, such as Vercel, Netlify, or a traditional server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
