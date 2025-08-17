# 📡 pingDaemon

A comprehensive website monitoring system that performs automated health checks and sends instant alerts when your websites go down. Built with FastAPI backend and React frontend.

## ✨ What is pingDaemon?

pingDaemon is a **website monitoring solution** that continuously watches your websites and services, alerting you immediately when problems occur. Whether you're monitoring a personal blog or critical business applications, pingDaemon ensures you're the first to know when something goes wrong.

### Key Features

- **🔄 Automated Monitoring** - Continuous health checks every 5-60 minutes
- **📧 Instant Email Alerts** - Get notified the moment your site goes down or recovers
- **📊 Real-time Dashboard** - Beautiful interface showing all your monitors at a glance
- **📈 Performance Analytics** - Track uptime, response times, and historical data
- **🌙 Dark/Light Theme** - Modern UI that adapts to your preference
- **📱 Mobile Responsive** - Monitor your sites from any device
- **🔐 Secure Authentication** - User accounts with Gmail validation and password recovery

## 🚀 Quick Start with Docker

The easiest way to get pingDaemon running is with Docker Compose:

### Prerequisites
- Docker and Docker Compose installed
- A Gmail account for sending alert emails

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd pingDaemon

# Create environment file
cp .env.example .env
# Edit .env with your configuration (see below)
```

### 2. Configure Environment

Edit the `.env` file with your settings:

```bash
# Database Configuration
POSTGRES_DB=pingdaemon
POSTGRES_USER=pingdaemon_user
POSTGRES_PASSWORD=your_secure_password

# Application URLs
DATABASE_URL=postgresql://pingdaemon_user:your_secure_password@postgres:5432/pingdaemon

# Security
SECRET_KEY=your-very-secure-secret-key-change-this
DEBUG=false

# Email Configuration (for alerts)
RESEND_API_KEY=your-resend-api-key
```

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### 4. Access Your Application

- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs

That's it! 🎉 Your pingDaemon instance is now running and ready to monitor your websites.

## 🖥️ Development Setup

If you prefer to run the components separately for development:

### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### Background Services

You'll also need PostgreSQL and Celery workers running. See the `docker-compose.yml` file for the complete setup.

## 📖 How to Use

### 1. Create Your Account
- Visit http://localhost:3000
- Click "Sign Up" and create an account with a Gmail address

### 2. Add Your First Monitor
- Click "Add Monitor" on the dashboard
- Enter your website URL (e.g., `https://example.com`)
- Choose how often to check (5-60 minutes)
- Set failure threshold (how many failed checks before alerting)
- Save your monitor

### 3. Watch It Work
- Your dashboard will show the status of all monitors
- Green = healthy, Red = down
- Click on any monitor to see detailed statistics and logs

### 4. View Reports & Analytics
- Navigate to the Reports page to see comprehensive analytics
- View uptime history charts and response time trends
- Track incidents and performance patterns over time
- Analyze data by day, week, or custom date ranges
- Export data for further analysis or reporting

### 5. Get Alerts
- You'll receive email alerts when sites go down or recover
- Alerts include the monitor name, status change, and response details
- No spam - you only get notified when status actually changes

## 🏗️ Architecture

pingDaemon uses a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │◄──►│   FastAPI       │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        ▲
                                │                        │
                                ▼                        │
                       ┌─────────────────┐               │
                       │     Celery      │◄──────────────┘
                       │ (Health Checks) │  PostgreSQL as
                       │  + Beat Scheduler│  Broker & Backend
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Reliable database for storing monitors and logs, also serves as Celery broker
- **Celery** - Background task processing for health checks and scheduled monitoring
- **SQLAlchemy** - Database ORM with migrations
- **Resend** - Email delivery service for alerts
- **Google OAuth** - Secure authentication integration

### Frontend
- **React 18 + TypeScript** - Modern UI framework with type safety
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Beautiful charts and analytics
- **Framer Motion** - Smooth animations

## 🔧 Configuration Options

### Monitor Settings
- **Check Interval**: 5, 10, 15, 30, or 60 minutes
- **Timeout**: Maximum time to wait for response (default: 10 seconds)
- **Failure Threshold**: Number of consecutive failures before alerting (1-10)
- **Expected Status**: HTTP status codes that indicate success (default: 200-299)

### Email Alerts
- Sent when a monitor goes from healthy → unhealthy
- Sent when a monitor recovers from unhealthy → healthy
- Include monitor details, error information, and response times
- Automatically retry failed email deliveries

## 📊 What You Get

### Dashboard
- Real-time status overview of all monitors
- Quick stats: total monitors, healthy/unhealthy counts, average uptime
- Recent activity feed showing status changes
- Quick action buttons to add monitors or run immediate checks

### Detailed Monitoring
- Response time tracking with historical charts
- Uptime percentage calculations
- Detailed error logs with timestamps
- Status change history

### Analytics & Reports
- Uptime trends over time
- Response time analysis
- Incident tracking and patterns
- Exportable data for further analysis

---

**Ready to start monitoring?** Run `docker-compose up -d` and visit http://localhost:3000 to get started! 🚀