import { currentUser } from "./auth.js";
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { addImageToFirebase } from "./firebaseDB.js";
//Set up the canvas
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
    let data = canvas.toDataURL("image/png");
    let a = document.createElement("a");
    a.href = data;
    a.download = "sketch.png";
    a.click();
});

window.addEventListener("mousedown", (e) => {
    draw = true;
    prevX = e.clientX;
    prevY = e.clientY - 65; // Set starting point
});

window.addEventListener("mouseup", () => draw = false);
window.addEventListener("mousemove", (e) => {
    if (!draw) return; // If not drawing, do nothing

    let currentX = e.clientX;
    let currentY = e.clientY - 65;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    prevX = currentX;
    prevY = currentY; // Update previous coordinates
});

//Sidenav Initializer
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
});

// Register Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/serviceworker.js")
      .then((req) => console.log("Service Worker Registered!", req))
      .catch((err) => console.log("Service Worker registration failed", err));
  }

//firebase add to Gallery (Here since the front page has the save to gallery button)
let saveGalleryBtn = document.querySelector(".saveGallery");
saveGalleryBtn.addEventListener("click", async ()=>{
    const dataURL = canvas.toDataURL('image/png');
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    const userRef = doc(db, "users", userId)
    await setDoc(
        userRef,
        {
            email: currentUser.email,
            name: currentUser.displayName,
        },
        {merge: true}
    )
    let imagesRef = await addDoc(collection(doc(db, "users", userId), "images"), {
    imageData: dataURL,
    // Other image data
    })
    .then((docRef) => {
        console.log("Drawing saved with ID:", docRef.id);
    })
    .catch((error) => {
        console.error("Error saving image:", error);
    });
});


// Add Image (either to Firebase or IndexedDB)

export async function addImage(image) {
    const db = await getDB();
    let imageId;
  
    if (isOnline()) {
      try {
        const savedImage = await addImageToFirebase(image);
        imageId = savedImage.id;
        const tx = db.transaction("images", "readwrite");
        const store = tx.objectStore("images");
        await store.put({ ...image, id: imageId, synced: true });
        await tx.done;
      } catch (error) {
        console.error("Error adding image to Firebase:", error);
      }
    } else {
      imageId = `temp-${Date.now()}`;
      const imageToStore = { ...image, id: imageId, synced: false };
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      await store.put(imageToStore);
      await tx.done;
    }
  
    checkStorageUsage();
    return { ...image, id: imageId };
  }