# 📰 Newzzy

<div align="center">

![Newzzy Logo](https://newzzy-six.vercel.app/favicon.ico)

Welcome to **Newzzy** – a cutting-edge, full-stack news aggregation and recommendation platform built with the powerful MERN stack! 🚀

_Your gateway to personalized news discovery, reimagined for the modern world_ ✨

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-brightgreen?style=for-the-badge&logo=vercel)](https://newzzy-six.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Active-blue?style=for-the-badge&logo=render)](https://newzzy-server-1.onrender.com)
[![Server](https://img.shields.io/badge/Server-Running-orange?style=for-the-badge&logo=render)](https://newzzy-ynxa.onrender.com)

</div>

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🌐 Live Demo](#-live-demo)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [✨ Features](#-features)
- [⚙️ Setup & Installation](#️-setup--installation)
- [📁 Folder Structure](#-folder-structure)
- [🔌 API Endpoints](#-api-endpoints)
- [🔐 Security](#-security)
- [💼 Key Points for Recruiters](#-key-points-for-recruiters)
- [🗺️ Future Roadmap](#️-future-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Project Overview

**Newzzy** is a revolutionary, enterprise-grade news platform that combines the power of artificial intelligence with modern web technologies to deliver a truly personalized news experience. 🌟

### What Makes Newzzy Special?

- 🧠 **Smart AI-Powered Recommendations**: Advanced keyword extraction algorithms that learn from user behavior
- 📱 **Cross-Platform Excellence**: Seamlessly responsive design that works flawlessly on desktop, tablet, and mobile
- ⚡ **Lightning-Fast Performance**: Optimized MongoDB indexing and efficient caching strategies
- 🔒 **Enterprise-Grade Security**: Multi-layered security with JWT, bcrypt, and API key management
- 🎨 **Modern UI/UX**: Beautiful, accessible interface built with Tailwind CSS and DaisyUI
- 📊 **Real-Time Data**: Live news feeds powered by NewsData.io API

Built for developers, by developers – Newzzy showcases best practices in full-stack development, making it an ideal portfolio project and learning resource. 💻

---

## 🌐 Live Demo

- 🚀 **Frontend:** [newzzy-six.vercel.app](https://newzzy-six.vercel.app/) - _Lightning-fast React app deployed on Vercel_
- 🔧 **Server:** [newzzy-ynxa.onrender.com](https://newzzy-ynxa.onrender.com) - _Authentication & user management server_
- 🗄️ **Backend:** [newzzy-server-1.onrender.com](https://newzzy-server-1.onrender.com) - _Core API & news processing engine_

> 🌟 **Pro Tip**: Visit the frontend to experience the full user journey, from signup to personalized news discovery!

---

## 🛠️ Tech Stack

### Frontend Technologies 🎨

- ⚛️ **React** - Modern component-based UI library
- ⚡ **Vite** - Next-generation frontend tooling for blazing fast development
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- 🌸 **DaisyUI** - Semantic component classes for Tailwind CSS
- 📱 **Responsive Design** - Mobile-first approach with perfect cross-device compatibility

### Backend Technologies 🔧

- 🟢 **Node.js** - JavaScript runtime for server-side development
- 🚂 **Express.js** - Fast, unopinionated web framework for Node.js
- 🍃 **MongoDB** - NoSQL database with advanced indexing and aggregation
- 🏗️ **Mongoose** - Elegant MongoDB object modeling for Node.js

### Security & Authentication 🔐

- 🎫 **JWT (JSON Web Tokens)** - Stateless authentication and authorization
- 🔒 **bcrypt** - Industry-standard password hashing library
- 🛡️ **API Key Management** - Secure external API integration

### Cloud & DevOps ☁️

- ☁️ **Cloudinary** - Cloud-based image and video management
- 🌐 **Vercel** - Frontend hosting with global CDN
- 🚀 **Render** - Backend hosting with auto-scaling capabilities

### External APIs 🌍

- 📰 **NewsData.io** - Real-time news data from thousands of sources worldwide
- 📧 **Email Services** - OTP verification and password recovery

### Development Tools 🔨

- 📦 **npm** - Package management and dependency handling
- 🔄 **Axios** - Promise-based HTTP client for API requests
- 🎯 **PostCSS** - CSS processing and optimization

---

## 🏗️ Architecture

### 🏛️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Server        │    │   NewsData.io   │
│   (React/Vite)  │◄──►│   (Auth/User)   │    │   (External     │
│   Port: 5173    │    │   Port: 5433    │    │      API)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ 
│   Vercel CDN    │    │   MongoDB       │◄──►│   (Server 1)    |
│   (Global)      │    │   (Database)    │    │   (backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 Architecture Highlights

- 🏗️ **MERN Stack Foundation** - MongoDB, Express.js, React, Node.js
- 🌐 **RESTful APIs** - Clean, modular endpoints following REST principles
- 🏢 **Microservices Ready** - Separation of concerns with independent deployments
- 📱 **Modern UI/UX** - Responsive, accessible, and visually stunning interface
- ⚡ **Performance Optimized** - Database indexing, caching, and lazy loading
- 🔒 **Security First** - Multiple layers of protection and validation

---

## ✨ Features

### 👥 User-Facing Features

- 📰 **News Aggregation** - Curated content from thousands of trusted sources worldwide via NewsData.io
- 🎯 **Personalized Recommendations** - AI-powered content suggestions based on reading history and preferences
- 🔐 **Secure Authentication** - Robust login/signup system with JWT tokens and bcrypt encryption
- 👤 **Profile Management** - Upload custom profile images, manage personal preferences, and customize experience
- 🔑 **Password Recovery** - Secure OTP-based forgot password flow with email verification
- 💾 **Article Management** - Save articles for later, view reading history, and organize favorites
- 🔍 **Smart Search** - Lightning-fast, relevant search results with advanced filtering options
- 📱 **Responsive Design** - Flawless experience across all devices and screen sizes
- 🌙 **Dark/Light Mode** - Eye-friendly themes for day and night reading
- ⚡ **Real-time Updates** - Live news feeds with instant notifications
- 📊 **Reading Analytics** - Track reading habits and discover new interests

### 🛠️ Admin/Developer Features

- 🔑 **API Key Management** - Secure, centralized system for managing external API credentials
- 🧠 **Advanced Keyword Extraction** - Sophisticated algorithms for content categorization and recommendations
- 📈 **Performance Monitoring** - MongoDB indexing optimization and query performance tracking
- 🏗️ **Modular Codebase** - Clean architecture that's easy to extend, test, and maintain
- 🔧 **Development Tools** - Comprehensive logging, error handling, and debugging utilities
- 📊 **Analytics Dashboard** - User engagement metrics and system performance insights
- 🔄 **Auto-scaling** - Cloud infrastructure that adapts to traffic demands
- 🧪 **Testing Suite** - Comprehensive unit and integration tests for reliability

---

## ⚙️ Setup & Installation

### 🚀 Quick Start Guide

#### Prerequisites 📋

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- NewsData.io API key ([Get yours here](https://newsdata.io/))
- Cloudinary account for image storage

#### Step-by-Step Installation 🔧

1. **📥 Clone the repository:**

   ```bash
   git clone https://github.com/jithsungh/Newzzy.git
   cd Newzzy
   ```

2. **📦 Install dependencies for all modules:**

   ```bash
   # Frontend dependencies
   cd frontend
   npm install

   # Backend dependencies
   cd ../backend
   npm install

   # Server dependencies
   cd ../server
   npm install
   ```

3. **🔧 Configure environment variables:**

   Create `.env` files in each directory with the following variables:

   **Backend (.env):**

   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEWSDATA_API_KEY=your_newsdata_io_api_key
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

   **Server (.env):**

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   BREV_API_KEY=your_email_service_key
   ```

4. **🔑 Get Your NewsData.io API Key:**

   - Visit [NewsData.io](https://newsdata.io/)
   - Sign up for a free account
   - Navigate to your dashboard
   - Copy your API key and add it to your `.env` file

5. **🚀 Run the application:**

   ```bash
   # Terminal 1: Start Backend (Port 8000)
   cd backend
   npm start

   # Terminal 2: Start Server (Port 5000)
   cd server
   npm start

   # Terminal 3: Start Frontend (Port 3000)
   cd frontend
   npm run dev
   ```

6. **🌐 Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5432
   - Server API: http://localhost:5433

### 🐳 Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 📁 Folder Structure

```
📁 Newzzy/
├── 📂 frontend/                    # React frontend application
│   ├── 📂 src/
│   │   ├── 📂 components/         # Reusable UI components
│   │   ├── 📂 pages/             # Route-based page components
│   │   ├── 📂 hooks/             # Custom React hooks
│   │   ├── 📂 context/           # React Context providers
│   │   ├── 📂 api/               # API integration services
│   │   ├── 📂 utils/             # Helper functions and utilities
│   │   └── 📂 assets/            # Static assets and images
│   ├── 📄 package.json           # Frontend dependencies
│   ├── 📄 vite.config.js         # Vite configuration
│   └── 📄 tailwind.config.js     # Tailwind CSS configuration
│
├── 📂 backend/                     # NewsFetcher - fetches news from external API
│   ├── 📂 src/
│   │   ├── 📂 controllers/       # Business logic handlers
│   │   ├── 📂 models/            # Database models (Mongoose)
│   │   ├── 📂 routes/            # API route definitions
│   │   ├── 📂 utils/             # Backend utility functions
│   │   ├── 📂 config/            # Configuration files
│   │   └── 📂 scripts/           # Database scripts and indexing
│   ├── 📄 server.js              # Backend entry point
│   └── 📄 package.json           # Backend dependencies
│
├── 📂 server/                      # Main API backend - Authentication & user management server
│   ├── 📂 src/
│   │   ├── 📂 controllers/       # Auth controllers
│   │   ├── 📂 middlewares/       # Authentication middlewares
│   │   ├── 📂 routes/            # Auth routes
│   │   ├── 📂 models/            # User models
│   │   ├── 📂 services/          # Email and notification services
│   │   └── 📂 migrations/        # Database migrations
│   ├── 📄 server.js              # Server entry point
│   └── 📄 package.json           # Server dependencies
│
├── 📄 README.md                   # Project documentation
├── 📄 CONTRIBUTING.md             # Contribution guidelines
├── 📄 package.json                # Root package configuration
└── 📄 .gitignore                  # Git ignore rules
```

---

## 🔌 API Endpoints

### 🔐 Authentication Endpoints

- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/signup` - User registration with validation
- `POST /api/auth/forgot-password` - Initiate password recovery
- `POST /api/auth/reset-password` - Complete password reset with OTP
- `POST /api/auth/verify-otp` - Verify email OTP
- `GET /api/auth/me` - Get current user profile

### 📰 Articles Endpoints

- `GET /api/articles` - Fetch paginated articles with filters
- `GET /api/articles/:id` - Get specific article details
- `GET /api/articles/search` - Search articles by keywords
- `GET /api/articles/trending` - Get trending articles
- `GET /api/articles/category/:category` - Get articles by category
- `POST /api/articles/save` - Save article to user's collection
- `DELETE /api/articles/unsave/:id` - Remove saved article

### 👤 Profile Endpoints

- `GET /api/profile` - Get user profile information
- `PUT /api/profile` - Update user profile
- `POST /api/profile/image` - Upload profile image to Cloudinary
- `GET /api/profile/preferences` - Get user reading preferences
- `PUT /api/profile/preferences` - Update reading preferences

### 🎯 Recommendations Endpoints

- `GET /api/recommendations` - Get personalized article recommendations
- `POST /api/recommendations/feedback` - Submit user feedback on recommendations
- `GET /api/recommendations/keywords` - Get user's extracted keywords

### 🔑 API Keys Management

- `GET /api/keys` - List all API keys (admin only)
- `POST /api/keys/validate` - Validate API key status
- `PUT /api/keys/rotate` - Rotate API keys (admin only)

> 📚 **Detailed Documentation**: See [MONGODB_INDEX_OPTIMIZATION.md](MONGODB_INDEX_OPTIMIZATION.md) and [API_KEY_MANAGEMENT.md](backend/API_KEY_MANAGEMENT.md) for complete API specifications.

---

## 🔐 Security

### 🛡️ Security Features & Best Practices

- 🎫 **JWT Authentication** - Stateless, secure session management with automatic token expiration
- 🔒 **Password Hashing** - Industry-standard bcrypt with salt rounds for maximum security
- 🔑 **API Key Validation** - Secure external API integration with rotation capabilities
- 🛡️ **Input Validation** - Comprehensive sanitization to prevent XSS, SQL injection, and other attacks
- 🌐 **CORS Protection** - Configured Cross-Origin Resource Sharing for secure API access
- 🔐 **Rate Limiting** - API throttling to prevent abuse and DDoS attacks
- 📧 **Email Verification** - OTP-based verification for account security
- 🔍 **Data Encryption** - Sensitive data encryption in transit and at rest
- 🚫 **No SQL Injection** - Mongoose ODM provides built-in protection
- 📱 **Secure Headers** - Implementation of security headers (HTTPS, CSP, etc.)

### 🏆 Security Compliance

- ✅ OWASP Security Guidelines
- ✅ Data Protection Best Practices
- ✅ Industry-Standard Encryption
- ✅ Secure Development Lifecycle

---

## 💼 Key Points

### 🚀 Technical Excellence & Industry Standards

- 🏗️ **Scalable Architecture** - Enterprise-ready microservices architecture with independent deployments
- 🎨 **Modern UI/UX** - Cutting-edge design with Tailwind CSS, DaisyUI, and responsive excellence
- 🔒 **Security Best Practices** - JWT, bcrypt, API key management, and OWASP compliance
- ⚡ **Performance Optimization** - MongoDB indexing, query optimization, and caching strategies
- 📝 **Clean Codebase** - Well-documented, modular code following industry best practices
- ☁️ **DevOps Ready** - Production deployments on Vercel and Render with CI/CD capabilities
- 👥 **Team Collaboration** - Clear folder structure, comprehensive documentation, and Git workflows

### 💡 Problem-Solving & Innovation

- 🧠 **AI Integration** - Advanced keyword extraction and personalized recommendation algorithms
- 📊 **Data Management** - Efficient handling of large datasets with MongoDB aggregation pipelines
- 🔄 **Real-time Processing** - Live news feeds and instant user interactions
- 🎯 **User Experience** - Intuitive interface design with accessibility considerations
- 🛠️ **Custom Solutions** - Built-from-scratch components tailored to specific requirements

### 🌟 Professional Development Skills

- 📚 **Full-Stack Proficiency** - End-to-end development from database to UI
- 🔧 **Modern Tooling** - Latest technologies and development practices
- 🧪 **Testing & Quality** - Comprehensive testing strategies and code quality assurance
- 📈 **Performance Monitoring** - Analytics, optimization, and continuous improvement
- 🚀 **Deployment & Operations** - Cloud hosting, domain management, and production maintenance

---

## 🗺️ Future Roadmap

### 🔮 Upcoming Features & Enhancements

#### Phase 1: Enhanced User Experience 📱

- [ ] 🔔 **Push Notifications** - Real-time alerts for breaking news and personalized updates
- [ ] 🌐 **Social Login Integration** - Google, Facebook, and GitHub authentication options
- [ ] 🎨 **Advanced Theme System** - Multiple color schemes and customizable UI preferences
- [ ] 📖 **Reading Mode** - Distraction-free article reading with typography optimization

#### Phase 2: Advanced Analytics & AI 🤖

- [ ] 📊 **Advanced Analytics Dashboard** - User engagement metrics and reading pattern analysis
- [ ] 🗣️ **Voice Search** - Speech-to-text search functionality
- [ ] 🏷️ **Auto-Tagging System** - Automatic content categorization and tag generation

#### Phase 3: Mobile & Expansion 🌍

- [ ] 📱 **Mobile App (React Native)** - Native iOS and Android applications
- [ ] 🌍 **Internationalization (i18n)** - Multi-language support and localization
- [ ] 🌐 **PWA Support** - Progressive Web App with offline reading capabilities
- [ ] 🔄 **Social Sharing** - Integration with social media platforms

#### Phase 4: Enterprise Features 🏢

- [ ] 📈 **Business Analytics** - Enterprise-grade reporting and insights
- [ ] 👥 **Team Collaboration** - Shared reading lists and team news curation
- [ ] 🔒 **Enterprise SSO** - Single Sign-On integration for corporate environments
- [ ] 📰 **White-label Solution** - Customizable news platform for other organizations

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! 🎉 Whether you're fixing bugs, adding features, or improving documentation, your contributions help make Newzzy better for everyone.

### 🌟 Ways to Contribute

- 🐛 **Bug Reports** - Help us identify and fix issues
- ✨ **Feature Requests** - Suggest new functionality and improvements
- 💻 **Code Contributions** - Submit pull requests with enhancements
- 📚 **Documentation** - Improve guides, tutorials, and API docs
- 🎨 **Design** - UI/UX improvements and accessibility enhancements
- 🧪 **Testing** - Write tests and improve code coverage

### 📋 Getting Started

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

> 📖 **Read our detailed [CONTRIBUTING.md](CONTRIBUTING.md) for complete guidelines and best practices.**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details. 📜

### 🎉 What this means:

- ✅ **Commercial Use** - Use in commercial applications
- ✅ **Modification** - Modify and customize as needed
- ✅ **Distribution** - Share and distribute freely
- ✅ **Private Use** - Use for personal projects
- ❗ **Attribution Required** - Credit the original authors

---

## 🔗 Useful Links & Resources

### 🌐 Live Applications

- 🚀 [Frontend Demo](https://newzzy-six.vercel.app/) - Experience the full user interface
- 🔧 [Backend API](https://newzzy-server-1.onrender.com) - Core news processing API
- 🔐 [Server API](https://newzzy-ynxa.onrender.com) - Authentication server

### 📚 Documentation & APIs

- 📰 [NewsData.io](https://newsdata.io/) - News API provider
- 🗄️ [MongoDB](https://www.mongodb.com/) - Database documentation
- ⚛️ [React](https://react.dev/) - Frontend library
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- 🌸 [DaisyUI](https://daisyui.com/) - Component library

### 🔒 Security & Authentication

- 🎫 [JWT.io](https://jwt.io/) - JSON Web Tokens
- 🔐 [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- ☁️ [Cloudinary](https://cloudinary.com/) - Image management

### 🛠️ Development Tools

- ⚡ [Vite](https://vitejs.dev/) - Build tool
- 📦 [Node.js](https://nodejs.org/) - Runtime environment
- 🚂 [Express.js](https://expressjs.com/) - Web framework

---

## 📞 Contact & Support

### 💬 Get Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/jithsungh/Newzzy/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/jithsungh/Newzzy/discussions)
- 📧 **Email**: Contact the maintainer for urgent matters
- 💼 **LinkedIn**: Connect for professional inquiries

### 🌟 Show Your Support

- ⭐ **Star the repository** if you find it useful
- 🍴 **Fork and contribute** to help improve the project
- 📢 **Share with others** who might benefit from Newzzy
- 📝 **Write a review** or blog post about your experience

---

<div align="center">

## 🎉 Thank You for Exploring Newzzy!

_Built with ❤️ by passionate developers for the community_

**🌟 Newzzy – Where News Meets Innovation 🌟**

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/jithsungh/Newzzy)
[![Open Source](https://img.shields.io/badge/Open%20Source-💝-green?style=for-the-badge)](https://github.com/jithsungh/Newzzy)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-blue?style=for-the-badge)](CONTRIBUTING.md)

</div>
