const API_URL = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
let currentIncome = 0;
let currentExpenses = 0;
let transactions = [];

document.addEventListener('DOMContentLoaded', () => {

    if (!getToken()) {
        window.location.href = 'signin.html';
        return;
    }


    loadUserDataAndTransactions();


    const username = localStorage.getItem('username') || 'User';
    document.querySelectorAll('.nav-right span, .mobile-profile span').forEach(el => {
        el.innerText = username;
    });


});


async function loadUserDataAndTransactions() {

    await fetchDashboardSummary();
    await fetchTransactions();
    updateUI();
}

async function fetchDashboardSummary() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            currentIncome = data.totalIncome || 0;
            currentExpenses = data.totalExpenses || 0;
        } else {
            console.error('Failed to fetch summary:', data.message);

        }
    } catch (error) {
        console.error('Network Error during summary fetch:', error);
    }
}

async function fetchTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            transactions = data;
        } else {
            console.error('Failed to fetch transactions:', data.message);
            transactions = [];
        }
    } catch (error) {
        console.error('Network Error during transaction fetch:', error);
    }
}


async function addTransaction(title, amount, category) {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                type: 'Expense',
                description: title,
                amount: amount,
                category: category
            })
        });

        const data = await response.json();

        if (response.ok) {

            await loadUserDataAndTransactions();
            document.getElementById("popup").style.display = "none";
            document.getElementById("title").value = "";
            document.getElementById("amount").value = "";
        } else {
            alert('Error adding transaction: ' + data.message);
        }
    } catch (error) {
        console.error('Network Error:', error);
        alert('Could not connect to the server.');
    }
}


async function updateBaseIncome(newBaseIncome) {
    try {


        const response = await fetch(`${API_URL}/users/income`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ newBaseIncome: newBaseIncome })
        });

        const data = await response.json();

        if (response.ok) {
            currentIncome = data.totalIncome;
            updateUI();
            document.getElementById("incomePopup").style.display = "none";
        } else {
            alert('Error updating income: ' + data.message);
        }

    } catch (error) {
        console.error('Network Error:', error);
        alert('Could not connect to the server.');
    }
}



document.getElementById("fab").onclick = () => document.getElementById("popup").style.display = "flex";
document.getElementById("closeBtn").onclick = () => document.getElementById("popup").style.display = "none";

document.getElementById("openIncomePopup").onclick = () => {
    document.getElementById("incomeInput").value = currentIncome;
    document.getElementById("incomePopup").style.display = "flex";
};
document.getElementById("closeIncome").onclick = () => document.getElementById("incomePopup").style.display = "none";


document.getElementById("saveIncome").onclick = () => {
    let newVal = parseFloat(document.getElementById("incomeInput").value);
    if (isNaN(newVal)) return alert("Enter valid income");
    updateBaseIncome(newVal);
};


document.getElementById("openExpensePopup").onclick = () => alert("To change your total expenses, please add or remove transactions.");
document.getElementById("closeExpense").onclick = () => document.getElementById("expensePopup").style.display = "none";
document.getElementById("saveExpense").onclick = () => alert("Total Expenses are calculated from transactions.");

document.getElementById("saveBtn").onclick = () => {
    let title = document.getElementById("title").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let category = document.getElementById("category").value;

    if (!title || isNaN(amount) || amount <= 0) return alert("Enter valid title and amount");

    addTransaction(title, amount, category);
};


function updateUI() {
    const balance = currentIncome - currentExpenses;

    document.getElementById("balance").innerText = `₹ ${balance.toFixed(2)}`;
    document.getElementById("incomeAmount").innerText = `₹ ${currentIncome.toFixed(2)}`;
    document.getElementById("expenseAmount").innerText = `₹ ${currentExpenses.toFixed(2)}`;

    let list = document.getElementById("transactionList");
    list.innerHTML = "";

    transactions.slice(0, 5).forEach(t => {

        list.innerHTML += `
        <div class="trans-item">
            <div class="trans-left">
                <div class="icon-circle category-${t.category.toLowerCase()}"></div>
                <div>
                    <p><b>${t.description}</b></p>
                    <small>${new Date(t.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="amount">- ₹${t.amount.toFixed(2)}</div>
        </div>`;
    });
}


