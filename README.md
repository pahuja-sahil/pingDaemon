# 📡 pingDaemon

A comprehensive URL monitoring system that performs periodic health checks on configured URLs and triggers alerts on failures. Built with FastAPI backend and React frontend.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

- **URL Monitoring**: Add, edit, and manage URLs with customizable check intervals
- **Health Checks**: Periodic monitoring with response time tracking and status logging
- **Alert System**: Email notifications for downtime, slow responses, and recovery
- **Analytics Dashboard**: Uptime statistics, performance metrics, and historical data
- **Real-time Status**: Live monitoring with visual status indicators
- **REST API**: Complete API for integration and automation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   FastAPI       │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Port 3000     │    │   Port 8000     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Task Queue)   │
                       │   Port 6379     │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Celery      │
                       │ (Background     │
                       │  Health Checks) │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM and database migrations
- **Alembic** - Database version control
- **Celery** - Background task processing
- **Redis** - Task queue and caching
- **Pydantic** - Data validation and serialization

### Frontend
- **React 18** - User interface framework
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis 6+

### 1. Clone Repository

```bash
git clone <repository-url>
cd pingDaemon
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your database credentials

# Setup database
python manage_db.py setup

# Start backend server
python run.py
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### 4. Access Application

- **Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 📊 Backend (FastAPI)

### Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── url_monitor.py   # URL monitoring table
│   │   ├── health_log.py    # Health check results
│   │   └── alert.py         # Alert notifications
│   ├── schemas/             # Pydantic schemas
│   │   ├── url_monitor.py   # URL validation schemas
│   │   ├── health_log.py    # Health log schemas
│   │   └── alert.py         # Alert schemas
│   ├── services/            # Business logic
│   │   ├── url_service.py   # URL management
│   │   ├── health_service.py # Health check data
│   │   └── alert_service.py # Alert management
│   └── routes/              # API endpoints
│       ├── urls.py          # URL monitoring API
│       ├── health_logs.py   # Health logs API
│       └── alerts.py        # Alerts API
├── alembic/                 # Database migrations
├── manage_db.py             # Database management CLI
├── run.py                   # Development server
└── requirements.txt         # Python dependencies
```

### Environment Configuration

Create `.env` file in backend directory:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pingdaemon

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# Application
SECRET_KEY=your-secure-secret-key
DEBUG=True
```

### Database Management

```bash
# First time setup
python manage_db.py setup

# Create migration when models change
python manage_db.py create "Description of changes"

# Apply pending migrations
python manage_db.py migrate

# Check current database version
python manage_db.py current

# View migration history
python manage_db.py history

# Rollback to previous version
python manage_db.py downgrade

# Reset database (WARNING: deletes all data)
python manage_db.py reset
```

### API Endpoints

#### URL Monitoring
- `POST /api/urls` - Create URL monitor
- `GET /api/urls` - List URL monitors (with pagination and search)
- `GET /api/urls/{id}` - Get specific URL monitor
- `PUT /api/urls/{id}` - Update URL monitor
- `DELETE /api/urls/{id}` - Delete URL monitor
- `GET /api/urls/{id}/stats` - Get uptime and performance statistics
- `POST /api/urls/{id}/toggle` - Enable/disable monitoring

#### Health Logs
- `GET /api/health-logs` - List health check logs (with filtering)
- `GET /api/health-logs/monitor/{id}` - Get logs for specific monitor
- `GET /api/health-logs/monitor/{id}/stats` - Get health statistics
- `GET /api/health-logs/monitor/{id}/chart` - Get chart data for visualization
- `GET /api/health-logs/monitor/{id}/latest` - Get most recent check result

#### Alerts
- `GET /api/alerts` - List alert notifications (with filtering)
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/{id}` - Update alert status
- `POST /api/alerts/{id}/mark-sent` - Mark alert as sent
- `GET /api/alerts/pending` - Get alerts pending delivery
- `POST /api/alerts/monitor/{id}/resolve` - Resolve all alerts for a monitor

### Development Commands

```bash
# Run development server with auto-reload
python run.py

# Run specific components
uvicorn app.main:app --reload
celery -A app.celery_worker worker --loglevel=info
```

## 🎨 Frontend (React)

### Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
└── postcss.config.js       # PostCSS configuration
```

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Frontend Features (Coming Soon)

- **Dashboard**: Overview of all monitored URLs with status indicators
- **URL Management**: Add, edit, delete, and configure URL monitors
- **Analytics**: Charts showing uptime, response times, and historical data
- **Alerts**: View and manage alert notifications
- **Real-time Updates**: Live status updates using WebSocket/polling
- **Responsive Design**: Mobile-friendly interface

## 🔄 Development Workflow

### Making Model Changes

1. **Modify Models**: Update files in `backend/app/models/`
2. **Create Migration**: 
   ```bash
   cd backend
   python manage_db.py create "Description of your changes"
   ```
3. **Review Migration**: Check generated file in `backend/alembic/versions/`
4. **Apply Migration**: 
   ```bash
   python manage_db.py migrate
   ```
5. **Update Schemas**: Modify corresponding Pydantic schemas if needed
6. **Update Services**: Update business logic in services layer
7. **Test API**: Use `/docs` endpoint to test changes

### Adding New Features

1. **Backend First**: Models → Schemas → Services → Routes
2. **Test API**: Use FastAPI docs at `/docs`
3. **Frontend**: Components → Pages → Integration
4. **End-to-end Testing**: Test complete user workflows

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Setup**:
   ```bash
   DEBUG=False
   SECRET_KEY=strong-production-secret
   DATABASE_URL=production-database-url
   ```

2. **Database Setup**:
   ```bash
   python manage_db.py setup
   ```

3. **Run with Production Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

4. **Background Tasks**:
   ```bash
   celery -A app.celery_worker worker --loglevel=info
   celery -A app.celery_worker beat --loglevel=info
   ```

### Frontend Deployment

1. **Build Production Assets**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve Static Files**: Use nginx, Apache, or CDN

3. **Environment Configuration**: Update API base URL for production

## 🐛 Troubleshooting

### Database Issues
- **Connection Failed**: Check PostgreSQL is running and DATABASE_URL is correct
- **Migration Errors**: Run `python manage_db.py current` to check status
- **Reset Database**: Use `python manage_db.py reset` (WARNING: deletes all data)

### Backend Issues
- **Import Errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`
- **Port Conflicts**: Check if port 8000 is already in use
- **Redis Connection**: Verify Redis is running on port 6379

### Frontend Issues
- **Build Failures**: Delete `node_modules` and run `npm install` again
- **API Connection**: Check backend is running on port 8000
- **Styling Issues**: Ensure TailwindCSS is compiled correctly

## 📋 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Authentication
*Authentication system will be implemented in future phases*

### Rate Limiting
*Rate limiting will be implemented in future phases*

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest  # (when test suite is implemented)
```

### Frontend Testing
```bash
cd frontend
npm test  # (when test suite is implemented)
```

### API Testing
Use the interactive documentation at `/docs` to test all endpoints.

## 📈 Monitoring and Observability

### Health Checks
- **API Health**: `GET /health`
- **Database Status**: Included in health check response
- **Metrics**: Response time headers (`X-Process-Time`)

### Logging
- **Backend**: Structured logging with configurable levels
- **Database**: Query logging in debug mode
- **Celery**: Task execution logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the established patterns
4. Run tests and ensure they pass
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Roadmap

### Phase 3: Background Processing
- [ ] Celery worker setup for health checks
- [ ] Periodic URL monitoring tasks
- [ ] Health check result processing

### Phase 4: Alert System
- [ ] Email notification system
- [ ] Alert cooldown and rate limiting
- [ ] Notification templates

### Phase 5: Frontend Development
- [ ] Dashboard with real-time status
- [ ] URL management interface
- [ ] Analytics and charts
- [ ] Alert management UI

### Phase 6: Advanced Features
- [ ] User authentication and authorization
- [ ] Multi-tenant support
- [ ] Advanced alert rules
- [ ] Webhook notifications
- [ ] API rate limiting

### Phase 7: Production Features
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Backup and disaster recovery

### Phase 8: Enterprise Features
- [ ] LDAP/SSO integration
- [ ] Advanced analytics
- [ ] Custom dashboards
- [ ] API quotas and billing

## 📞 Support

- **Documentation**: Check this README and API docs at `/docs`
- **Issues**: Create an issue on GitHub for bug reports
- **Discussions**: Use GitHub Discussions for questions and ideas

---

**Built with ❤️ for reliable web monitoring**