//imports
import { openDB } from "https://unpkg.com/idb?module";
import {
    loadImages
} from "./firebaseDB.js";

//Indexed DB
// --- Database Operations ---

// Create or Get IndexedDB database instance
let dbPromise;
async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("321Draw", 1, {
      upgrade(db) {
        const store = db.createObjectStore("images", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status");
        store.createIndex("synced", "synced");
      },
    });
  }
  return dbPromise;
}

// Sync unsynced images from IndexedDB to Firebase
export async function syncImages() {
  const db = await getDB();
  const tx = db.transaction("images", "readonly");
  const store = tx.objectStore("images");
  const images = await store.getAll();
  await tx.done;

  for (const image of images) {
    if (!image.synced && isOnline()) {
      try {
        const imageToSync = {
          title: image.title,
          description: image.description,
          status: image.status,
        };
        const savedImage = await addImageToFirebase(imageToSync);
        const txUpdate = db.transaction("images", "readwrite");
        const storeUpdate = txUpdate.objectStore("images");
        await storeUpdate.delete(image.id);
        await storeUpdate.put({ ...image, id: savedImage.id, synced: true });
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing image:", error);
      }
    }
  }
}

// Check if the app is online
function isOnline() {
  return navigator.onLine;
}


// Delete Image with Transaction
async function deleteImage(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteImage.");
    return;
  }
  const db = await getDB();
  if (isOnline()) {
    try {
      await deleteImageFromFirebase(id);
    } catch (error) {
      console.error("Error deleting image from Firebase:", error);
    }
  }

  const tx = db.transaction("images", "readwrite");
  const store = tx.objectStore("images");
  try {
    await store.delete(id);
  } catch (e) {
    console.error("Error deleting image from IndexedDB:", e);
  }
  await tx.done;

  const imageCard = document.querySelector(`[data-id="${id}"]`);
  if (imageCard) {
    imageCard.remove();
  }
  checkStorageUsage();
}


// Display Image in the UI
function displayImage(image) {
  const imageContainer = document.querySelector(".images");

  // Check if the image already exists in the UI and remove it
  const existingImage = imageContainer.querySelector(`[data-id="${image.id}"]`);
  if (existingImage) {
    existingImage.remove();
  }

  // Create new image HTML and add it to the container
  const html = `
    <div class="card-panel white row valign-wrapper" data-id="${image.id}">
      <div class="col s2">
        <img src="/img/icons/image.png" class="circle responsive-img" alt="Image icon" style="max-width: 100%; height: auto"/>
      </div>
      <div class="image-detail col s8">
        <h5 class="image-title black-text">${image.title}</h5>
        <div class="image-description">${image.description}</div>
      </div>
      <div class="col s2 right-align">
        <button class="image-delete btn-flat" aria-label="Delete image">
          <i class="material-icons black-text text-darken-1" style="font-size: 30px">delete</i>
        </button>
        <button class="image-edit btn-flat" data-target="side-form" aria-label="Edit image">
          <i class="material-icons black-text text-darken-1" style="font-size: 30px">edit</i>
        </button>
      </div>
    </div>
  `;
  imageContainer.insertAdjacentHTML("beforeend", html);

  const deleteButton = imageContainer.querySelector(
    `[data-id="${image.id}"] .image-delete`
  );
  deleteButton.addEventListener("click", () => deleteImage(image.id));

  const editButton = imageContainer.querySelector(
    `[data-id="${image.id}"] .image-edit`
  );
  editButton.addEventListener("click", () =>
    openEditForm(image.id, image.title, image.description)
  );
}

// Open Edit Form with Existing Image Data
function openEditForm(id, title, description) {
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const imageIdInput = document.querySelector("#image-id");
  const formActionButton = document.querySelector("#form-action-btn");

  // Fill in the form with existing image data
  titleInput.value = title;
  descriptionInput.value = description;
  imageIdInput.value = id; // Set imageId for the edit operation
  formActionButton.textContent = "Edit"; // Change the button text to "Edit"

  M.updateTextFields(); // Materialize CSS form update

  // Open the side form
  const forms = document.querySelector(".side-form");
  const instance = M.Sidenav.getInstance(forms);
  instance.open();
}

// Helper function to reset the form after use
function closeForm() {
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const imageIdInput = document.querySelector("#image-id");
  const formActionButton = document.querySelector("#form-action-btn");
  titleInput.value = "";
  descriptionInput.value = "";
  imageIdInput.value = "";
  formActionButton.textContent = "Add";
  const forms = document.querySelector(".side-form");
  const instance = M.Sidenav.getInstance(forms);
  instance.close();
}

// Check storage usage and display warnings
async function checkStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    const usageInMB = (usage / (1024 * 1024)).toFixed(2);
    const quotaInMB = (quota / (1024 * 1024)).toFixed(2);
    console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

    const storageInfo = document.querySelector("#storage-info");
    if (storageInfo) {
      storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
    }

    const storageWarning = document.querySelector("#storage-warning");
    if (usage / quota > STORAGE_THRESHOLD) {
      if (storageWarning) {
        storageWarning.textContent = "Warning: Running low on storage space.";
        storageWarning.style.display = "block";
      }
    } else if (storageWarning) {
      storageWarning.textContent = "";
      storageWarning.style.display = "none";
    }
  }
}

// Request persistent storage
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist();
    console.log(`Persistent storage granted: ${isPersistent}`);

    const storageMessage = document.querySelector("#persistent-storage-info");
    if (storageMessage) {
      storageMessage.textContent = isPersistent
        ? "Persistent storage granted!"
        : "Data might be cleared under storage pressure.";
      storageMessage.classList.toggle("green-text", isPersistent);
      storageMessage.classList.toggle("red-text", !isPersistent);
    }
  }
}

window.addEventListener("online", syncImages);
window.addEventListener("online", loadImages);