// 1. Open the Profile Popup (Listen for clicks on BOTH desktop (.nav-right) AND mobile (.mobile-profile))
document.querySelectorAll('.nav-right, .mobile-profile').forEach(el => {
    // Check if the element exists and add the listener
    if (el) {
        el.addEventListener('click', async (e) => {
            // Stop the click from propagating to the toggle menu function (important for mobile)
            e.stopPropagation();

            await populateProfileForm();

            // Hide the mobile menu if it's open
            document.getElementById("mobileMenu").style.display = "none";

            // Open the profile panel
            document.getElementById('profilePopup').style.display = 'flex';
        });
    }
});

// 2. Close the Profile Popup (This remains the same)
document.getElementById('closeProfileBtn').onclick = () => {
    document.getElementById('profilePopup').style.display = 'none';
};

// ... (rest of your main.js code)

// 3. Populate the form with current data
async function populateProfileForm() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();

        if (response.ok) {
            // Fill the inputs with current data
            document.getElementById('profileUsernameInput').value = data.username;
            // The email is disabled but still populated
            document.getElementById('profileEmailInput').value = data.email;

            // Photo URL display
            const photoURL = data.profilePhotoURL || 'profile.jpg';
            document.getElementById('profilePhotoURLInput').value = photoURL;
            document.getElementById('profilePhotoDisplay').src = photoURL;

            // Update the navbar profile image and name immediately
            updateNavbar(data.username, photoURL);

            // Update localStorage for immediate use across pages
            localStorage.setItem('username', data.username);

        } else {
            alert('Failed to load profile data: ' + data.message);
        }
    } catch (error) {
        console.error('Profile Load Error:', error);
    }
}

// 4. Update Profile Button Click Handler
document.getElementById('updateProfileBtn').addEventListener('click', async () => {
    const newUsername = document.getElementById('profileUsernameInput').value;
    const newPhotoURL = document.getElementById('profilePhotoURLInput').value;
    const currentEmail = document.getElementById('profileEmailInput').value; // Read current email

    if (!newUsername || !currentEmail) {
        return alert("Username and Email cannot be empty.");
    }

    await updateProfile(newUsername, currentEmail, newPhotoURL);
});


// 5. API Call to update the profile data
async function updateProfile(username, email, profilePhotoURL) {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                username: username,
                email: email,
                profilePhotoURL: profilePhotoURL
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            // Update UI elements immediately
            updateNavbar(data.username, data.profilePhotoURL);
            // Update localStorage
            localStorage.setItem('username', data.username);

            document.getElementById('profilePopup').style.display = 'none';
        } else {
            alert('Profile Update Failed: ' + data.message);
        }

    } catch (error) {
        console.error('Profile Update Network Error:', error);
        alert('Could not connect to the server for update.');
    }
}

// 6. Helper function to update Navbar/Mobile Menu
function updateNavbar(username, photoURL) {
    const imgPath = photoURL || 'profile.jpg';
    document.querySelectorAll('.nav-right img, .mobile-profile img').forEach(img => {
        img.src = imgPath;
    });
    document.querySelectorAll('.nav-right span, .mobile-profile span').forEach(span => {
        span.innerText = username;
    });
}


// --- INTEGRATE PROFILE UPDATE WITH INITIAL LOAD ---

// Update your existing loadUserDataAndTransactions function to call updateNavbar
async function loadUserDataAndTransactions() {
    await fetchDashboardSummary();
    await fetchTransactions();

    // Fetch user profile data to set the navbar elements
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        if (response.ok) {
            updateNavbar(data.username, data.profilePhotoURL);
        }
    } catch (e) {
        console.error("Failed to set navbar user info.");
    }

    updateUI();
}