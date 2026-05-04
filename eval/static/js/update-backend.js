// DELETE for a message
async function deleteMessage(messageId) {
    const url = `/api/messages/${messageId}`;
    const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        console.error("Error deleting message:", response.statusText);
    }
}
