const words = [
    "Ask about reminders, bills, visas, or forms...",
    'Try "Remind me to pay my electricity bill."',
    "Ask me to remind you of anything.",
    "What would you like to organize today?",
    "Need help with reminders or paperwork?",
    "Ask me to schedule, remind, or autofill."
];

let selectedPlaceholder = "";
let charIndex = 0;
let isDeleting = false;
let inputField = null;

function typeEffect() {
    if (!inputField) return;

    const currentWord = selectedPlaceholder;
    
    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }
    
    const displayText = currentWord.substring(0, charIndex);
    
    // 🌟 THE FIX: Append a real vertical line caret directly to the text string!
    // If the box is completely empty, it displays just the caret on the left.
    const cursor = charIndex % 2 ? "|" : "";

inputField.placeholder = displayText + cursor;

    let nextDelay = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        nextDelay = 2500; 
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        let newPlaceholder;

do {
    newPlaceholder = words[Math.floor(Math.random() * words.length)];
} while (newPlaceholder === selectedPlaceholder && words.length > 1);

selectedPlaceholder = newPlaceholder;
 
        nextDelay = 500;  
    }

    setTimeout(typeEffect, nextDelay);
}

// ==========================================================
// 2. AUTOMATIC SIDEBAR HIGHLIGHT ENGINE
// ==========================================================
function highlightActiveSidebarLink() {
    // Get the current page filename from the address bar (e.g., "chatbot.html")
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    // Select all links in your sidebar layout navigation
    const navLinks = document.querySelectorAll("#navi a");
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");

        // If the href matches our current URL, give it the .active class
        if (linkPath === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    highlightActiveSidebarLink();

    inputField = document.getElementById("chatbot-talk");

    if (inputField) {
        selectedPlaceholder =
            words[Math.floor(Math.random() * words.length)];

        typeEffect();
    }
});

const greetings = [
    "How can I help today?",
    "What's on your mind?",
    "Ready when you are.",
    "What are we working on today?",
    "What can I help you create?",
    "Where would you like to start?",
    "Tell me what you need.",
    "Let's build something.",
    "Ask away.",
    "How can I help today?"
];

let randomIndex;
let lastIndex = Number(localStorage.getItem("lastGreeting"));

do {
    randomIndex = Math.floor(Math.random() * greetings.length);
} while (randomIndex === lastIndex && greetings.length > 1);

localStorage.setItem("lastGreeting", randomIndex);

const greeting = document.getElementById("greeting-text");

if (greeting) {
    greeting.textContent = greetings[randomIndex];
}
const form = document.querySelector(".talk");

const attachButton = document.querySelector(".attach-btn");
const menu = document.querySelector(".attach-menu");

if (attachButton && menu) {
    attachButton.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        menu.classList.remove("show");
    });
}

const imageBtn = document.querySelector(".menu-item-upload");
const imageUpload = document.getElementById("imageUpload");

const fileBtn = document.querySelector(".menu-item-file");
const fileUpload = document.getElementById("fileUpload");

imageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    imageUpload.click();
});

imageUpload.addEventListener("change", () => {
    if (imageUpload.files.length) {
        for (const file of imageUpload.files) {
    attachments.push({
    file,
    status: "waiting"
});
}
showAttachment();
        console.log(imageUpload.files);
        showAttachment();
    }
});

document.querySelectorAll(".chip").forEach(chip => {

    chip.addEventListener("click", () => {

        inputField.value = chip.dataset.prompt;

        form.requestSubmit();

    });

});

fileUpload.addEventListener("change", () => {
    if (fileUpload.files.length) {
        const file = fileUpload.files[0];

attachments.push({
    file,
    status: "waiting"
});

showAttachment();
    }
});

const photoBtn = document.querySelector(".menu-item-photo");
const cameraInput = document.getElementById("cameraInput");

photoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    cameraInput.click();
});

cameraInput.addEventListener("change", () => {
    if (cameraInput.files.length) {
        const photo = cameraInput.files[0];

attachments.push({
    file: photo,
    status: "waiting"
});

showAttachment();
    }
});


const scanBtn = document.querySelector(".menu-item-scan");
const scanInput = document.getElementById("scanInput");

scanBtn.addEventListener("click", (e) => {
    e.preventDefault();
    scanInput.click();
});

