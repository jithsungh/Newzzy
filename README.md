# Newzzy

Welcome to **Newzzy** – a modern, full-stack news aggregation and recommendation platform built with the MERN stack. This project is designed to deliver a seamless, secure, and engaging experience for users, developers, and recruiters alike.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Key Points for Recruiters](#key-points-for-recruiters)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview
Newzzy is a scalable, feature-rich platform for news discovery, personalized recommendations, and user engagement. It leverages advanced keyword extraction, secure authentication, and a beautiful UI to provide a best-in-class experience.

---

## Live Demo
- **Frontend:** [newzzy-six.vercel.app](https://newzzy-six.vercel.app/)
- **Server:** [newzzy-ynxa.onrender.com](https://newzzy-ynxa.onrender.com)
- **Backend:** [newzzy-server-1.onrender.com](https://newzzy-server-1.onrender.com)

---

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, DaisyUI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with advanced indexing)
- **Authentication:** JWT, bcrypt
- **Cloud Storage:** Cloudinary
- **Other:** Axios, PostCSS

---

## Architecture
- **MERN Stack:** MongoDB, Express.js, React, Node.js
- **RESTful APIs:** Modular, scalable endpoints
- **Microservices:** Separation of backend, server, and frontend for scalability
- **Modern UI:** Responsive, accessible, and visually appealing

---

## Features
### User-Facing
- **News Aggregation:** Fetches and displays trending articles
- **Personalized Recommendations:** Advanced keyword extraction and user preferences
- **Authentication:** Secure login/signup with JWT and bcrypt
- **Profile Management:** Upload profile images, manage preferences
- **Password Recovery:** OTP-based forgot password flow
- **Article Management:** Save, view, and explore articles
- **Search:** Fast, relevant search results
- **Responsive Design:** Works on all devices

### Admin/Developer
- **API Key Management:** Secure, modular API key system
- **Keyword Extraction:** Advanced algorithms for better recommendations
- **Index Optimization:** MongoDB indexes for performance
- **Modular Codebase:** Easy to extend and maintain

---

## Setup & Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/jithsungh/Newzzy.git
   cd Newzzy
   ```
2. **Install dependencies:**
   - Frontend:
     ```sh
     cd frontend
     npm install
     ```
   - Backend:
     ```sh
     cd ../backend
     npm install
     ```
   - Server:
     ```sh
     cd ../server
     npm install
     ```
3. **Configure environment variables:**
   - Create `.env` files in each folder as needed (see sample `.env.example`)
4. **Run locally:**
   - Backend: `node server.js`
   - Server: `node server.js`
   - Frontend: `npm run dev`

---

## Folder Structure
- `frontend/` – React app, UI components, pages, hooks, context
- `backend/` – API logic, controllers, models, routes, utils
- `server/` – Additional server logic, migrations, middlewares

---

## API Endpoints
- **Authentication:** `/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password`
- **Articles:** `/api/articles`, `/api/articles/:id`, `/api/articles/search`
- **Profile:** `/api/profile`, `/api/profile/image`
- **Recommendations:** `/api/recommendations`
- **API Keys:** `/api/keys`, `/api/keys/validate`

See [MONGODB_INDEX_OPTIMIZATION.md](MONGODB_INDEX_OPTIMIZATION.md) and [API_KEY_MANAGEMENT.md](backend/API_KEY_MANAGEMENT.md) for details.

---

## Security
- **JWT Authentication:** Stateless, secure sessions
- **Password Hashing:** bcrypt for strong password security
- **API Key Validation:** Prevents unauthorized access
- **Input Validation:** Prevents common attacks

---

## Key Points for Recruiters
- **Scalable Architecture:** Modular, microservices-ready
- **Modern UI/UX:** Tailwind CSS, DaisyUI, responsive design
- **Security Best Practices:** JWT, bcrypt, API key management
- **Performance:** MongoDB indexing, optimized queries
- **Clean Codebase:** Well-documented, easy to extend
- **DevOps Ready:** Vercel and Render deployments
- **Team Collaboration:** Clear folder structure, documentation

---

## Future Roadmap
- [ ] **Push Notifications**
- [ ] **Social Login Integration**
- [ ] **Advanced Analytics Dashboard**
- [ ] **Mobile App (React Native)**
- [ ] **AI-powered Recommendations**
- [ ] **Internationalization (i18n)**

---

## Contributing
We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License
This project is licensed under the MIT License.

---

## Useful Links
- [Frontend Demo](https://newzzy-six.vercel.app/)
- [Backend API](https://newzzy-server-1.onrender.com)
- [Server API](https://newzzy-ynxa.onrender.com)
- [MongoDB](https://www.mongodb.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [JWT](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Cloudinary](https://cloudinary.com/)

---

## Contact
For questions, reach out via [GitHub Issues](https://github.com/jithsungh/Newzzy/issues) or email the maintainer.

---

**Newzzy – News, Reimagined.**
