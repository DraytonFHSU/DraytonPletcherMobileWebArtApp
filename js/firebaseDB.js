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

// Add a image
export async function addImageToFirebase(image) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    console.log("userID: ", userId);
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        email: currentUser.email,
        name: currentUser.displayName,
      },
      { merge: true }
    );
    const imagesRef = collection(userRef, "images");
    const docRef = await addDoc(imagesRef, image);
    return { id: docRef.id, ...image };
  } catch (e) {
    console.error("Error adding image: ", e);
  }
}

export async function getImagesFromFirebase() {
  const images = [];
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    const imageRef = collection(doc(db, "users", userId), "images");
    const querySnapshot = await getDocs(imageRef);
    querySnapshot.forEach((doc) => {
      images.push({ id: doc.id, ...doc.data() });
    });
  } catch (e) {
    console.error("Error retrieving images: ", e);
  }
  return images;
}

export async function deleteImageFromFirebase(id) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "images", id));
  } catch (e) {
    console.error("Error deleting image: ", e);
  }
}

export async function updateImageInFirebase(id, updatedData) {
  console.log(updatedData, id);
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    const imageRef = doc(db, "users", userId, "images", id);
    await updateDoc(imageRef, updatedData);
  } catch (e) {
    console.error("Error updating image: ", e);
  }
}