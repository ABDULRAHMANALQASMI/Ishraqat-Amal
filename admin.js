// admin.js - uses Firebase to authenticate admin and list requests
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref as sRef, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const authSection = document.getElementById('authSection');
const dashboard = document.getElementById('dashboard');
const authStatus = document.getElementById('authStatus');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('adminEmail').value;
  const pass = document.getElementById('adminPass').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    authStatus.textContent = 'خطأ بتسجيل الدخول: ' + err.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if(user){
    authSection.style.display = 'none';
    dashboard.style.display = '';
    loadRequests();
  } else {
    authSection.style.display = '';
    dashboard.style.display = 'none';
  }
});

async function loadRequests(){
  const tbody = document.querySelector('#requestsTable tbody');
  tbody.innerHTML = '<tr><td colspan="7">جاري التحميل...</td></tr>';
  try {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    tbody.innerHTML = '';
    for(const doc of snapshot.docs){
      const data = doc.data();
      const tr = document.createElement('tr');
      const date = data.createdAt ? data.createdAt.toDate().toLocaleString() : '';
      tr.innerHTML = `
        <td>${escapeHtml(data.name||'')}</td>
        <td>${escapeHtml(data.phone||'')}</td>
        <td>${escapeHtml(data.city||'')}</td>
        <td>${escapeHtml(data.helpType||'')}</td>
        <td>${escapeHtml(data.description||'')}</td>
        <td class="docs-cell" data-id="${doc.id}">تحميل...</td>
        <td>${date}</td>
      `;
      tbody.appendChild(tr);
      // list files in storage under requests/{docId}/
      const listRef = sRef(storage, `requests/${doc.id}/`);
      try {
        const res = await listAll(listRef);
        const cell = tr.querySelector('.docs-cell');
        cell.innerHTML = '';
        if(res.items.length === 0){
          cell.textContent = 'لا مستندات';
        } else {
          for(const itemRef of res.items){
            const url = await getDownloadURL(itemRef);
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = decodeURIComponent(itemRef.name);
            a.style.display = 'block';
            cell.appendChild(a);
          }
        }
      } catch(e){
        console.warn('no files or list error', e);
      }
    }
  } catch(err){
    tbody.innerHTML = '<tr><td colspan="7">خطأ بجلب الطلبات.</td></tr>';
    console.error(err);
  }
}

function escapeHtml(text){
  if(!text) return '';
  return text.replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
}
