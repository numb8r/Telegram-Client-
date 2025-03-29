import logging
from quart import Quart, render_template, request, jsonify, websocket
from telethon import TelegramClient, events
from telethon.tl.types import InputPeerChannel, InputPeerChat, InputPeerUser

API_ID = "YOUR_ID"
API_HASH = 'YOUR_API'
SESSION_NAME = 'tg_client'

logging.basicConfig(level=logging.INFO)
app = Quart(__name__)
client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

# WebSocket
active_connections = set()


async def send_to_ws(chat_id, message_data):
    for ws in active_connections:
        await ws.send_json({
            "type": "new_message",
            "chat_id": chat_id,
            **message_data
        })


@app.before_serving
async def startup():
    await client.start()
    logging.info("✅ Telegram client connected")

    @client.on(events.NewMessage)
    async def handler(event):
        try:
            if event.message:
                message_data = {
                    "text": event.message.text,
                    "date": event.message.date.isoformat(),
                    "out": event.message.out,
                    "sender_id": event.sender_id,
                    "chat_name": getattr(event.chat, 'title', ''),
                }
                await send_to_ws(event.chat_id, message_data)
        except Exception as e:
            logging.error(f"Error handling message: {e}")


@app.route('/')
async def index():
    return await render_template('index.html')


@app.route('/get_dialogs')
async def get_dialogs():
    try:
        dialogs = []
        async for dialog in client.iter_dialogs():
            dialogs.append({
                "id": dialog.id,
                "name": dialog.name,
                "is_group": dialog.is_group,
                "is_channel": dialog.is_channel,
                "is_user": dialog.is_user,
                "unread": dialog.unread_count,
                "last_message": dialog.message.text if dialog.message else None,
                "last_message_date": dialog.message.date.isoformat() if dialog.message else None
            })
        return jsonify(dialogs)
    except Exception as e:
        logging.error(f"Error getting dialogs: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/get_messages/<int:chat_id>')
async def get_messages(chat_id):
    try:
        messages = []
        async for msg in client.iter_messages(chat_id, limit=100):
            messages.append({
                "text": msg.text,
                "date": msg.date.isoformat(),
                "out": msg.out,
                "sender_id": msg.sender_id,
                "chat_id": chat_id
            })
        return jsonify(messages)
    except Exception as e:
        logging.error(f"Error getting messages: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/send', methods=['POST'])
async def send_message():
    try:
        data = await request.json
        chat_id = int(data['chat_id'])
        text = data['text']

        if str(chat_id).startswith('-100'):
            entity = InputPeerChannel(channel_id=int(str(chat_id)[4:]), access_hash=0)
        elif str(chat_id).startswith('-'):
            entity = InputPeerChat(chat_id=-chat_id)
        else:
            entity = InputPeerUser(user_id=chat_id, access_hash=0)

        await client.send_message(entity, text)
        return jsonify({"status": "success"})
    except Exception as e:
        logging.error(f"Send error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.websocket('/ws')
async def ws():
    active_connections.add(websocket)
    try:
        while True:
            await websocket.receive()
    finally:
        active_connections.remove(websocket)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)