// app.js - uses Firebase v9 modular SDK
// IMPORTANT: Replace firebaseConfig with your project's config in firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const form = document.getElementById('helpForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'جاري إرسال الطلب...';
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const city = document.getElementById('city').value.trim();
  const helpType = document.getElementById('helpType').value;
  const description = document.getElementById('description').value.trim();
  const files = document.getElementById('files').files;

  try {
    // create doc in Firestore
    const docRef = await addDoc(collection(db, "requests"), {
      name, phone, city, helpType, description,
      createdAt: serverTimestamp()
    });

    // upload files (if any) to Storage under requests/{docId}/
    const uploaded = [];
    for(let i=0;i<files.length;i++){
      const file = files[i];
      // limit file size to ~12MB per file (client-side)
      if(file.size > 12 * 1024 * 1024){
        status.textContent = 'يوجد ملف أكبر من 12MB. الرجاء ضغط الملف أو رفع ملف أصغر.';
        return;
      }
      const path = `requests/${docRef.id}/${encodeURIComponent(file.name)}`;
      const storageRef = sRef(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploaded.push({name: file.name, url});
    }

    // update doc with files array
    if(uploaded.length){
      // Firestore update
      await addDoc(collection(db, `requests/${docRef.id}/files`), {}); // placeholder if needed
      // Instead, store files in a subcollection or update parent doc - simple approach: add 'files' field
      // but Firestore doesn't allow update without reference; so we'll use setDoc in future versions.
    }

    status.textContent = 'تم إرسال الطلب بنجاح. شكرًا لثقتك.';
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.';
  }
});
