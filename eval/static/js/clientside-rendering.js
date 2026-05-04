// Build / update / remove message DOM elements.

function createMessageElement(message) {
    const ctx = window.APP_CONTEXT;
    const isMine = message.author_id === ctx.currentUserId;
    const authorName = ctx.users[message.author_id] || `user#${message.author_id}`;

    const elt = document.createElement("li");
    elt.classList.add("message");
    if (isMine) elt.classList.add("mine");
    elt.id = `message-${message.id}`;

    elt.innerHTML = `
        <div class="msg-author">${escapeHtml(authorName)}</div>
        <div class="msg-content">${escapeHtml(message.content)}</div>
        ${isMine
            ? `<button class="delete-button"
                       onclick="deleteMessage(${message.id})"
                       title="Delete">🗑</button>`
            : ""}
    `;

    const list = document.querySelector("#messages-list");
    list.appendChild(elt);
    list.scrollTop = list.scrollHeight;
}

function updateMessageElement(message) {
    const elt = document.querySelector(`#message-${message.id}`);
    if (!elt) {
        console.warn("Message element not found for ID:", message.id);
        return;
    }
    const contentSpan = elt.querySelector(".msg-content");
    if (contentSpan) contentSpan.textContent = message.content;
}

function deleteMessageElement(messageId) {
    const elt = document.querySelector(`#message-${messageId}`);
    if (elt) {
        elt.remove();
    } else {
        console.warn("Message element not found for ID:", messageId);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}