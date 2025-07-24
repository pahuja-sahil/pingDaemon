# 📡 pingDaemon

A comprehensive website monitoring system that performs automated health checks and sends instant alerts when your websites go down. Built with FastAPI backend and React frontend.

![Status](https://img.shields.io/badge/status-production%20ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ What is pingDaemon?

pingDaemon is a **production-ready website monitoring solution** that continuously watches your websites and services, alerting you immediately when problems occur. Whether you're monitoring a personal blog or critical business applications, pingDaemon ensures you're the first to know when something goes wrong.

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
REDIS_URL=redis://redis:6379/0

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

# Setup database
python -m alembic upgrade head

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

You'll also need PostgreSQL, Redis, and Celery workers running. See the `docker-compose.yml` file for the complete setup.

## 📖 How to Use

### 1. Create Your Account
- Visit http://localhost:3000
- Click "Sign Up" and create an account with a Gmail address
- Verify your email (check spam folder if needed)

### 2. Add Your First Monitor
- Click "Add Monitor" on the dashboard
- Enter your website URL (e.g., `https://example.com`)
- Choose how often to check (5-60 minutes)
- Set failure threshold (how many failed checks before alerting)
- Save your monitor

### 3. Watch It Work
- Your dashboard will show the status of all monitors
- Green = healthy, Red = down, Yellow = degraded
- Click on any monitor to see detailed statistics and logs
- Check the Reports page for historical data and analytics

### 4. Get Alerts
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
                                │
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Task Queue)   │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Celery      │
                       │ (Health Checks) │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Reliable database for storing monitors and logs
- **Celery + Redis** - Background task processing for health checks
- **SQLAlchemy** - Database ORM with migrations
- **Resend** - Email delivery service for alerts

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

## 🚨 Troubleshooting

### Common Issues

**"Can't connect to database"**
- Ensure PostgreSQL is running (`docker-compose ps`)
- Check your `DATABASE_URL` in `.env`
- Try: `docker-compose restart postgres`

**"No emails being sent"**
- Verify your `RESEND_API_KEY` is correct
- Check the email queue in your dashboard
- Ensure Celery worker is running

**"Frontend won't load"**
- Check that both frontend and backend are running
- Verify ports 3000 and 8000 are not in use by other apps
- Try clearing browser cache

**"Health checks not running"**
- Ensure Celery beat scheduler is running
- Check Redis connection
- Verify monitors are enabled

### Getting Help

1. Check the container logs: `docker-compose logs -f [service-name]`
2. Verify all services are healthy: `docker-compose ps`
3. Check the API health endpoint: http://localhost:8000/health

## 🛡️ Security Notes

- Uses JWT tokens for authentication
- Passwords are securely hashed with bcrypt
- All API endpoints require authentication
- Environment variables for sensitive configuration
- CORS properly configured for frontend access

## 🌟 Why pingDaemon?

- **Simple Setup**: Get monitoring in minutes, not hours
- **No Vendor Lock-in**: Self-hosted solution you control
- **Cost Effective**: Monitor unlimited sites without per-site fees
- **Reliable**: Built with production-grade technologies
- **Extensible**: Open source and easy to customize

---

**Ready to start monitoring?** Run `docker-compose up -d` and visit http://localhost:3000 to get started! 🚀