scanInput.addEventListener("change", () => {
    if (scanInput.files.length) {
        const doc = scanInput.files[0];

attachments.push({
    file: doc,
    status: "waiting"
});

showAttachment();
    }
});



const messages = document.getElementById("messages");

let attachments = [];

function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = type;
    div.textContent = text;

    messages.appendChild(div);
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth"
    });

    return div;
}

function startConversation() {
    document.getElementById("hero").classList.add("hidden");

    document.querySelector(".talk")
        .classList.add("bottom");

    document.querySelector(".chat-container")
        .classList.add("show-fade");
}

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    attachments.forEach(item=>{
    item.status="uploading";
});

showAttachment();

    const message = inputField.value.trim();


    if (!message && attachments.length === 0) return;

    startConversation();

    // Show user's message immediately
    addMessage(message, "user-message");


    inputField.value = "";

    attachments.forEach(item=>{
    item.status="success";
});

showAttachment();

setTimeout(()=>{
  
},1000);
try {

    // Show the thinking animation
    const thinking = document.createElement("div");
thinking.className = "ai-message thinking";

thinking.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
`;

messages.appendChild(thinking);

await new Promise(resolve => setTimeout(resolve, 500));

messages.scrollTop = messages.scrollHeight;

    const formData = new FormData();

formData.append("message", message);

attachments.forEach(item => {
    formData.append("files", item.file);
});

const response = await fetch(
    "https://probable-zebra-96q565gq7xvg2xj69-3000.app.github.dev/chat",
    {
        method: "POST",
        body: formData
    }
);

thinking.remove();

    const data = await response.json();
    
    attachments.forEach(item=>{
    item.status="success";
});

showAttachment();

    await new Promise(resolve => setTimeout(resolve, 300));

    addMessage(data.reply, "ai-message");
    
    attachments=[];

    showAttachment();

} catch (error) {

    attachments.forEach(item=>{
    item.status="error";
});

showAttachment();

    document.querySelector(".thinking")?.remove();

    console.error(error);

    addMessage(
        "Sorry, I couldn't connect to the AI server.",
        "ai-message"
    );

}

// <-- THIS WAS MISSING
});

fileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fileUpload.click();
});

function toggleMenu() {
    const menu = document.getElementById("dropdown-menu");
    const trigger = document.getElementById("menu-trigger");
    
    // Toggle the hidden utility display layout class
    menu.classList.toggle("hidden");
    
    // Toggle accessibility definitions for screen-readers
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", !isExpanded);
}

// Automatically close menu panel if you click outside the dropdown bounds
window.addEventListener("click", function(event) {
    const menu = document.getElementById("dropdown-menu");
    const trigger = document.getElementById("menu-trigger");
    
    if (!trigger.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
    }
});
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".dropdown-item").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
    // You can also add other effects here if needed
  }
});

document.querySelectorAll(".dropdown-item").forEach(item=>{
    item.addEventListener("click",()=>{
        document.getElementById("dropdown-menu")
            .classList.add("hidden");
    });
});

function showAttachment() {

    const container = document.getElementById("attachment-container");

    container.innerHTML = "";

    if (!attachments.length) {
        container.style.display = "none";
        return;
    }

    container.style.display = "flex";

    attachments.forEach((item, index) => {

    const file = item.file;

        const card = document.createElement("div");
        card.className = "attachment-preview";

        if (file.type.startsWith("image/")) {

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    card.appendChild(img);

}else{

    card.innerHTML = `
        <div class="file-card">
            <div class="file-icon">📄</div>
            <div class="file-name">${file.name}</div>
        </div>
    `;
}

        const remove = document.createElement("button");
        remove.className = "remove-attachment";
        remove.innerHTML = "×";

        remove.onclick = () => {
            attachments.splice(index, 1);
            showAttachment();
        };

        card.appendChild(remove);
        
        const status = document.createElement("div");
status.className = "attachment-status";

switch (item.status) {
    case "waiting":
        status.innerHTML = "🕓";
        break;

    case "uploading":
        status.innerHTML = `<div class="upload-spinner"></div>`;
        break;

    case "success":
        status.innerHTML = "✓";
        break;

    case "error":
        status.innerHTML = "⚠";
        break;
}

card.appendChild(status);
container.appendChild(card);

});