# Telegram-Client-

## 📝 Project Description

**Telegram Web Client** is a web application for interacting with Telegram, providing a convenient browser-based interface for messaging. The project uses the official Telegram API via the Telethon library and offers the following features:

### 🌟 Key Features
- View list of all chats (private, groups, channels, supergroups)
- Read message history in selected chats
- Send new messages
- Unread message indicators
- Chat search functionality
- Real-time message updates via WebSocket

### 🛠 Technologies
- **Backend**: Python 3.7+ (Quart, Telethon)
- **Frontend**: HTML5, CSS3, JavaScript (WebSocket API)
- **API**: Official Telegram API

### ⚙️ Implementation Details
- Asynchronous server operation (Quart)
- Support for all Telegram chat types
- Session persistence for re-login
- Responsive interface with animations
- XSS protection (HTML escaping in messages)

## 🚀 Installation and Setup

### Prerequisites
- Python 3.7+
- Telegram account with API ID and Hash (get at [my.telegram.org](https://my.telegram.org))

### 1. Install Dependencies
```bash
pip install quart telethon
```

### 2. Configuration
Replace in `app.py`:
```python
API_ID = "YOUR_ID"  # Your API ID
API_HASH = 'YOUR_API'  # Your API Hash
```

### 3. Run Application
```bash
python app.py
```

The application will be available at: [http://127.0.0.1:5001](http://127.0.0.1:5001)

## 📌 Important Notes
1. First launch requires authorization via QR code
2. Session is saved in `tg_client.session` file
3. For production use, it's recommended to:
   - Use HTTPS
   - Configure proxies for bypassing restrictions
   - Restrict interface access

## 📜 License
Project is distributed under MIT license. See LICENSE file for details.

---

### 🔗 Useful Links
- [Telethon Documentation](https://docs.telethon.dev/)
- [Quart Framework](https://pgjones.gitlab.io/quart/)
- [Telegram API](https://core.telegram.org/api)

---

💡 **Tip**: For extended functionality consider adding:
- Media file support
- Browser notifications
- Dark theme
- Multi-language support
