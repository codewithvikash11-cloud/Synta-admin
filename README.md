# Synta Admin Panel

## Overview
A standalone, internal tool for managing the Synta platform's error database. It allows admins to review, edit, and publish AI-generated error solutions.

## Architecture
- **Location**: `synta-admin/` (Separate Next.js App)
- **Database**: Connects to the **same MongoDB** as the main app.
- **Auth**: Custom Admin-only authentication (Email/Password + JWT Cookie).
- **Security**: 
    - `robots.txt` blocks all crawlers.
    - Middleware protects all routes except `/login`.

## Key Features
1.  **Dashboard**: Overview of error stats (Pending, Published, Rejected).
2.  **Error Queue**: List of unpublished errors sorted by date.
3.  **Review Interface**:
    -   **Left**: Read-only view of the original raw error log.
    -   **Right**: Editable form for SEO Title, Explanation, Code, etc.
    -   **Actions**: Publish (Generates Slug), Reject, Save Draft.

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    cd synta-admin
    npm install
    ```

2.  **Environment Variables**
    Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
    Then update `.env.local` with:
    -   `MONGODB_URI`: Connection string (same as main app).
    -   `ADMIN_EMAIL`: Your admin email (e.g., `admin@synta.com`).
    -   `ADMIN_PASSWORD_HASH`: Create a bcrypt hash for your password.
    -   `JWT_SECRET`: A secure random string.

    > **Tip**: Generate a hash using an online tool or `node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"`.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The admin panel will be available at [http://localhost:3001](http://localhost:3001).

4.  **Deployment**
    Deploy as a **separate project** on Vercel.
    -   **Root Directory**: `synta-admin`
    -   **Env Vars**: Add the same variables from `.env.local`.
