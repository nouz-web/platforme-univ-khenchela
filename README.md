# Absence Management Platform

A comprehensive platform for managing student attendance at Abbes Laghrour University Khenchela.

## Features

- QR code-based attendance tracking
- Student, teacher, administrator, and technical administrator roles
- Attendance justification system
- Course and module management
- Reporting and statistics
- Mobile-responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite (via Drizzle ORM)
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/absence-management-platform.git
cd absence-management-platform
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file based on `.env.local.example`:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Create the database directory:

\`\`\`bash
mkdir -p db/migrations
\`\`\`

5. Run database migrations and seed initial data:

\`\`\`bash
npm run db:migrate
\`\`\`

6. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

### Technical Administrator
- ID: 2020234049140
- Password: 010218821

### Teacher
- ID: T12345
- Password: password

### Student
- ID: S12345
- Password: password

### Administrator
- ID: A12345
- Password: password

## Deployment

### Build for Production

\`\`\`bash
npm run build
\`\`\`

### Start Production Server

\`\`\`bash
npm run start
\`\`\`

## Database Backup

To backup the SQLite database:

\`\`\`bash
cp ./db/absence_management.db ./db/absence_management.db.backup
\`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

## 9. Let's create a success sound for QR code scanning:
