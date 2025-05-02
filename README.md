# School Payment & Dashboard System - Frontend

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?logo=typescript&logoColor=white)
![Material UI](https://img.shields.io/badge/Material_UI-5.x-0081CB?logo=material-ui&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)

A modern, responsive frontend for the School Payment & Dashboard System that enables schools to manage transactions, track payments, and analyze financial data efficiently.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Mock Data](#mock-data)
- [Dark Mode](#dark-mode)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Secure login and registration system with role-based access control
- **Dashboard**: Overview of key metrics, recent transactions, and payment statistics
- **Transaction Management**: View, filter, sort, and search through all transactions
- **School-specific Transactions**: View and manage transactions for specific schools
- **Payment Processing**: Create new payment records and process payments
- **Transaction Status Checking**: Verify the status of any transaction using a unique order ID
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Mock Data Support**: Development mode with mock data for testing without a backend

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Components**: Material UI 5
- **Styling**: TailwindCSS for utility classes + Material UI theming
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form (with Yup validation)
- **Development Tools**: Vite, ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/school-payment-dashboard-system.git
cd school-payment-dashboard-system/frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false
```

### Running the Application

For development:

```bash
npm run dev
# or
yarn dev
```

For production build:

```bash
npm run build
# or
yarn build
```

To serve the production build locally:

```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images, fonts, and other static resources
│   │   ├── Layout/     # Layout components (Header, Sidebar, etc.)
│   │   ├── common/     # Common UI elements
│   │   └── ...
│   ├── context/        # React Context providers
│   │   ├── AuthContext.tsx   # Authentication context
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── Transactions/
│   │   └── ...
│   ├── services/       # API and service integrations
│   │   ├── api.ts      # Axios configuration and API methods
│   │   └── ...
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main App component with routing
│   ├── index.tsx       # Entry point
│   └── theme.ts        # Material UI theme configuration
├── .env                # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md           # Project documentation
```

## 🧩 Key Components

### Layout

The application uses a responsive layout system with:

- **Layout**: Base layout component with sidebar, header, and content area
- **Sidebar**: Navigation menu with links to different sections
- **DarkModeToggle**: Toggle for switching between light and dark themes

### Pages

- **Login/Register**: Authentication screens
- **Dashboard**: Main dashboard with transaction statistics
- **Transactions**: List of all transactions with filtering and sorting
- **SchoolTransactions**: Transactions filtered by school
- **TransactionDetail**: Detailed view of a single transaction
- **TransactionStatus**: Check status of a transaction by order ID
- **CreatePayment**: Form for creating new payments
- **Settings**: User settings and preferences

### Context

- **AuthContext**: Manages user authentication state
- **ThemeContext**: Manages theme (dark/light mode) preferences

## 🔒 Authentication

The application uses JWT-based authentication:

- **Login**: Authenticates users and stores JWT token
- **ProtectedRoute**: Higher-order component that restricts access to authenticated users
- **Role-based Access**: Different views and permissions based on user roles

## 🔄 API Integration

The frontend connects to the backend via RESTful API endpoints:

- **Authentication**: Login, register, verify token
- **Transactions**: CRUD operations for transactions
- **Schools**: School-specific data and operations
- **Analytics**: Dashboard statistics and summaries

API calls are centralized in the `services/api.ts` file, which provides methods for all required backend interactions.

## 🧪 Mock Data

For development and testing without a backend:

- Toggle mock data mode via environment variable or UI switch
- Generated mock transactions with realistic data
- Simulated API delays and responses

## 🌓 Dark Mode

The application supports both light and dark themes:

- User preference saved in local storage
- Automatic detection of system preference
- Toggle in the application UI
- TailwindCSS dark mode classes for consistent styling

## 📦 Deployment

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory, ready to be deployed to any static hosting service.

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Traditional Hosting**: Apache, Nginx
- **Container-based**: Docker with Nginx

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📱 Demo Account

For demonstration purposes, you can use the following credentials:

- **Email**: trustee4@kv.com
- **Password**: password

---

Developed with ❤️ by [Your Name/Team]
