const canvas = document.getElementById("canvas");
const body = document.querySelector("body");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let theColor = '#000'; // Set a default color
let lineW = 5;
let prevX = null;
let prevY = null;
let draw = false;

body.style.backgroundColor = "#FFFFFF";

const theInput = document.getElementById("favcolor");
theInput.addEventListener("input", function() {
    theColor = theInput.value; // Update brush color from color input
}, false);

const ctx = canvas.getContext("2d");
ctx.lineWidth = lineW;
ctx.strokeStyle = theColor; // Set initial stroke color

document.getElementById("ageInputId").oninput = function() {
    lineW = this.value;
    document.getElementById("ageOutputId").innerHTML = lineW;
    ctx.lineWidth = lineW;
};

let clrs = document.querySelectorAll(".clr");
clrs.forEach(clr => {
    clr.addEventListener("click", () => {
        theColor = clr.dataset.clr; // Change theColor to the clicked button's color
        ctx.strokeStyle = theColor; // Update canvas stroke style
    });
});

let clearBtn = document.querySelector(".clear");
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

let saveBtn = document.querySelector(".save");
saveBtn.addEventListener("click", () => {
    let data = canvas.toDataURL("image/png"); // Fixed typo: "imag/png" to "image/png"
    let a = document.createElement("a");
    a.href = data;
    a.download = "sketch.png";
    a.click();
});

window.addEventListener("mousedown", (e) => {
    draw = true;
    prevX = e.clientX;
    prevY = e.clientY; // Set starting point
});

window.addEventListener("mouseup", () => draw = false);
window.addEventListener("mousemove", (e) => {
    if (!draw) return; // If not drawing, do nothing

    let currentX = e.clientX;
    let currentY = e.clientY;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    prevX = currentX;
    prevY = currentY; // Update previous coordinates
});
