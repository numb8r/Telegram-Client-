let ws = null;

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    ws = new WebSocket(`${protocol}${window.location.host}/ws`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        loadDialogs();
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        showError('Reconnecting...');
        setTimeout(initWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        showError('Connection error');
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message:', data);

            if (data.type === 'new_message') {
                if (data.chat_id === currentChatId) {
                    addMessage(data);
                }
                updateDialogLastMessage(data.chat_id, data.text, data.date);
            }
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    };
}