# Satchel & Co. — Bags E-commerce

Full-stack e-commerce application for leather bags with an Express.js backend and vanilla HTML/CSS/JS frontend.

## Project Structure

```
Bags E-commerce/
├── backend/
│   ├── server.js          # App entry point
│   ├── db.js              # Database pool re-export
│   ├── config/
│   │   ├── database.js    # MySQL connection pool
│   │   └── constants.js   # JWT & app constants
│   ├── routes/            # Thin route definitions
│   ├── controllers/       # HTTP handlers
│   ├── models/            # Data access layer
│   ├── services/          # Business logic
│   ├── middleware/        # Auth middleware
│   └── schema.sql         # Database schema
├── frontend/
│   ├── index.html         # Home page
│   ├── pages/             # App pages
│   ├── css/               # Stylesheets
│   ├── js/                # Client scripts
│   └── assets/            # Images & icons
├── .env                   # Environment variables
└── package.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create the database (XAMPP / MySQL):
   ```bash
   mysql -u root -p < backend/schema.sql
   ```

3. Configure `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=bags_db
   DB_PORT=3306
   PORT=3000
   JWT_SECRET=your_secret_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/register` | — |
| POST | `/api/login` | — |
| GET | `/api/products` | — |
| GET | `/api/products/:id` | — |
| GET/POST | `/api/cart` | User |
| PUT/DELETE | `/api/cart/:id` | User |
| POST/GET | `/api/orders` | User |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id/role` | Admin |
| POST/PUT/DELETE | `/api/admin/products` | Admin |
| GET | `/api/admin/orders` | Admin |
| PUT | `/api/admin/orders/:id/status` | Admin |
