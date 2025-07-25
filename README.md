# TASCO Frontend

TASCO (Task & Project Management System) là một ứng dụng web quản lý dự án và nhiệm vụ hiện đại được xây dựng với React, TypeScript và Redux Toolkit.

## 🚀 Tính năng chính

- **Quản lý dự án**: Tạo, chỉnh sửa và theo dõi các dự án
- **Quản lý nhiệm vụ**: Phân công, cập nhật trạng thái và theo dõi tiến độ
- **Hệ thống người dùng**: Xác thực, phân quyền và quản lý thành viên
- **Bình luận và tương tác**: Hệ thống bình luận thời gian thực cho các nhiệm vụ
- **Dashboard quản trị**: Giao diện quản lý toàn diện cho admin
- **Responsive design**: Tối ưu cho mọi thiết bị

## � Công nghệ sử dụng

### Core Technologies
- **React 19.1.0** - UI Library với latest features
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 6.3.5** - Fast build tool và dev server

### State Management & Data
- **Redux Toolkit 2.8.2** - State management với RTK Query
- **Axios 1.10.0** - HTTP client với interceptors

### UI & Styling
- **Material-UI 7.1.2** - React component library
- **Emotion 11.13.5** - CSS-in-JS styling
- **Custom theme** - Tasco brand colors (#494A7E primary)

### Development Tools
- **ESLint 9.18.0** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite TypeScript** - TypeScript integration

## � Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- Git

### Cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd TASCO-FE
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Tạo file environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Cập nhật các biến môi trường trong `.env.local`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_TITLE=TASCO
   ```

4. **Chạy development server**
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

   Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build cho production

```bash
npm run build
# hoặc
yarn build
```

### Preview production build

```bash
npm run preview
# hoặc
yarn preview
```

## 📁 Cấu trúc dự án

```
TASCO-FE/
├── public/                     # Static assets
│   ├── tasco-logo.png         # App logo variants
│   ├── tasco-logo.svg
│   ├── tasco-network-logo.svg
│   └── manifest.json          # PWA manifest
├── src/
│   ├── assets/                # Asset files
│   ├── axiosClient/           # HTTP client configuration
│   │   ├── axiosClient.ts     # Main axios instance
│   │   ├── setupClientInterceptors.ts
│   │   └── setupFormDataInterceptors.ts
│   ├── common/                # Shared types và utilities
│   │   ├── enums/             # TypeScript enums
│   │   ├── models/            # Data models
│   │   └── types/             # TypeScript type definitions
│   ├── components/            # Reusable components
│   │   ├── Loadable.tsx       # Code splitting component
│   │   ├── LoginBackground.tsx
│   │   ├── 3d/                # 3D components
│   │   └── nav-section/       # Navigation components
│   ├── constants/             # Application constants
│   │   ├── EngErrorMessageConstant.ts
│   │   ├── EngMessageConstant.ts
│   │   ├── VieErrorMessageConstant.ts
│   │   ├── VieMessageConstant.ts
│   │   ├── routesApiKeys.ts
│   │   └── storageKeys.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── index.ts
│   │   └── useResponsive.ts
│   ├── layout/                # Layout components
│   │   ├── components/        # Layout specific components
│   │   └── sidebar/           # Sidebar navigation
│   ├── pages/                 # Page components
│   │   ├── admin/             # Admin pages
│   │   ├── auth/              # Authentication pages
│   │   ├── error/             # Error pages
│   │   └── user/              # User pages
│   ├── redux/                 # Redux store và slices
│   │   ├── configStore.ts     # Store configuration
│   │   ├── adminDashboard/    # Admin dashboard state
│   │   ├── auth/              # Authentication state
│   │   ├── comments/          # Comments state management
│   │   ├── projectMembers/    # Project members state
│   │   ├── projects/          # Projects state
│   │   ├── taskMembers/       # Task members state
│   │   ├── taskObjectives/    # Task objectives state
│   │   ├── workAreas/         # Work areas state
│   │   └── workTasks/         # Work tasks state
│   ├── routes/                # Routing configuration
│   │   ├── adminRouter.tsx    # Admin routes
│   │   ├── userRouter.tsx     # User routes
│   │   ├── router.tsx         # Main router
│   │   ├── paths.ts           # Route paths constants
│   │   └── config/            # Route configurations
│   ├── sections/              # Page sections
│   │   ├── admin/             # Admin page sections
│   │   ├── auth/              # Auth page sections
│   │   └── user/              # User page sections
│   ├── theme/                 # Material-UI theme
│   │   ├── index.tsx          # Theme provider
│   │   ├── palette.ts         # Color palette
│   │   ├── typography.ts      # Typography settings
│   │   ├── shadows.ts         # Shadow definitions
│   │   ├── customShadows.ts
│   │   ├── cssStyles.ts
│   │   ├── globalStyles.tsx
│   │   └── overrides/         # Component overrides
│   └── utils/                 # Utility functions
│       ├── formatTime.ts      # Time formatting
│       ├── handleResponseMessage.ts
│       ├── path.ts            # Path utilities
│       ├── projectUtils.ts    # Project-specific utilities
│       ├── session.ts         # Session management
│       ├── userService.ts     # User service utilities
│       └── utils.ts           # General utilities
├── index.html                 # Main HTML template
├── package.json              # Dependencies và scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TS config
├── tsconfig.node.json        # Node-specific TS config
├── vite.config.ts            # Vite configuration
└── eslint.config.js          # ESLint configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_TITLE` | Application title | `TASCO` |

### TypeScript Configuration

Dự án sử dụng strict TypeScript configuration với:
- Strict type checking
- No implicit any
- Exact optional property types
- Unused locals/parameters checking

### Axios Configuration

HTTP client được cấu hình với:
- Request/response interceptors
- Automatic token attachment
- Response data unwrapping
- Error handling

## 🎯 Redux Store Structure

Store được tổ chức theo feature-based approach:

```typescript
RootState {
  auth: AuthState           // Authentication state
  projects: ProjectsState   // Projects management
  workTasks: TasksState     // Tasks management
  comments: CommentsState   // Comments system
  // ... other feature slices
}
```

### Key Features
- **RTK Query**: Efficient data fetching và caching
- **Async thunks**: Async action creators
- **Type-safe**: Full TypeScript support
- **DevTools**: Redux DevTools integration

## 🚀 Deployment

### Build Options

1. **Development build**
   ```bash
   npm run dev
   ```

2. **Production build**
   ```bash
   npm run build
   ```

3. **Preview production**
   ```bash
   npm run preview
   ```

### Production Considerations

- Environment variables setup
- API endpoint configuration
- Asset optimization
- Browser compatibility
- Performance monitoring

## 🔍 Code Quality

### Linting
```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
```

### Type Checking
```bash
npx tsc --noEmit    # Type check without compilation
```

## � API Integration

Backend API structure expected:
```typescript
{
  success: boolean;
  message: string;
  data: T;
}
```

Axios interceptors automatically unwrap `response.data` for cleaner code.

## 🎨 Theming

Material-UI theme với Tasco branding:
- **Primary color**: #494A7E
- **Custom components**: Buttons, inputs, navigation
- **Responsive breakpoints**: Mobile-first approach
- **Dark/light mode**: Theme switching capability

## 📱 PWA Support

Application cấu hình như Progressive Web App:
- Manifest file với Tasco branding
- Service worker ready
- Offline capability
- App installation support

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create Pull Request

### Code Style Guidelines

- Follow TypeScript best practices
- Use meaningful component/function names
- Add JSDoc comments for complex functions
- Keep components focused and reusable
- Follow Material-UI patterns

## 📞 Support

Để được hỗ trợ, vui lòng:
1. Check existing issues
2. Create detailed bug report
3. Include reproduction steps
4. Provide environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**TASCO Team** - Building better project management solutions
