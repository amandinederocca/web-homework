function createMessageElement(message) {
    const elt = document.createElement("li");
    elt.classList.add("note");
    elt.id = `note-${note.id}`;
    const html = `
    <div class="author_id">${message.author_id}
        <button class="delete-button" onclick="message_delete(this, ${message.author_id})">🗑</button>
    </div>
    <div class="room_id">${message.room_id}
        <button class="delete-button" onclick="message_delete(this, ${message.room_id})">🗑</button>
    </div>
    <div class="content">
        <span>${message.content}</span>
        <input type="checkbox" ${message.lu ? "checked" : ""}
        onchange="message_done_changed(this, ${message.id})" />
    </div>
`
    elt.innerHTML = html;
    document.querySelector("ul.messages").appendChild(elt);

}

function updateMessageElement(message) {
    const id = message.id;
    const elt = document.querySelector(`#message-${id}`);
    if (!elt) {
        console.warn("Message element not found for ID:", id);
        return;
    }
    elt.querySelector(".int").textContent = message.author_id;
    elt.querySelector(".int").textContent = message.room_id;
    elt.querySelector("span").textContent = message.content;
    elt.querySelector("input[type='checkbox']").checked = message.lu ? "checked" : "";

}

function deleteMessageElement(noteId) {
    const elt = document.querySelector(`#note-${noteId}`);
    if (elt) {
        elt.remove();
    } else {
        console.warn("Note element not found for ID:", noteId);
    }

}