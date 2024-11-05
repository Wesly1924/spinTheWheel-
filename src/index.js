//https://docs.google.com/spreadsheets/d/1D-v4w_M68427Rmh-gqsd44Cas66y3pI4jNmZ6TXxH04/edit?pli=1&gid=0#gid=0
const sectors = [
	{ color: "#244BF9", text: "#ffffff", label: "No luck" },
	{ color: "#f9d124", text: "#ffffff", label: "BucketHat" },
	{ color: "#294e7e", text: "#ffffff", label: "Lanyard" },
	{ color: "#244BF9", text: "#ffffff", label: "No luck" },
	{ color: "#294e7e", text: "#ffffff", label: "Tshirt" },
	{ color: "#f9d124", text: "#ffffff", label: "Sorry you lost" },
	{ color: "#294e7e", text: "#ffffff", label: "Pen" },
];

//let sectors = [];
const prizeDataLink = "https://script.google.com/macros/s/AKfycbx2KMAxupTPbhHq_9TXu0WfJx0IhM3-nA-bMhNzoYTsdu86K4mMlSmwfSgwY8W1HWm7/exec";

async function fetchPrizeData() {
	try {
		const response = await fetch(`${prizeDataLink}?header=prize`);
		const data = await response.json();

		console.log(data);
		if (data.result === "success") {
			const transformedPrizes = data.prizes.map((prize) => ({
				prize: prize,
			}));
			console.log("Transformed Prizes:", transformedPrizes);
			sectors = []; //clear just in case

			// Add "No luck" and "Sorry you lost" at the beginning
			sectors.push({
				color: "#f9d124", // Color for "No luck"
				text: "#ffffff",
				label: "No luck",
			});

			sectors.push({
				color: "#244BF9", // Color for "Sorry you lost"
				text: "#ffffff",
				label: "Better Luck",
			});

			transformedPrizes.forEach(({ prize }, index) => {
				console.log(`Prize ${index + 1}:`, prize);
				sectors.push({
					color: "#294e7e", // Color for prize sectors
					text: "#ffffff", // Text color for prize sectors
					label: prize,
				});

				// Add "Better" and "Sorry you lost" after each prize sector, except after the last one
				// if (index < data.prizes.length - 1) {
				//   sectors.push({
				//     color: "#f9d124", // Color for "No luck"
				//     text: "#ffffff",
				//     label: "Better Luck"
				//   });

				//   sectors.push({
				//     color: "#244BF9", // Color for "Sorry you lost"
				//     text: "#ffffff",
				//     label: "Sorry you lost"
				//   });
				// }
			});

			console.log("Sectors after fetching:", sectors);
			// // Reinitialize the wheel with the updated sectors
			// init();
		} else {
			console.error("Failed to fetch sectors data:", data.error);
		}
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

// const winLimits = {
//   "cap": 1,
//   "100": 1,
//   "50": 3,
//   "20": 4,
//   "pen": 6,
//   "Lanyard": 6,
//   "No luck": Infinity
// };

const popup = document.querySelector("#popup");
const popupMessage = document.querySelector("#popup-message");

function showPopup(message) {
	popupMessage.textContent = message;
	popup.classList.remove("hidden");
	popup.classList.add("show");

	setTimeout(() => {
		popup.classList.remove("show");
		setTimeout(() => {
			popup.classList.add("hidden");
		}, 50);
	}, 5000);
}

const events = {
	listeners: {},
	addListener: function (eventName, fn) {
		this.listeners[eventName] = this.listeners[eventName] || [];
		this.listeners[eventName].push(fn);
	},
	fire: function (eventName, ...args) {
		if (this.listeners[eventName]) {
			for (let fn of this.listeners[eventName]) {
				fn(...args);
			}
		}
	},
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
console.log(tot);
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
let arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

// let lastWinTime = 0;
// const forceTryAgainTime = 3600000; // 1 hour in milliseconds

// function getTryAgainIndex() {
//   return sectors.findIndex(sector => sector.label === "No luck");
// }

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

// function getIndex() {
//   const tot = sectors.length; // Use the current length of sectors
//   const index = Math.floor((ang / TAU) * tot) % tot; // Calculate index
//   console.log("Current Index:", index);
//   return index >= 0 ? index : 0;
// }

// function getIndex() {
//   const tryAgainIndex = getTryAgainIndex();

//   if (Date.now() - lastWinTime < forceTryAgainTime) {
//     // Check proximity to "No luck" sector
//     const distance = Math.abs(ang % TAU - (arc * tryAgainIndex));
//     if (distance < arc * 2) { // Close enough to "No luck"
//       return tryAgainIndex;
//     }
//   }

//   // Calculate the index, ensuring it's within bounds
//   const index = Math.floor(tot - (ang / TAU) * tot) % tot;

//   // Return a valid index or fallback to 0 if something goes wrong
//   return index >= 0 && index < tot ? index : 0; // Modified line
// }

function drawSector(sector, i) {
	const ang = arc * i;
	ctx.save();

	// COLOR
	ctx.beginPath();
	ctx.fillStyle = sector.color;
	ctx.moveTo(rad, rad);
	ctx.arc(rad, rad, rad, ang, ang + arc);
	ctx.lineTo(rad, rad);
	ctx.fill();

	// TEXT
	ctx.translate(rad, rad);
	ctx.rotate(ang + arc / 2);
	ctx.textAlign = "right";
	ctx.fillStyle = sector.text;
	ctx.font = "bold 30px 'Lato', sans-serif";
	ctx.fillText(sector.label, rad - 10, 10);

	ctx.restore();
	console.log(`Drawing sector ${i}:`, sector);
}

function rotate() {
	if (sectors.length === 0) {
		console.error("No sectors available");
		return; // if sectors array is empty
	}

	const index = getIndex();
	const sector = sectors[index];

	// Ensure sector is defined before proceeding
	if (!sector) {
		console.error("Error: Undefined sector at index", index);
		return; // Exit if sector is undefined
	}

	ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

	spinEl.textContent = !angVel ? "SPIN" : sector.label;
	spinEl.style.background = sector.color; // Apply color to background
	spinEl.style.color = sector.text; // Set text color
}

function frame() {
	const finalSector = sectors[getIndex()];
	if (!angVel && spinButtonClicked) {
		//const finalSectorIndex = getIndex();
		const finalSector = sectors[getIndex()];

		// Ensure sector is defined before proceeding
		if (finalSector) {
			// Modified line
			events.fire("spinEnd", finalSector);
		} else {
			// Modified line
			//console.error("Error: Undefined sector at finalSectorIndex", ErrorEvent); // Modified line
		}

		spinButtonClicked = false; // reset the flag
		return;
	}

	angVel *= friction; // Decrement velocity by friction

	let now = Math.floor(Date.now() / 1000);
	let lastwin = parseInt(localStorage.getItem("lastwin")) + 2 * 60;

	// console.log("now", now,"     lastwin", lastwin)

	if (now > lastwin && angVel < 0.015) {
		if (angVel != 0 && finalSector.label == "Lanyard" && parseInt(localStorage.getItem("Lanyard")) > 0) {
			localStorage.setItem("lastprice", "Lanyard");
			angVel = 0;
		} else if (angVel != 0 && finalSector.label == "Pen" && parseInt(localStorage.getItem("Pen")) > 0) {
			localStorage.setItem("lastprice", "Pen");
			angVel = 0;
		} else if (angVel != 0 && finalSector.label == "BucketHat" && parseInt(localStorage.getItem("BucketHat")) > 0) {
			localStorage.setItem("lastprice", "BucketHat");
			angVel = 0;
		} else if (angVel != 0 && finalSector.label == "Tshirt" && parseInt(localStorage.getItem("Tshirt")) > 0) {
			localStorage.setItem("lastprice", "Tshirt");
			angVel = 0;
		} else {
			angVel = 0;
		}
	} else {
		if (angVel != 0 && angVel < 0.015) {
			if (finalSector.label == "No luck" || finalSector.label == "Sorry you lost") {
				ang += 0.05;
				angVel = 0;
			}
		} // Bring to stop
	}

	ang += angVel; // Update angle
	ang %= TAU; // Normalize angle

	rotate();
}

function engine() {
	frame();
	requestAnimationFrame(engine);
}

async function init() {
	try {
		// await fetchPrizeData(); // Fetch data and wait until it's done

		if (sectors.length === 0) {
			console.error("Sectors array is empty after fetching data");
			return; // if sectors array is still empty
		}

		const tot = sectors.length;
		console.log(tot);
		arc = TAU / tot; // Update arc based on sectors length
		sectors.forEach(drawSector);
		rotate(); // Initial rotation
		engine(); // Start engine

		if (spinEl) {
			spinEl.addEventListener("click", () => {
				console.log("Spin button clicked!");
				if (!angVel) angVel = rand(0.8, 1.9);
				spinButtonClicked = true;
			});
		} else {
			console.error("Spin button element not found");
		}
	} catch (error) {
		console.error("Error initializing the wheel:", error);
	}
}

init();

function showForm(prize) {
	const userForm = document.querySelector("#user-form");
	const prizeInput = document.querySelector("#prize");

	prizeInput.value = prize;
	userForm.classList.remove("hidden");
	userForm.classList.add("show");
}

function hideForm() {
	const userForm = document.querySelector("#user-form");
	userForm.classList.remove("show");
	userForm.classList.add("hidden");
}

events.addListener("spinEnd", (sector) => {
	// const now = Date.now();
	const message = sector.label == "No luck" || sector.label == "Sorry you lost" ? `Oops, ${sector.label}` : `Yaaay!!! You won ${sector.label}`;

	if (sector.label == "No luck" || sector.label == "Sorry you lost") {
		showPopup(message);
		console.log("No luck triggered");
	} else if (sector.label == "Try again") {
		showPopup("Another chance to try again");
	} else {
		// lastWinTime = now; // Update last win time
		showPopup(message);
		setTimeout(() => {
			showForm(sector.label);
		}, 5000);

		console.log(`Woop! You won ${sector.label}`);
	}
});

///fetchPrizeData();
// document.querySelector("#detailsForm").addEventListener("submit", function(event) {
//   event.preventDefault();

//   const name = document.querySelector("#name").value;
//   const id = document.querySelector("#id").value;
//   const prize = document.querySelector("#prize").value;

//   saveToExcel({ name, id, prize });

//   // Hide the form after submission
//   hideForm();

//   // Reset form fields
//   this.reset();
// });
