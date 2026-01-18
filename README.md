# NGO Registration and Donation Management System

## Overview
A comprehensive NGO platform built with Next.js 14 full-stack architecture that enables user registration, secure donation processing, and administrative management. The application integrates MongoDB for data persistence and Razorpay payment gateway for handling donations. The system supports two user roles: User and Admin, with complete separation of registration and donation flows to ensure data integrity.

## System Requirements

### Dependencies
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "razorpay": "^2.9.2",
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16"
}
```

### System Prerequisites
- Node.js v18 or higher
- MongoDB (local installation or Atlas cloud)
- Razorpay account 
- Modern web browser with JavaScript enabled

## Setup and Installation

### Project Setup
1. Clone or create the project directory:
   ```bash
   mkdir ngo-nextjs-system
   cd ngo-nextjs-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file in root directory with following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ngo_system
   JWT_SECRET=secret_jwt_key_change_this
   RAZORPAY_KEY_ID=your_razorpay_test_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key_id
   ```

4. Start the development server:
   ````bash
   mongod
   ``````
   ```bash
   npm run dev
   ```

5. Application runs on: `http://localhost:3000`

### MongoDB Setup
1. **Local MongoDB:**
   - Install MongoDB Community Edition
   - Start MongoDB service: `mongod`
   - Database will be created automatically on first run

2. **MongoDB Atlas (Cloud):**
   - Create account at https://www.mongodb.com/atlas
   - Create new cluster 
   - Get connection string and update `MONGODB_URI`

### Razorpay Setup
1. Create account at https://dashboard.razorpay.com
2. Switch to **Test Mode** 
3. Navigate to Settings → API Keys
4. Generate Test API Keys
5. Copy Key ID and Key Secret to `.env.local`

## User Roles and Features

### Admin Features

#### Dashboard Analytics
- View total registered users count
- Track total donations(success/pending/failed)
- Monitor total amount collected
- Real-time statistics display
- Visual status breakdown of donations

#### User Management
- View all registered users in tabular format
- Search users by name or email
- Export user data to CSV format
- Access user details(name,email,phone,registration date)
#### DonationManagement
- View all donation records with complete details
- Filter donations by statu(success, pending, failed)
- See donor information for each transaction
- Track payment timestamps
- View aggregated donation statistics

#### Data Export
- Export complete user list to CSV
- Download includes:Name, Email,Addresss,Phone, Registration Date
- One-click export functionality
- Formatted data ready for spreadsheet applications

### User Features

#### Registration System
- Simple registration form with validation
- Required fields: Name,email,Address,Phone,Password
- Email and phone no. uniqueness validation
- Secure password storage (bcrypt hashing)
- Automatic JWT token generation
- Role-based redirection after registration
- Data stored independently of donations

#### Authentication
- Secure login with email and password
- JWT-based session management
- 7-day token expiration
- Role-based access control
- Persistent login using localStorage
- Automatic logout functionality

#### User Dashboard
- Personal profile information display
- View total donations made
- See total amount donated
- Track membership duration
- Quick access to donation history

#### Donation System
- Enter custom donation amount
- Quick amount buttons (₹100, ₹500, ₹1000, ₹5000)
- Secure Razorpay payment gateway integration
- Real-time payment status updates
- Support for multiple payment methods:
  - Credit/Debit Cards
  - Net Banking
  - UPI
  - Wallets
- Payment confirmation messages
- Automatic redirect after successful payment

