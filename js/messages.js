async function selectChat(chatId, chatName) {
    try {
        currentChatId = chatId;
        currentChatName = chatName;

        document.querySelectorAll('.dialog').forEach(d => {
            d.classList.toggle('active', d.dataset.chatId == chatId);
            if (d.dataset.chatId == chatId) {
                d.querySelector('.dialog-unread')?.remove();
            }
        });

        document.getElementById('chat-header').textContent = chatName;
        document.getElementById('messages').innerHTML = '<div class="loading">Loading messages...</div>';
        document.getElementById('compose').style.display = 'flex';

        await loadMessages(chatId);
    } catch (error) {
        console.error('Error selecting chat:', error);
        showError('Failed to load chat');
    }
}

async function loadMessages(chatId) {
    try {
        const response = await fetch(`/get_messages/${chatId}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages');
        document.getElementById('messages').innerHTML = '<div class="loading" style="color: #f23d3d;">Loading error</div>';
    }
}

function renderMessages(messages) {
    const container = document.getElementById('messages');
    if (!container) return;

    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<div class="loading">No messages</div>';
        return;
    }

    messages.sort((a, b) => new Date(a.date) - new Date(b.date));

    messages.forEach(msg => {
        addMessage(msg);
    });

    container.scrollTop = container.scrollHeight;
}

function addMessage(msg) {
    const container = document.getElementById('messages');
    if (!container || !msg) return;

    const msgEl = document.createElement('div');
    msgEl.className = `message ${msg.out ? 'message-out' : 'message-in'}`;

    msgEl.innerHTML = `
        <div class="message-text">${msg.text ? escapeHtml(msg.text) : '<i>Media Message</i>'}</div>
        <div class="message-time">${formatTime(msg.date)}</div>
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input || !currentChatId) return;

    const text = input.value.trim();
    if (!text) return;

    try {
        input.disabled = true;
        document.getElementById('send-button').disabled = true;

        const response = await fetch('/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: currentChatId,
                text: text
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();

        if (result.status === 'success') {
            input.value = '';
            input.style.height = 'auto';

            addMessage({
                text: text,
                date: new Date().toISOString(),
                out: true,
                sender_id: currentChatId,
                chat_id: currentChatId
            });
        } else {
            throw new Error(result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message');
    } finally {
        input.disabled = false;
        document.getElementById('send-button').disabled = false;
        input.focus();
    }
}