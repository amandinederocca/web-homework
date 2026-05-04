// subscribe / unsubscribe to a room from the rooms page buttons.
async function toggleSubscription(userId, roomId, currentlySubscribed, btn) {
    const url = "/api/subscriptions";

    if (currentlySubscribed) {
        const response = await fetch(`${url}?user_id=${userId}&room_id=${roomId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            console.error("Unsubscribe failed:", response.statusText);
            return;
        }
        btn.textContent = "Subscribe";
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
        btn.setAttribute("onclick",
            `toggleSubscription(${userId}, ${roomId}, false, this)`);
    } else {
        // subscribe: POST with JSON body
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, room_id: roomId }),
        });
        if (!response.ok) {
            console.error("Subscribe failed:", response.statusText);
            return;
        }
        btn.textContent = "Unsubscribe";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
        btn.setAttribute("onclick",
            `toggleSubscription(${userId}, ${roomId}, true, this)`);
    }
}
