// Ouvrir un WebSocket quand la page se charge pour recevoir les notifs de la discussion
document.addEventListener("DOMContentLoaded", () => {
    const ctx = window.APP_CONTEXT;
    if (!ctx || !ctx.roomId) {
        console.warn("No APP_CONTEXT.roomId — WS not opened.");
        return;
    }

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/${ctx.roomId}`);

    ws.onopen  = () => console.log("WebSocket opened on room", ctx.roomId);
    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { action, message } = data;
        switch (action) {
            case "create":
                createMessageElement(message);
                break;
            case "update":
                updateMessageElement(message);
                break;
            case "delete":
                deleteMessageElement(message.id);
                break;
            default:
                console.warn("Unknown action:", action);
        }
    };
});