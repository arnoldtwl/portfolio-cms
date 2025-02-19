# Portfolio CMS

A modern Content Management System built with Next.js for managing your professional portfolio. This application provides an intuitive interface to manage your work experience, education, skills, projects, and social profiles.

## Features

- **Dashboard Overview**: Real-time statistics and recent activities tracking
- **Work Experience Management**: Add and edit your professional experience
- **Education History**: Maintain your academic achievements
- **Skills Management**: Organize and showcase your technical and soft skills
- **Project Portfolio**: Display your projects with detailed descriptions
- **Profile Management**: Manage your social and professional profiles
- **Responsive Design**: Fully responsive interface that works on all devices
- **Secure**: Built with modern security practices

## Tech Stack

- **Frontend**: Next.js 15, React, CSS Modules
- **Backend**: Next.js API Routes, Vercel Postgres
- **Authentication**: NextAuth.js
- **Styling**: CSS Modules, Modern UI/UX principles
- **Database**: Vercel Postgres SQL
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Vercel account (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd portfolio-cms
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   POSTGRES_URL=your_postgres_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000/portfoliocm](http://localhost:3000/portfoliocm) to access the CMS

### Database Setup

1. Create required tables using the SQL migrations in the `migrations` folder
2. Run the migrations against your Vercel Postgres database

## Project Structure

```
portfolio-cms/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── portfoliocm/       # CMS pages
│   └── styles/            # Global styles
├── config/                # Configuration files
├── migrations/            # Database migrations
├── public/               # Static assets
└── package.json          # Project dependencies
```

## Features in Detail

### Dashboard
- Activity tracking
- Statistics overview
- Recent changes monitoring

### Content Management
- **Work Experience**
  - Add/Edit work history
  - Role descriptions
  - Date ranges

- **Education**
  - Academic qualifications
  - Certifications
  - Courses

- **Skills**
  - Technical skills
  - Soft skills
  - Proficiency levels

- **Projects**
  - Project details
  - Technologies used
  - Links and descriptions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
