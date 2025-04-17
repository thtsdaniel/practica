const form = document.getElementById('passwordForm');
const passwordList = document.getElementById('passwordList');
const generateBtn = document.getElementById('generatePassword');

let passwords = JSON.parse(localStorage.getItem('passwords')) || [];
renderPasswords();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const service = document.getElementById('service').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const index = passwords.findIndex(p => p.service === service && p.username === username);
  if (index > -1) {
    passwords[index].password = password;
  } else {
    passwords.push({ service, username, password });
  }

  localStorage.setItem('passwords', JSON.stringify(passwords));
  form.reset();
  renderPasswords();
});

generateBtn.addEventListener('click', () => {
  const generated = generatePassword(16);
  document.getElementById('password').value = generated;
});

function generatePassword(length) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function renderPasswords() {
  passwordList.innerHTML = '';
  passwords.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'password-entry';
    div.innerHTML = `
      <div>
        <a href="${entry.service}" target="_blank">${entry.service}</a><br>
        <span><strong>${entry.username}</strong></span><br>
        <span>${entry.password}</span>
      </div>
      <div class="entry-buttons">
        <button class="btn generate" onclick="editEntry(${index})">Modifică</button>
        <button class="btn export" onclick="deleteEntry(${index})">Șterge</button>
      </div>
    `;
    passwordList.appendChild(div);
  });
}

function editEntry(index) {
  const entry = passwords[index];
  document.getElementById('service').value = entry.service;
  document.getElementById('username').value = entry.username;
  document.getElementById('password').value = entry.password;
  // Se va actualiza automat la submit
}

function deleteEntry(index) {
  passwords.splice(index, 1);
  localStorage.setItem('passwords', JSON.stringify(passwords));
  renderPasswords();
}

function downloadBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(passwords));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "backup_parole.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

// 🔐 Bookmarklet generator
function generateBookmarklet() {
  const script = `
    (function() {
      const saved = JSON.parse(localStorage.getItem('passwords') || '[]');
      const currentHost = window.location.origin;

      const match = saved.find(p => p.service.includes(currentHost));
      if (!match) {
        alert("Nu s-a găsit nici o parolă salvată pentru acest site.");
        return;
      }

      const inputs = document.querySelectorAll('input');
      let userInput = [...inputs].find(i => i.type === 'text' || i.type === 'email');
      let passInput = [...inputs].find(i => i.type === 'password');

      if (userInput) userInput.value = match.username;
      if (passInput) passInput.value = match.password;
    })();
  `;
  const encoded = encodeURIComponent(script);
  const link = `javascript:${encoded}`;
  const a = document.createElement('a');
  a.href = link;
  a.textContent = "Drag me to bookmarks bar!";
  a.style.display = 'inline-block';
  a.style.marginTop = '1rem';
  a.style.background = '#4a00e0';
  a.style.color = '#fff';
  a.style.padding = '0.7rem 1.2rem';
  a.style.borderRadius = '12px';
  a.style.textDecoration = 'none';
  document.body.appendChild(a);
}

generateBookmarklet();
