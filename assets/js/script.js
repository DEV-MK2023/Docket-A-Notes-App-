// Import utilities
import { getDate, getSubtitle, emailRegex } from "../utilities/utilities.mjs";

/* -------------------------
   User-Friendly Messages
------------------------- */
const MESSAGES = {
  // Auth-related
  FULL_NAME_SHORT: "Full name must be at least 3 characters long.",
  INVALID_EMAIL: "Please enter a valid email address.",
  WEAK_PASSWORD: "Password must be at least 8 characters long.",
  PASSWORD_MISMATCH: "Your passwords do not match. Please try again.",
  INVALID_LOGIN:
    "The email or password you entered is incorrect. Please try again.",

  // Location & Weather
  GEO_NOT_SUPPORTED: "Your browser does not support location services.",
  GEO_DENIED:
    "Location access denied. Please enable location to see your local weather.",
  WEATHER_FETCH_ERROR:
    "Unable to retrieve weather data at the moment. Please try again later.",
};

/* -------------------------
   Preloader Handling
------------------------- */
const preLoader = document.getElementById("preLoader");

window.addEventListener("load", () => {
  if (preLoader) preLoader.style.display = "none";
});

/* -------------------------
   Authentication Logic
------------------------- */
const authHeading = document.getElementById("authHeading");
const subTitle = document.getElementById("subtitle");
const authForm = document.getElementById("authForm");
const loginPage = document.getElementById("loginPage");
const logoutBtn = document.getElementById("logoutBtn");
const weather = document.getElementById("weather");
const weatherDiv = document.getElementById('weatherDiv')
const weatherMenu = document.getElementById("weatherMenu");

const existingUser = localStorage.getItem("user");
const activeUser = localStorage.getItem("activeUser"); // 🔹 new (persistent session)
const sessionUser = sessionStorage.getItem("user");

/**
 * Show error notification with message
 */
const showError = (message) => {
  const errorNotification = document.getElementById("error-notification");
  const errorText = document.getElementById("error");

  if (!errorNotification || !errorText) return;

  errorNotification.style.display = "block";
  errorText.textContent = message;

  // Hide error after 5 seconds
  setTimeout(() => {
    errorNotification.style.display = "none";
    errorText.textContent = "";
  }, 5000);
};

/**
 * Handle Registration
 */
function setupRegistration() {
  if (!authHeading || !authForm) return;

  authHeading.textContent = "Register";
  subTitle.textContent = getSubtitle();

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(authForm);
    let fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("conformPassword");

    if (fullName.length < 3) return showError(MESSAGES.FULL_NAME_SHORT);
    if (!emailRegex.test(email)) return showError(MESSAGES.INVALID_EMAIL);
    if (password.length < 8) return showError(MESSAGES.WEAK_PASSWORD);
    if (password !== confirmPassword)
      return showError(MESSAGES.PASSWORD_MISMATCH);

    const userData = { fullName, email, password };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("activeUser", JSON.stringify(userData)); // 🔹 set active user
    sessionStorage.setItem("user", JSON.stringify(userData));

    fullName = "";
    document.getElementById("password").value = "";

    if (loginPage) loginPage.style.display = "none";
  });
}

/**
 * Handle Login
 */
function setupLogin() {
  if (!authHeading) return;

  authHeading.textContent = "LogIn";
  subTitle.textContent = getSubtitle();

  // Hide fields not needed for login
  document.getElementById("fullName").style.display = "none";
  document.getElementById("conformPassword").style.display = "none";

  document.getElementById("AuthBtn")?.addEventListener("click", (e) => {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      !storedUser ||
      email !== storedUser.email ||
      password !== storedUser.password
    ) {
      return showError(MESSAGES.INVALID_LOGIN);
    }

    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    sessionStorage.setItem("user", JSON.stringify(storedUser));
    localStorage.setItem("activeUser", JSON.stringify(storedUser)); // 🔹 set active user
    if (loginPage) loginPage.style.display = "none";
  });
}