#### Donation History
- View all donation attempts
- Track payment status (success/pending/failed)

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name:String (required,trimmed),
  email:String (required,unique,lowercase),
  password: String (hashed),
  address:String (required),
  phone:String (required),
  role:String (enum:['user','admin'],default: 'user'),
  registrationDate:Date (default: now),
  createdAt:Date (auto-generated),
  updatedAt:Date (auto-generated)
}
```
### Donation Collection
```javascript
{
  _id: ObjectId,
  user:ObjectId(ref:'User', required),
  amount:Number(required, min: 1),
  razorpayOrderId:String(required, unique),
  razorpayPaymentId:String(nullable),
  razorpaySignature:String (nullable),
  status:String(enum:['pending', 'success', 'failed']),
  donationDate:Date (default: now),
  completedAt:Date (nullable),
  createdAt:Date (auto-generated),
  updatedAt:Date (auto-generated)
}
```
### Data Relationships
- **User→Donation**: One-to-Many relationship
- User can have multiple donations
- Donations reference user via ObjectId
- Cascade delete considerations for data integrity

## API Routes

### Authentication Routes
```
POST   /api/auth/register - Register new user
POST   /api/auth/login   - User login
```

### User Routes (Protected)
```
GET    /api/user/profile  - Get user profile
GET    /api/user/donations - Get user's donation history
```

### Admin Routes (Admin Only)
```
GET    /api/admin/stats   - Get dashboard statistics
GET    /api/admin/users  - Get all users (with search/filter)
GET    /api/admin/donations - Get all donations (with filter)
GET    /api/admin/export - Export users to CSV
```

### Donation Routes (Protected)
```
POST   /api/donation/create-order- Create Razorpay order
POST   /api/donation/verify   - Verify payment signature
POST   /api/donation/mark-failed  - Mark donation as failed
```

## Payment Flow

### Donation Process
1. **User initiates donation:**
   - Enters amount on donation page
   - Clicks "Proceed to Payment"

2. **Order creation:**
   - API creates Razorpay order
   - Donation record created with status 'pending'
   - Order details returned to client

3. **Payment gateway:**
   - Razorpay checkout modal opens
   - User selects payment method
   - Completes payment process

4. **Payment verification:**
   - Razorpay sends payment response
   - Server verifies signature (HMAC SHA256)
   - Updates donation status based on verification

5. **Status update:**
   - **Success**: Status updated to 'success', payment details saved
   - **Failed**: Status updated to 'failed', timestamp recorded
   - **Cancelled**: User cancellation marked as 'failed'

6. **User notification:**
   - Success message displayed
   - Redirect to dashboard
   - Updated donation history

## UI/UX Features

### Design System
- Tailwind CSS utility-first framework
- Responsive design for all screen sizes

## Troubleshooting

### Common Issues

**1. MongoDB Connection Fails**
- **Symptom:** "MongoDB Connection Error" in console
- **Solutions:**
  - Check if MongoDB is running: `mongod --version`
  - Verify MONGODB_URI in `.env.local`
  - For Atlas: Check IP whitelist settings
  - Ensure network connectivity
  - Check firewall settings

**2. Payment Gateway Not Loading**
- **Symptom:** Razorpay checkout doesn't open
- **Solutions:**
  - Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is set
  - Check browser console for script loading errors
  - Ensure Razorpay script is loaded (check Network tab)
  - Clear browser cache
  - Test in incognito mode

**3. JWT Token Invalid**
- **Symptom:** Automatic logout or "Invalid token" error
- **Solutions:**
  - Verify JWT_SECRET matches between sessions
  - Check token expiration (7 days default)
  - Clear localStorage and login again
  - Ensure consistent JWT_SECRET in environment

**4. Donation Status Not Updating**
- **Symptom:** Donation stuck in 'pending' status
- **Solutions:**
  - Check server logs for verification errors
  - Verify RAZORPAY_KEY_SECRET is correct
  - Test signature verification logic
  - Check network during payment
  - Review Razorpay dashboard for payment status

**5. CSV Export Not Working**
- **Symptom:** Export button doesn't download file
- **Solutions:**
  - Check admin authentication
  - Verify API route is accessible
  - Check browser download settings
  - Review server logs for errors
  - Test with different browser

**6. Port Already in Use**
- **Symptom:** "Port 3000 is already in use"
- **Solutions:**
  ```bash
  # Find process using port 3000
  lsof -i :3000
  # Kill the process
  kill -9 <PID>
  # Or use different port
  PORT=3001 npm run dev
  ```

**7. Missing Dependencies**
- **Symptom:** Module not found errors
- **Solutions:**
  ```bash
  # Remove node_modules and reinstall
  rm -rf node_modules package-lock.json
  npm install
  ```

### Debug Mode
Enable detailed logging:
```javascript
// In API routes, add console.log statements
console.log('Request received:', request.method, request.url);
console.log('User:', user);
console.log('Error:', error);
```

### Getting Help
- Check server console for error messages
- Review browser console for client errors
- Check MongoDB logs
- Review Razorpay dashboard for payment logs
- Verify all environment variables are set
- Test API routes using Postman or curl