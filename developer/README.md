# GPC Itarsi Developer Portal

This is the developer portal for Government Polytechnic College Itarsi. It's a separate application from the main frontend to provide a dedicated environment for developers.

## Getting Started

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

The developer portal will be available at http://localhost:5175.

## Features

- Developer profile management
- Website customization (coming soon)
- Theme editor (coming soon)

## Dependencies

This application shares some dependencies with the main frontend application:
- Context (AuthContext)
- Utilities (imageUtils, touchUtils)
- Components (LoadingSpinner)
- Assets (college-logo.png)
- Styles (index.css)

## Deployment

To build the application for production:
```
npm run build
```

The build files will be generated in the `dist` directory.
