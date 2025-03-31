let currentChatId = null;
let currentChatName = '';

document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();

    // Message Send Handlers
    document.getElementById('send-button')?.addEventListener('click', sendMessage);
    document.getElementById('message-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Automatically increase textarea height
    document.getElementById('message-input')?.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Search by dialogues
    document.getElementById('search-input')?.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (!searchTerm) {
            renderDialogs(dialogsCache);
            return;
        }

        const filteredDialogs = dialogsCache.filter(dialog =>
            dialog.name.toLowerCase().includes(searchTerm) ||
            (dialog.last_message && dialog.last_message.toLowerCase().includes(searchTerm))
        );

        renderDialogs(filteredDialogs);
    });
});