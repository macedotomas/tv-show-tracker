# My Approach to Building the TV Show Tracker App






I built this full-stack web application using a the PERN stack with separation of in the project between frontend and backend. My main goal was to create an application that follows tries to follow industry best practices even tough I never built from the ground a full-stack application.

For the backend, I chose Node.js with Express to build a RESTful API, implementing a clean MVC architecture with separate controllers, routes, middleware, and services. I used PostgreSQL for reliable data persistence and implemented JWT-based authentication to ensure secure user sessions. To enhance performance, I integrated caching mechanisms and added comprehensive middleware for security including helmet and CORS protection.

On the frontend, I used React 19 with Vite for fast development. I chose TailwindCSS combined with DaisyUI to create a modern, responsive user interface while keeping the styling consistent and maintainable even tough styling was not my main concern. For state management, I used Zustand.

I used Docker to ensure consistent deployment across different environments and make the setup process seamless for other developers. The project structure follows a modular approach with defined folders for components, pages, controllers, and utilities, making the codebase easy to navigate and understand.

Throughout the development process, I focused on implementing comprehensive features including user authentication, CRUD operations for TV shows, episode tracking, actor management, and a personalized favorites system, all while trying to maintain clean code and following RESTful API principles.

I also used PgAdmin 4 and Postman to manage the database and test API endpoints respectively. That enabled me to easily test and debug my database and endpoints.