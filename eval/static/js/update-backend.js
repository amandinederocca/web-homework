//the callback attached to clicking the "lu" du message
//it is used verbatim in the HTML template
async function message_lu_changed(elt, nodeId) {
    const done = elt.checked
    const url = `/api/messages/${nodeId}`
    const data = { done: done }
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (response.ok) {
      const data = await response.json()
      console.log(`${url} returned`, data)
    } else {
      console.error("Error updating message lu status:", response.statusText)
    }
  }

  async function message_delete(elt, nodeId) {
  const url = `/api/messages/${nodeId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    const data = await response.json();
    console.log(`${url} returned`, data);
  } else {
    console.error("Error deleting messagee:", response.statusText);
  }
}
