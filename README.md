# Airbnb Clone – Full-Stack MERN Application

A production-grade Airbnb-style booking platform built with the MERN Stack, supporting real listings, advanced filters, bookings with availability checks, secure payments, reviews, user roles (guest/host/admin), and a modern Airbnb-inspired UI.

This project is fully professional — not a demo. It includes scalable backend architecture, clean React frontend, and structured industry patterns.

---

## 🌍 Live Demo (Deployment Link)

🔗 **Frontend Live URL:** https://YOUR_DEPLOYED_FRONTEND_LINK  
🔗 **Backend API Base URL:** https://YOUR_DEPLOYED_BACKEND_LINK  

> Replace these with your actual deployed URLs once you host on Vercel / Render / Railway / DigitalOcean.

---

## 📸 Screenshots

> Add your actual screenshots inside the `frontend/public/screenshots/` folder.

### 🏠 Home Page  
![Home Page](C:\Users\dilee\OneDrive\Pictures\Screenshots\Screenshot 2025-12-04 080547.png)

### 🔍 Listings Page  
![Listings](./frontend/public/screenshots/listings.png)

### 📄 Listing Details  
![Listing Details](./frontend/public/screenshots/details.png)

### 🛏️ Booking Page  
![Booking](./frontend/public/screenshots/booking.png)

### ⭐ Reviews  
![Reviews](./frontend/public/screenshots/reviews.png)


---

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS v4
- React Router v6
- State management via hooks
- Fully responsive UI

### Backend
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- JWT authentication
- Cloudinary uploads
- Stripe Checkout API

### Database
- MongoDB Atlas
- Schemas: Users, Listings, Bookings, Reviews

---

## Key Features

### Authentication
- Email + Password login
- Roles: Guest, Host, Admin

### Listings
- Create / Edit / Delete
- Image uploads (Cloudinary)
- High-quality rendering
- Categories
- Search, filters, pagination

### Booking System
- Calendar date picker
- Availability validation
- Per-night pricing
- Stripe test payments

### Reviews
- Submit rating + comment
- Average rating calculation
- Real-time UI updates

### Admin Controls
- Delete any listing
- View all bookings

### UI/UX
- Airbnb-style design
- Modern search bar
- Filters modal
- Smooth animations
- Tailwind v4 gradients

---

## Project Structure

```
airbnb_clone/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── App.tsx
│   ├── public/screenshots/
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── scripts/
│   │   │   └── seedListings.ts
│   │   └── server.ts
│   ├── tsconfig.json
│   └── .env
│
└── package.json
```

---

## Run Locally

### Clone repo
```bash
git clone https://github.com/YOUR_USERNAME/airbnb_clone.git
cd airbnb_clone
```

---

# Backend Setup

### Install dependencies
```bash
cd backend
npm install
```

### Add `.env`
```
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_test_key
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
```

### Start server
```bash
npm run dev
```

---

# Frontend Setup

### Install dependencies
```bash
cd ../frontend
npm install
```

### Start development server
```bash
npm run dev
```

---

## Seeding Test Listings
```bash
npm run seed:listings
```

This script inserts demo listings with images.

---

## Stripe Test Card
```
4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
```

---

## Login Credentials

### Admin
Create manually in MongoDB:

```json
{
  "email": "admin@example.com",
  "passwordHash": "...",
  "role": "admin"
}
```

### Host
Register → update role to `"host"`.

### Guest
Register normally.

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Listings
```
GET /api/listings
GET /api/listings/:id
POST /api/listings
PUT /api/listings/:id
DELETE /api/listings/:id
```

### Reviews
```
GET /api/reviews/:listingId
POST /api/reviews
```

### Bookings
```
POST /api/bookings
GET /api/bookings/me
```

### Payments
```
POST /api/payments/create-checkout-session
```

---

## Deployment

### Frontend (Vercel)
- Connect GitHub repo  
- Set environment variables  
- Deploy instantly  

### Backend (Render / Railway / DigitalOcean)
- Add `build & start commands`  
- Add environment variables  
- Connect GitHub  
- Auto deploy on push  

#### Required ENV Vars
```
MONGO_URI
JWT_SECRET
STRIPE_SECRET_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## Future Enhancements
- Google Maps map-based search  
- Favorite / Wishlist  
- Messaging system  
- Admin dashboard UI  
- Email/SMS notifications  
- Global multi-city search  

---

## Contributing
PRs are welcome.  
For major changes, open an issue first.

---

## License
MIT License

---

## Author – Dileep
Full-Stack MERN Developer  
Strong in TypeScript, React, Node.js, MongoDB, Tailwind CSS, System Design.  
More projects coming soon.

