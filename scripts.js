// scripts.js (Keep the complete code from the previous response - no changes required here)

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const passwordForm = document.getElementById('passwordForm');
    const websiteInput = document.getElementById('website');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordVisibilityBtn = document.getElementById('togglePasswordVisibilityBtn'); // Form toggle button
    const editIdInput = document.getElementById('editId'); 
    const saveBtn = document.getElementById('saveBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    // List element
    const passwordList = document.getElementById('passwordList');

    const STORAGE_KEY = 'insecurePasswordsDemo'; // Key for localStorage

    // --- Helper Functions ---

    // Function to get passwords from localStorage
    function getPasswords() {
        const passwords = localStorage.getItem(STORAGE_KEY);
        // VERY INSECURE: Passwords stored as plain JSON text
        try {
            return passwords ? JSON.parse(passwords) : [];
        } catch (e) {
            console.error("Error parsing passwords from localStorage", e);
            return []; // Return empty array on error
        }
    }

    // Function to save passwords to localStorage
    function savePasswords(passwords) {
        // VERY INSECURE: Saving as plain JSON text
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
        } catch (e) {
            console.error("Error saving passwords to localStorage", e);
            alert("Error saving passwords. LocalStorage might be full or disabled.");
        }
    }

    // Function to generate a simple unique enough ID for this demo
    function generateId() {
        return Date.now().toString() + Math.random().toString(36).substring(2, 9);
    }
    
    // Reset form fields and state
    function resetForm() {
        passwordForm.reset(); // Resets input fields
        editIdInput.value = ''; // Clear hidden edit ID
        saveBtn.textContent = 'Save Password'; // Reset button text
        cancelEditBtn.classList.add('hidden'); // Hide cancel button
        passwordInput.type = 'password'; // Ensure password field is hidden
        togglePasswordVisibilityBtn.textContent = 'Show'; // Reset toggle button text
    }

    // --- UI Rendering ---

    // Function to display a single password entry in the list
    function displayPasswordEntry(entry) {
        const li = document.createElement('li');
        li.className = 'password-entry';
        li.dataset.id = entry.id; // Store id on the element for easy access

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'details';

        const websiteSpan = document.createElement('span');
        websiteSpan.className = 'website';
        websiteSpan.textContent = entry.website;

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = `Username: ${entry.username}`;

        const passwordDisplayDiv = document.createElement('div');
        passwordDisplayDiv.className = 'password-display';

        const passwordSpan = document.createElement('span');
        passwordSpan.className = 'password-text';
        passwordSpan.textContent = '••••••••'; // Initially hidden
        // INSECURE: Storing actual password in a data attribute
        passwordSpan.dataset.password = entry.password; 
        
        const showHideBtnList = document.createElement('button'); // Button for the list item
        showHideBtnList.textContent = 'Show';
        showHideBtnList.className = 'show-hide-btn'; // Use class for list item buttons
        showHideBtnList.type = 'button'; 
        showHideBtnList.addEventListener('click', togglePasswordVisibilityInList); // Use dedicated handler

        passwordDisplayDiv.appendChild(document.createTextNode('Password: '));
        passwordDisplayDiv.appendChild(passwordSpan);
        passwordDisplayDiv.appendChild(showHideBtnList); // Add show/hide button for the list item

        detailsDiv.appendChild(websiteSpan);
        detailsDiv.appendChild(usernameSpan);
        detailsDiv.appendChild(passwordDisplayDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.type = 'button';
        editBtn.addEventListener('click', () => startEdit(entry.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.addEventListener('click', () => deletePassword(entry.id));

        // Add edit/delete buttons to actions div
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(detailsDiv);
        li.appendChild(actionsDiv); // Append actions div

        passwordList.appendChild(li);
    }

    // Function to load and display all saved passwords
    function loadAndDisplayPasswords() {
        passwordList.innerHTML = ''; // Clear current list
        const passwords = getPasswords();
        passwords.forEach(displayPasswordEntry);
    }

    // --- Event Handlers ---

    // Toggle visibility for the password INPUT FIELD in the form
    togglePasswordVisibilityBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordVisibilityBtn.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            togglePasswordVisibilityBtn.textContent = 'Show';
        }
    });

    // Handle form submission (Save/Update)
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload

        const website = websiteInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim(); // INSECURE: Getting plain text password
        const idToEdit = editIdInput.value;

        if (!website || !username || !password) {
            alert('Please fill in all fields.');
            return;
        }

        let passwords = getPasswords();
        
        if (idToEdit) {
            // Editing existing entry
             passwords = passwords.map(entry => 
                entry.id === idToEdit ? { ...entry, website, username, password } : entry
            );
            // Reset form handles clearing ID and button text now
        } else {
             // Adding new entry
            const newEntry = {
                id: generateId(),
                website,
                username,
                password // INSECURE: Storing plain text password
            };
            passwords.push(newEntry);
        }

        savePasswords(passwords);
        loadAndDisplayPasswords(); // Refresh the list display
        resetForm(); // Reset the form fields and state
    });

    // Toggle password visibility IN THE SAVED LIST
    function togglePasswordVisibilityInList(event) {
        const btn = event.target; // The specific "Show/Hide" button clicked in the list
        // Find the password span relative to the button (adjust if structure changes)
        const passwordSpan = btn.previousElementSibling; // Assumes span is immediately before button
        
        if (!passwordSpan || !passwordSpan.classList.contains('password-text')) {
             console.error("Could not find password text element relative to button.");
             return;
        }
        
        const actualPassword = passwordSpan.dataset.password; // INSECURE: Reading from data attribute

        if (passwordSpan.textContent === '••••••••') {
            passwordSpan.textContent = actualPassword;
            btn.textContent = 'Hide';
        } else {
            passwordSpan.textContent = '••••••••';
            btn.textContent = 'Show';
        }
    }

    // Prepare form for editing
    function startEdit(id) {
        const passwords = getPasswords();
        const entryToEdit = passwords.find(entry => entry.id === id);
        if (!entryToEdit) return;

        websiteInput.value = entryToEdit.website;
        usernameInput.value = entryToEdit.username;
        passwordInput.value = entryToEdit.password; // INSECURE: Populating with plain text
        editIdInput.value = entryToEdit.id; // Set the ID for saving

        saveBtn.textContent = 'Update Password'; // Change button text
        cancelEditBtn.classList.remove('hidden'); // Show cancel button
        
        // Reset password visibility in form when starting edit
        passwordInput.type = 'password'; 
        togglePasswordVisibilityBtn.textContent = 'Show';
        
        // Scroll to form for better UX
        passwordForm.scrollIntoView({ behavior: 'smooth' }); 
        websiteInput.focus();
    }
    
     // Cancel Edit Mode
    cancelEditBtn.addEventListener('click', () => {
        resetForm(); // Reset form clears fields and resets buttons/state
    });

    // Delete a password entry
    function deletePassword(id) {
        // Optional: More user-friendly confirmation
        const entryToDelete = passwordList.querySelector(`li[data-id="${id}"] .website`);
        const websiteName = entryToDelete ? entryToDelete.textContent : 'this entry';
        
        if (!confirm(`Are you sure you want to delete the password for "${websiteName}"?`)) {
            return;
        }

        let passwords = getPasswords();
        passwords = passwords.filter(entry => entry.id !== id);
        savePasswords(passwords);
        loadAndDisplayPasswords(); // Refresh the list display
        
        // If we were editing the item we just deleted, reset the form
        if (editIdInput.value === id) {
             resetForm();
        }
    }

    // --- Initial Load ---
    loadAndDisplayPasswords();
    
}); // End DOMContentLoaded