/**
 * Handle Logout
 */
logoutBtn?.addEventListener("click", () => {
  // remove session and persistent active session
  sessionStorage.removeItem("user");
  localStorage.removeItem("activeUser");

  // force the auth form into Login mode and show auth UI
  setupLogin();
  if (loginPage) loginPage.style.display = "flex";
});


// Initialize authentication flow
(function initAuth() {
  // read storage fresh every time
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  const sessUser = JSON.parse(sessionStorage.getItem("user"));

  if (!storedUser) {
    // no account exists -> show registration
    setupRegistration();
    if (loginPage) loginPage.style.display = "flex";
  } else if (!activeUser && !sessUser) {
    // account exists but nobody is logged in -> show login
    setupLogin();
    if (loginPage) loginPage.style.display = "flex";
  } else {
    // user is logged in via activeUser or session -> hide auth
    if (loginPage) loginPage.style.display = "none";
  }
})();


/* -------------------------
   Profile Menu
------------------------- */
const profileImg = document.getElementById("profileImg");
const profileMenu = document.getElementById("profileMenu");

profileImg?.addEventListener("click", (e) => {
  e.stopPropagation();
  profileMenu?.classList.toggle("show");
});

document.addEventListener("click", () => {
  profileMenu?.classList.remove("show");
});


/* -------------------------
   Notes Handling
------------------------- */
const plusBtn = document.getElementById("plusBtn");
const colors = document.getElementById("colors");
const notes = document.getElementById("notes");
const pinnedNotes = document.getElementById("pinedNotes");
let notesData = JSON.parse(localStorage.getItem("notes")) || [];

// Expand color options on plus button click
plusBtn?.addEventListener("click", () => {
  plusBtn.classList.toggle("rotate");
  colors?.querySelectorAll("*").forEach((el) => el.classList.toggle("show"));
});

// Add new note
colors
  ?.querySelectorAll("*")
  .forEach((colorBtn) =>
    colorBtn.addEventListener("click", () => createNote(colorBtn.dataset.color))
  );

/**
 * Create and save a new note
 */
function createNote(bgColor) {
  const noteObj = {
    id: Date.now(),
    text: "This is a Docket Note.",
    color: bgColor,
    date: new Date(),
    isPined: false,
  };

  notesData.push(noteObj);
  saveNotes();
  renderNote(noteObj);
}

/**
 * Render a single note
 */
function renderNote(noteObj) {
  const note = document.createElement("div");
  note.classList.add("note");
  note.style.backgroundColor = noteObj.color;

  note.innerHTML = `
    <textarea>${noteObj.text}</textarea>
    <div class="date-btn">
      <span>${getDate(noteObj.date)}</span>
      <div class="note-btn">
        <div class="primary-btn noteMenuBtn">
          <i class="fi fi-br-menu-dots"></i>
        </div>
        <ul class="menu noteMenu">
          <li class="pinBtn"><i class="fi fi-rr-thumbtack"></i> <span id="pinBtnText">${noteObj.isPined ? "Unpin" : "Pin"
    }</span></li>
          <li class="deleteBtn"><i class="fi fi-rr-trash"></i> <span>Delete</span></li>
        </ul>
      </div>
    </div>
    ${noteObj.isPined
      ? '<div class="pinIcon"><i class="fi fi-sr-thumbtack"></i></div>'
      : ""
    }
  `;

  // Append to correct container
  if (noteObj.isPined) {
    pinnedNotes.prepend(note);
  } else {
    notes.prepend(note);
  }

  requestAnimationFrame(() => note.classList.add("show"));

  // Text update
  note.querySelector("textarea").addEventListener("input", (e) => {
    noteObj.text = e.target.value;
    saveNotes();
  });

  // Menu toggle
  const noteMenuBtn = note.querySelector(".noteMenuBtn");
  const noteMenu = note.querySelector(".noteMenu");

  noteMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".noteMenu").forEach((menu) => {
      if (menu !== noteMenu) menu.classList.remove("show");
    });
    noteMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => noteMenu.classList.remove("show"));

  // Delete note
  note.querySelector(".deleteBtn").addEventListener("click", () => {
    notesData = notesData.filter((n) => n.id !== noteObj.id);
    note.remove();
    saveNotes();
  });

  // Pin note
  note.querySelector(".pinBtn").addEventListener("click", () => {
    noteObj.isPined = !noteObj.isPined;
    notesData = notesData.filter((n) => n.id !== noteObj.id);
    notesData.unshift(noteObj);
    saveNotes();
    renderAllNotes();
  });
}

