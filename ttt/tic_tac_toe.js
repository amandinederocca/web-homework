'use strict';

function gagné(color) {
	let grid_data = "";
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			let c = document.getElementById(`case-${i}-${j}`);
			grid_data = grid_data+ (c.classList.contains(color)?"1":"0");
		}
	}

	if (
		grid_data.match(/111....../) ||//on regarde si une des combinaisons qui permet de gagner est réalisé
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
	let current_color = 'rouge';
	const windlg = document.getElementById("windlg");
	const restart_btn = document.getElementById("restart");
	const reset_btn = document.getElementById("reset");
	const board = document.getElementById("plateau");

	function reset() {
		current_color = 'red';
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				let c = document.getElementById(`case-${i}-${j}`);
				c.classList.remove("rouge");
				c.classList.remove("vert");
			}
		}

		// on cache le bouton winner
		windlg.style.display = 'none';
		
		// on affiche le boutton et le plateau
		reset_btn.style.display = 'block';
		plateau.style.display = 'grid';
	}

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			let c = document.getElementById(`case-${i}-${j}`);
			c.addEventListener('click', function() {
				if (c.classList.contains("rouge") || c.classList.contains("vert"))
					return;
				c.classList.add(current_color);
				if (gagné(current_color)) {
					windlg.firstElementChild.innerHTML = `<span class="${current_color}">${current_color}</span> win!!!`;

					// on fait apparaitre le bouton de victoire sous forme d'un bloc
					windlg.style.display = "block";

					// et on fait disparaitre le reste
					plateau.style.display = "none";
					reset_btn.style.display = "none";
					
				}
				current_color = current_color == 'rouge' ? 'vert' : 'rouge';
			});
		}
	}

	document.getElementById("reset").addEventListener('click', reset);
	document.getElementById("restart").addEventListener('click', reset);
});


