document.addEventListener("DOMContentLoaded", () => {
  // Initial clean up. DO NOT REMOVE.
  tot=30
  cliquedsquares=0
  carrébleu=0
  originaux=30

  initialCleanup();
  const grid = document.getElementById("grid");

  // Hey! Pssst! In here ...
  function addLine() {
    for (let i = 0; i < 10; i++) {
      const newbox = document.createElement("div");
      newbox.addEventListener("click", (event) => wasClicked(event.target)); 
      newbox.addEventListener("mouseover", (event) => wasHovered(event.target));//pour la nouvelle fonction affichee
      //newbox.addEventListener("mouseout", (event) => nolongerHovered(event.target));  
      grid.appendChild(newbox);
    }
  }

  document.getElementById("btn-add-line").addEventListener("click", addLine);



  function wasClicked(element) {
    element.style.backgroundColor = "red";
    element.classList.add("clicked")
    cliquedsquares+=1
    if element.classlist.contains("hovered") {
      carrébleu-=1
    }
    originaux-=1

  }

  function wasHovered(element) {
    element.classList.add ("hovered");
    carrébleu+=1
    originaux-=1
  }

  tot=carrébleu+originaux+cliquedsquares

   //function nolongerHovered(element) {
  //   element.classList.remove("hovered");
  // }

  function addCallbackToAllCells() {
    for (const box of document.querySelectorAll("#grid>div")) {
      box.addEventListener("click", (event) => wasClicked(event.target));
      box.addEventListener("mouseover", (event) => wasHovered(event.target))
      //box.addEventListener("mouseout", (event) => nolongerHovered(event.target))
    }
  }
  addCallbackToAllCells()

  document.getElementById
  


  /**
   * Cleans up the document so that the exercise is easier.
   *
   * There are some text and comment nodes that are in the initial DOM, it's nice
   * to clean them up beforehand.
   */
  function initialCleanup() {
    const nodesToRemove = [];
    document.getElementById("grid").childNodes.forEach((node, key) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        nodesToRemove.push(node);
      }
    });
    for (const node of nodesToRemove) {
      node.remove();
    }
  }
});

