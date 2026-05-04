document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const json = {};
            for (const [key, value] of new FormData(form).entries()) {
                json[key] = /^-?\d+$/.test(value) ? Number(value) : value;
            }

            const response = await fetch(form.action, {
                method: form.method || "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json),
            });

            if (!response.ok) {
                console.error(
                    `Error submitting form at ${form.action}:`,
                    response.statusText
                );
                return;
            }
            // we rely on the WebSocket to display the message back to us,
            // so just clear the input.
            form.reset();
        });
    });
});