/**
 * Render all notes
 */
function renderAllNotes() {
  notes.innerHTML = "";
  pinnedNotes.innerHTML = "";
  notesData.forEach((obj) => renderNote(obj));
}

/**
 * Save notes to localStorage
 */
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notesData));
}

// Initial render
renderAllNotes();

/* -------------------------
   Weather API Integration
------------------------- */
const API = "b738061b1e0c4ccdb07134309250209";

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
}
else {
  alert('Geo Location Not Supported!')
}
async function success(position) {
  let longitude = position.coords.longitude;
  let latitude = position.coords.latitude;
  console.log(longitude, latitude);
  try {
    let res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API}&q=${latitude},${longitude}`);
    let data = await res?.json();
    let celcius = data.current.temp_c;
    let forenheit = data.current.temp_f;

    console.log(data);
    weather.innerHTML = ` <img src="${data.current.condition.icon}" height="35px" width="35px" alt=""> ${celcius}°C`

    weather.addEventListener('click', () => {
      if (weather.innerHTML.includes("°C")) {
        weather.innerHTML = ` <img src="${data.current.condition.icon}" height="35px" width="35px" alt=""> ${forenheit}°F`
      }
      else {
        weather.innerHTML = ` <img src="${data.current.condition.icon}" height="35px" width="35px" alt=""> ${celcius}°C`

      }
    })
    weatherMenu.innerHTML = ` <li>Feels like: ${data.current.feelslike_c}°C</li>
            <li>Humidity: ${data.current.humidity}%</li>
            <li>Wind: ${data.current.wind_kph} kph</li>
            <li>${data.current.condition.text}</li>`

  }
  catch (error) {
    console.log(error?.message);
  }

}
function error() {
  weather.innerHTML = `Allow Location`;

}
weatherDiv.addEventListener('mouseover', () => {
  weatherMenu.classList.toggle("show");
})
weatherDiv.addEventListener('mouseout', () => {
  weatherMenu.classList.remove("show");
})

// Profile Menu 
const profileOverlay = document.getElementById("profileOverlay");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const popupUserName = document.getElementById("popupUserName");
const popupUserEmail = document.getElementById("popupUserEmail");
const popupUserPassword = document.getElementById("popupUserPassword");
const togglePassword = document.getElementById("togglePassword");
const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

document.querySelector("#profileMenu li:first-child")?.addEventListener("click", () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) {
    alert("No user data found!");
    return;
  }

  popupUserName.textContent = storedUser.fullName;
  popupUserEmail.textContent = storedUser.email;
  popupUserPassword.value = storedUser.password;

  profileOverlay.classList.add("active");
});

closeProfileBtn.addEventListener("click", () => profileOverlay.classList.remove("active"));
profileOverlay.addEventListener("click", (e) => {
  if (e.target === profileOverlay) profileOverlay.classList.remove("active");
});

togglePassword.addEventListener("click", () => {
  popupUserPassword.type =
    popupUserPassword.type === "password" ? "text" : "password";
  togglePassword.textContent =
    popupUserPassword.type === "password" ? "👁" : "🙈";
});

editProfileBtn.addEventListener("click", () => {
  popupUserName.contentEditable = "true";
  popupUserPassword.disabled = false;
  editProfileBtn.style.display = "none";
  saveProfileBtn.style.display = "inline-block";
});

saveProfileBtn.addEventListener("click", () => {
  const updatedUser = {
    fullName: popupUserName.textContent.trim(),
    email: popupUserEmail.textContent.trim(),
    password: popupUserPassword.value.trim(),
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));

  popupUserName.contentEditable = "false";
  popupUserPassword.disabled = true;
  editProfileBtn.style.display = "inline-block";
  saveProfileBtn.style.display = "none";

  alert("Profile updated successfully!");
});


// Search Box 

const searchInput = document.querySelector(".input-box input");
const historyList = document.getElementById("history");
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

searchInput.addEventListener("focus", () => {
  searchInput.style.borderTopLeftRadius = "1rem";
  searchInput.style.borderTopRightRadius = "1rem";
  if (searchHistory.length > 0) {
    renderHistory();
    historyList.style.display = "block";

  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    historyList.style.display = "none";
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  if (query) {
    filterNotes(query);
  } else {
    renderAllNotes();
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && searchInput.value.trim() !== "") {
    let recent = searchInput.value.trim();

    if (!searchHistory.includes(recent)) {
      searchHistory.push(recent);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }

    renderHistory();
    filterNotes(recent);
    historyList.style.display = "none";
  }
});

function renderHistory() {
  historyList.innerHTML = "";
  searchHistory.slice(-5).reverse().forEach((item, index) => {
    let li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    let span = document.createElement("span");
    span.textContent = item;
    span.style.cursor = "pointer";

    span.addEventListener("click", () => {
      searchInput.value = item;
      filterNotes(item);
    });

    // ❌ Remove button
    let removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.style.border = "none";
    removeBtn.style.background = "transparent";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "0.8rem";

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent triggering span click
      let actualIndex = searchHistory.length - 1 - index; // correct index in original array
      searchHistory.splice(actualIndex, 1);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      renderHistory();
    });

    li.appendChild(span);
    li.appendChild(removeBtn);
    historyList.appendChild(li);
  });
}


// 🔹 Reusable filter (for notes)
function filterNotes(query) {
  const allNotes = document.querySelectorAll(".note textarea");
  allNotes.forEach((note) => {
    const noteBox = note.closest(".note");
    noteBox.style.display = note.value.toLowerCase().includes(query.toLowerCase())
      ? ""
      : "none";
  });
}

// Initial render of history
// renderHistory();


const popupOverlay = document.getElementById("popupOverlay");
const closePopup = document.getElementById("closePopup");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const popUp = document.querySelector('.popup');
// ⚙️ Open popup when clicking your existing settings button
document.getElementById("settingsBtn").addEventListener("click", () => {
  popupOverlay.style.display = "flex";
  popUp.style.display = "block";
});

// ❌ Close popup
closePopup.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

// Clear search history (localStorage)
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("searchHistory");
  searchHistory = [];
  renderHistory();
  alert("Search history cleared!");
  popupOverlay.style.display = "none";
});

// Delete account (localStorage)
deleteAccountBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
    localStorage.removeItem("user"); // assuming you saved user data under "user"
    localStorage.removeItem("searchHistory");
    searchHistory = [];
    renderHistory();
    alert("Account deleted successfully!");
    popupOverlay.style.display = "none";
    // optionally reload
    location.reload();
  }
});

// Close when clicking outside popup
popupOverlay.addEventListener("click", (e) => {
  if (e.target === popupOverlay) {
    popupOverlay.style.display = "none";
  }
});


const menuBtn = document.getElementById("menuBtn");
const aside = document.querySelector("aside");

menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation(); // button click ko document tak jane se rok lo
  aside?.classList.toggle("active");
});

// Document pe click listener → close if clicked outside
document.addEventListener("click", (e) => {
  if (aside?.classList.contains("active") && !aside.contains(e.target) && e.target !== menuBtn) {
    aside.classList.remove("active");
  }
});


