# Django Server Startup Options

This project now includes multiple ways to start the Django development server with automatic port detection.

## 🚀 Quick Start Options

### Option 1: Auto-Port Script (Recommended)
```bash
cd backend
python3 start_server.py
```
- Automatically finds an available port starting from 8000
- Shows clear status messages
- Handles port conflicts gracefully

### Option 1b: Quiet Auto-Port Script (No Warnings)
```bash
cd backend
python3 start_quiet.py
```
- Same as above but suppresses deprecation warnings
- Clean output without pkg_resources warnings

### Option 2: Custom Management Command
```bash
cd backend
python3 manage.py runserver_auto
```
- Django management command that finds available ports
- Can specify starting port: `python3 manage.py runserver_auto --port 8000`
- Can specify max attempts: `python3 manage.py runserver_auto --max-attempts 10`

### Option 3: Traditional Django Command
```bash
cd backend
python3 manage.py runserver
```
- Standard Django command
- Will fail if port 8000 is in use

## 🔧 Features

### Auto-Port Detection
- Starts from port 8000 and tries subsequent ports (8001, 8002, etc.)
- Maximum 10 attempts by default
- Clear error messages if no ports are available

### Status Messages
- ✅ Shows which port is being used
- ⚠️ Warns when falling back to a different port
- ❌ Clear error messages for failures

### Deprecation Warning Fix
- Pinned `setuptools<81` to suppress pkg_resources deprecation warnings
- Maintains compatibility with djangorestframework-simplejwt

## 🛠️ Troubleshooting

### Port Already in Use
If you see "Error: That port is already in use":
1. Use the auto-port script: `python3 start_server.py`
2. Or kill existing processes: `lsof -ti:8000 | xargs kill -9`

### Deprecation Warnings
The pkg_resources deprecation warnings are now suppressed by pinning setuptools to version <81.

## 📝 Usage Examples

```bash
# Start with auto-port detection
cd backend
python3 start_server.py

# Start with custom port range
python3 manage.py runserver_auto --port 9000 --max-attempts 5

# Traditional Django server (may fail if port busy)
python3 manage.py runserver
```

## 🎯 Benefits

1. **No more port conflicts** - Automatically finds available ports
2. **Clear feedback** - Shows exactly which port is being used
3. **Backward compatible** - Traditional commands still work
4. **Clean output** - No more deprecation warnings
5. **Easy to use** - Simple commands for different scenarios 