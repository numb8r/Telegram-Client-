let dialogsCache = [];

async function loadDialogs() {
    try {
        document.getElementById('dialogs').innerHTML = '<div class="loading">Downloads chats...</div>';

        const response = await fetch('/get_dialogs');
        if (!response.ok) throw new Error('Network response was not ok');

        const dialogs = await response.json();
        dialogsCache = dialogs;
        renderDialogs(dialogs);

        if (dialogs.length > 0 && !currentChatId) {
            selectChat(dialogs[0].id, dialogs[0].name);
        }
    } catch (error) {
        console.error('Error loading dialogs:', error);
        showError('Failed to load dialogs');
        document.getElementById('dialogs').innerHTML = '<div class="loading" style="color: #f23d3d;">Error loading dialogs</div>';
    }
}

function renderDialogs(dialogs) {
    const container = document.getElementById('dialogs');
    if (!container) return;

    container.innerHTML = '';

    if (dialogs.length === 0) {
        container.innerHTML = '<div class="loading">No dialogue</div>';
        return;
    }

    dialogs.forEach(dialog => {
        const dialogEl = document.createElement('div');
        dialogEl.className = `dialog ${dialog.id === currentChatId ? 'active' : ''}`;
        dialogEl.dataset.chatId = dialog.id;

        let typeBadge = '';
        if (dialog.is_group) typeBadge = '<span class="chat-type-badge">Group</span>';
        else if (dialog.is_channel) typeBadge = '<span class="chat-type-badge">Channel</span>';
        else if (dialog.is_user) typeBadge = '<span class="chat-type-badge">Chat</span>';

        const firstLetter = dialog.name ? dialog.name.charAt(0).toUpperCase() : '?';

        dialogEl.innerHTML = `
            <div class="dialog-avatar">${firstLetter}</div>
            <div class="dialog-info">
                <div class="dialog-header">
                    <div class="dialog-name">${escapeHtml(dialog.name)} ${typeBadge}</div>
                    <div class="dialog-time">${formatTime(dialog.last_message_date)}</div>
                </div>
                <div class="dialog-preview">${dialog.last_message ? escapeHtml(dialog.last_message.substring(0, 30)) : ''}</div>
            </div>
            ${dialog.unread > 0 ? `<div class="dialog-unread">${dialog.unread}</div>` : ''}
        `;

        dialogEl.addEventListener('click', () => selectChat(dialog.id, dialog.name));
        container.appendChild(dialogEl);
    });
}

function updateDialogLastMessage(chatId, text, date) {
    const dialog = document.querySelector(`.dialog[data-chat-id="${chatId}"]`);
    if (dialog) {
        const preview = dialog.querySelector('.dialog-preview');
        const time = dialog.querySelector('.dialog-time');
        if (preview) preview.textContent = text ? escapeHtml(text.substring(0, 30)) : '';
        if (time) time.textContent = formatTime(date);
    }
}