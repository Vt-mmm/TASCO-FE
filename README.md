# TASCO Frontend

## 📋 Mô tả dự án

TASCO (Task Space Collaboration) là một ứng dụng quản lý dự án và nhiệm vụ hiện đại, được xây dựng với React và TypeScript. Ứng dụng cung cấp giao diện người dùng trực quan để quản lý dự án, phân công nhiệm vụ, theo dõi tiến độ và cộng tác nhóm hiệu quả.

## 🚀 Tính năng chính

- **Quản lý dự án**: Tạo, chỉnh sửa và theo dõi dự án
- **Quản lý nhiệm vụ**: Phân công, cập nhật trạng thái và theo dõi deadline
- **Cộng tác nhóm**: Thêm thành viên, phân quyền và giao tiếp
- **Dashboard**: Tổng quan về tiến độ và hiệu suất
- **Hệ thống bình luận**: Thảo luận và trao đổi trong từng nhiệm vụ
- **Xác thực người dùng**: Đăng nhập/đăng ký với JWT và Google OAuth
- **Giao diện tương tác**: Drag & drop, animations với Framer Motion
- **Responsive design**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

### Core Technologies

- **React 19.1.0** - Thư viện UI component
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 6.3.5** - Build tool và dev server nhanh

### UI/UX Libraries

- **Material-UI (MUI) 7.1.2** - Component library và design system
- **Material-UI Icons** - Icon collection
- **Framer Motion 12.19.1** - Animation library
- **React Helmet Async** - Document head management

### State Management & Data Fetching

- **Redux Toolkit 2.8.2** - State management
- **React Redux 9.2.0** - React bindings cho Redux
- **Axios 1.10.0** - HTTP client

### Form & Validation

- **React Hook Form 7.58.1** - Form management
- **Yup 1.6.1** - Schema validation
- **@hookform/resolvers** - Validation resolvers

### Routing & Navigation

- **React Router DOM 7.6.2** - Client-side routing

### Utilities

- **Date-fns 4.1.0** & **Day.js 1.11.13** - Date manipulation
- **js-cookie 3.0.5** - Cookie management
- **react-toastify 11.0.5** - Toast notifications
- **ts-md5 1.3.1** - MD5 hashing

### Development Tools

- **ESLint 9.25.0** - Code linting
- **TypeScript ESLint 8.30.1** - TypeScript linting rules

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 hoặc **yarn**: >= 1.22.0
- **Git**: Latest version

## 🔧 Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone [repository-url]
cd TASCO-FE
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Thiết lập environment variables

Tạo file `.env` trong thư mục gốc:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_VERSION=v1

# Authentication
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_JWT_SECRET=your_jwt_secret

# Application
VITE_APP_NAME=TASCO
VITE_APP_VERSION=1.0.0

# Development
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

### 4. Chạy ứng dụng

```bash
# Development mode
npm run dev
# hoặc
yarn dev

# Build cho production
npm run build
# hoặc
yarn build

# Preview production build
npm run preview
# hoặc
yarn preview
```

## 📁 Cấu trúc thư mục

```
TASCO-FE/
├── public/                    # Static assets
│   └── vite.svg
├── src/
│   ├── assets/               # Images, icons, fonts
│   ├── axiosClient/          # API configuration
│   │   ├── axiosClient.ts
│   │   ├── setupClientInterceptors.ts
│   │   └── setupFormDataInterceptors.ts
│   ├── common/               # Shared utilities
│   │   ├── enums/           # Enum definitions
│   │   ├── models/          # TypeScript interfaces/types
│   │   └── types/           # Type definitions
│   ├── components/           # Reusable UI components
│   │   ├── 3d/              # 3D components
│   │   └── LoginBackground.tsx
│   ├── constants/            # Application constants
│   ├── hooks/               # Custom React hooks
│   ├── layout/              # Layout components
│   │   ├── components/
│   │   │   ├── footer/
│   │   │   └── header/
│   │   └── sidebar/
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   ├── auth/            # Authentication pages
│   │   ├── error/           # Error pages
│   │   └── user/            # User pages
│   ├── redux/               # Redux store & slices
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── projectMembers/
│   │   ├── projects/
│   │   ├── workAreas/
│   │   ├── workTasks/
│   │   └── configStore.ts
│   ├── routes/              # Routing configuration
│   │   ├── config/
│   │   ├── paths.ts
│   │   └── router.tsx
│   ├── sections/            # Page sections/features
│   │   ├── auth/
│   │   └── user/
│   ├── theme/               # MUI theme configuration
│   ├── utils/               # Utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Scripts khả dụng

```bash
# Phát triển
npm run dev          # Chạy development server (http://localhost:5173)

# Build
npm run build        # Build cho production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Chạy ESLint
npm run lint:fix     # Fix ESLint errors tự động

# Type Checking
npm run type-check   # Kiểm tra TypeScript types
```

## 🔐 Xác thực và Phân quyền

Ứng dụng sử dụng JWT (JSON Web Tokens) cho xác thực:

- **Login/Register**: Email/password hoặc Google OAuth
- **Token Storage**: Cookies với httpOnly
- **Route Protection**: Private routes cho authenticated users
- **Auto Refresh**: Tự động refresh token khi hết hạn

## 🎨 Hệ thống Theme

Sử dụng Material-UI theme system với:

- **Custom Colors**: Primary, secondary, error, warning, info, success
- **Typography**: Custom fonts và sizes
- **Breakpoints**: Responsive design breakpoints
- **Component Overrides**: Custom styling cho MUI components
- **Dark/Light Mode**: Theme switching (có thể mở rộng)

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**:
  - xs: 0px
  - sm: 600px
  - md: 900px
  - lg: 1200px
  - xl: 1536px

## 🔄 State Management

Sử dụng Redux Toolkit với:

- **Slices**: auth, projects, tasks, comments, members
- **Async Thunks**: API calls với error handling
- **TypeScript**: Fully typed store và actions
- **DevTools**: Redux DevTools integration

## 🌐 API Integration

```typescript
// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios interceptors cho:
// - Request: Add authorization headers
// - Response: Handle errors, token refresh
// - FormData: Handle file uploads
```

## 📊 Performance

- **Code Splitting**: Lazy loading components
- **Bundle Optimization**: Vite optimizations
- **Image Optimization**: WebP format support
- **Caching**: HTTP caching strategies

## 🧪 Testing (Dự định mở rộng)

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Build cho Production

```bash
npm run build
```

### Environment Variables cho Production

```env
VITE_API_BASE_URL=https://api.tasco.com
VITE_GOOGLE_CLIENT_ID=production_google_client_id
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

### Coding Standards

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Follow configured rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Component Structure**: Functional components với hooks

## 🐛 Troubleshooting

### Common Issues

1. **Node version conflicts**

   ```bash
   nvm use 18
   npm install
   ```

2. **Port already in use**

   ```bash
   # Change port in vite.config.ts hoặc kill process
   lsof -ti:5173 | xargs kill -9
   ```

3. **Build errors**
   ```bash
   # Clear cache và reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Hỗ trợ

- **Issues**: [GitHub Issues](repository-issues-url)
- **Documentation**: [Wiki](repository-wiki-url)
- **Email**: support@tasco.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Phiên bản**: 1.0.0  
**Cập nhật cuối**: [Current Date]  
**Maintainers**: TASCO Development Team
