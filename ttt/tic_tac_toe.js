'use strict';

function check_win(color) {
	/* durty check with pattern */
	let grid_data = "";
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			let c = document.getElementById(`cell-${i}-${j}`);
			grid_data = grid_data+ (c.classList.contains(color)?"1":"0");
		}
	}

	if (
		grid_data.match(/111....../) ||
		grid_data.match(/...111.../) ||
		grid_data.match(/......111/) ||
		grid_data.match(/1..1..1../) ||
		grid_data.match(/.1..1..1./) ||
		grid_data.match(/..1..1..1/) ||
		grid_data.match(/1...1...1/) ||
		grid_data.match(/..1.1.1../)) {
		return true;
	}
	return false;
}


document.addEventListener('DOMContentLoaded', function () {
	let current_color = 'red';
	const windlg = document.getElementById("windlg");
	const restart_btn = document.getElementById("restart");
	const reset_btn = document.getElementById("reset");
	const board = document.getElementById("board");

	function reset() {
		current_color = 'red';
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				let c = document.getElementById(`cell-${i}-${j}`);
				c.classList.remove("red");
				c.classList.remove("green");
			}
		}

		// Hide win dialog box
		windlg.style.display = 'none';
		
		// Display board and reset button
		reset_btn.style.display = 'block';
		board.style.display = 'grid';
	}

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			let c = document.getElementById(`cell-${i}-${j}`);
			c.addEventListener('click', function() {
				if (c.classList.contains("red") || c.classList.contains("green"))
					return;
				c.classList.add(current_color);
				if (check_win(current_color)) {
					windlg.firstElementChild.innerHTML = `<span class="${current_color}">${current_color}</span> win!!!`;

					// Show dialog box
					windlg.style.display = "block";

					// Hide board game
					board.style.display = "none";
					reset_btn.style.display = "none";
					
				}
				current_color = current_color == 'red' ? 'green' : 'red';
			});
		}
	}

	document.getElementById("reset").addEventListener('click', reset);
	document.getElementById("restart").addEventListener('click', reset);
});




const svgNS = "http://www.w3.org/2000/svg"


/* generates random circles in specified area */
class Board {

  constructor(width, height, radius) {
    this.w = width
    this.h = height
    this.r = radius
    this.active = false
  }

  toggle() {
    this.active = !this.active
  }

  add_random_circle() {
    // create a circle
    let c = document.createElementNS(svgNS, 'circle')
    // change its attributes
    let [rx, ry] = [Math.random(), Math.random()]
    let [x, y] = [rx * this.w, ry * this.h]
    c.setAttribute('cx', x) // center
    c.setAttribute('cy', y)
    c.setAttribute('r', this.r)  // radius
    // locate the <svg> element
    let svg = document.querySelector("svg")
    // insert circle in <svg> element
    svg.append(c)
  }

  // heartbeat
  heart_beat() {
    console.log(`in RUN, active=${this.active}`)
    if (this.active) {
      this.add_random_circle()
    }
  }

  // do {this.heart_beat()} every 500 ms
  start() {
    // first parameter here is a function
    // that we want to call every 500 ms
    setInterval(() => this.heart_beat(), 500)
  }
}

// initialize, but only once the page is loaded
document.addEventListener('DOMContentLoaded',
  function () {
    // create instance
    let the_board = new Board(200, 200, 4)
    the_board.start()

    // set svg size
    let svg = document.querySelector("svg")
    svg.setAttribute('width', the_board.w)
    svg.setAttribute('height', the_board.h)

    // arm callback
    document.getElementById("button")
      .addEventListener('click', () => the_board.toggle())
      // note that this form would not work
      // .addEventListener( 'click', the_board.toggle )
      // because the 'this' variable in toggle()
      // would reference the button element
  })