// ==========================================================
// HOMEUP CHATBOT
// PART 1 - Initialization
// ==========================================================

// ==========================================================
// SPEECH RECOGNITION
// ==========================================================

let audioContext = null;
let analyser = null;
let microphoneStream = null;
let animationFrame = null;

let recognition = null;

if (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    console.log("Speech Recognition Loaded");
    alert("Speech Recognition Loaded");

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

recognition.onstart = () => {

    alert("Listening...");

    const greeting =
        document.getElementById("greeting-text");

    const visualizer =
        document.getElementById("voice-visualizer");

    if (greeting) {
        greeting.classList.add("voice-hidden");
    }

        if (visualizer) {
        visualizer.classList.add("active");
    }

    startVoiceVisualizer();

};

recognition.onend = () => {

    micButton.classList.remove("listening");
    micButton.disabled = false;

    const greeting =
        document.getElementById("greeting-text");

    const visualizer =
        document.getElementById("voice-visualizer");

    if (visualizer) {
        visualizer.classList.remove("active");
    }

    if (greeting) {
        greeting.classList.remove("voice-hidden");
    }

    alert("Stopped listening");

};

recognition.onerror = (event) => {

    micButton.classList.remove("listening");

    micButton.disabled = false;

    console.log("Speech error:", event.error);

    alert("Error: " + event.error);

};

}

// ==========================================================
// VOICE AUDIO VISUALIZER
// ==========================================================

async function startVoiceVisualizer() {

    const visualizer =
        document.getElementById("voice-visualizer");

    if (!visualizer) return;

    try {

        microphoneStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();

        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 256;

        const source =
            audioContext.createMediaStreamSource(
                microphoneStream
            );

        source.connect(analyser);

        const data =
            new Uint8Array(
                analyser.frequencyBinCount
            );

        const bars =
            visualizer.querySelectorAll(".voice-bar");

        function animate() {

            if (!analyser) return;

            analyser.getByteTimeDomainData(data);

            let sum = 0;

            for (let i = 0; i < data.length; i++) {

                const value =
                    (data[i] - 128) / 128;

                sum += value * value;

            }

            const volume =
                Math.sqrt(sum / data.length);

            const intensity =
                Math.min(volume * 8, 1);

            bars.forEach((bar, index) => {

                const wave =
                    Math.sin(
                        Date.now() / 120 +
                        index * 0.7
                    );

                const baseHeight = 8;
                const soundHeight =
                    intensity * 35;

                const height =
                    baseHeight +
                    soundHeight *
                    (0.5 + Math.abs(wave) * 0.5);

                bar.style.height =
                    `${height}px`;

            });

            animationFrame =
                requestAnimationFrame(animate);
        }

        animate();

    } catch (error) {

        console.error(
            "Microphone visualizer error:",
            error
        );

    }

}

// ---------------- Placeholder Text ----------------

const words = [
    "Ask about reminders, bills, visas, or forms...",
    'Try "Remind me to pay my electricity bill."',
    "Ask me to remind you of anything.",
    "What would you like to organize today?",
    "Need help with reminders or paperwork?",
    "Ask me to schedule, remind, or autofill."
];

let inputField = null;
let selectedPlaceholder = "";
let charIndex = 0;
let isDeleting = false;

// ---------------- Greeting ----------------

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

// ---------------- Placeholder Animation ----------------

function typeEffect() {

    if (!inputField) return;

    const word = selectedPlaceholder;

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    const cursor = charIndex % 2 ? "|" : "";

    inputField.placeholder =
        word.substring(0, charIndex) + cursor;

    let delay = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === word.length) {

        isDeleting = true;
        delay = 2500;

    } else if (isDeleting && charIndex === 0) {

        isDeleting = false;

        do {
            selectedPlaceholder =
                words[Math.floor(Math.random() * words.length)];
        }
        while (
            selectedPlaceholder === word &&
            words.length > 1
        );

        delay = 500;
    }

    setTimeout(typeEffect, delay);
}

// ---------------- Sidebar Highlight ----------------

function highlightActiveSidebarLink() {

    const currentPage =
        window.location.pathname.split("/").pop() ||
        "index.html";

    document
        .querySelectorAll("#navi a")
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.getAttribute("href") === currentPage
            );

        });

}

// ---------------- Greeting ----------------

function loadGreeting() {

    let lastGreeting =
        Number(localStorage.getItem("lastGreeting"));

    let random;

    do {

        random =
            Math.floor(
                Math.random() * greetings.length
            );

    } while (
        random === lastGreeting &&
        greetings.length > 1
    );

    localStorage.setItem(
        "lastGreeting",
        random
    );

    const greeting =
        document.getElementById("greeting-text");

    if (greeting) {

        greeting.textContent =
            greetings[random];

    }

}

// ---------------- Page Startup ----------------

window.addEventListener(
    "DOMContentLoaded",
    () => {

        inputField =
            document.getElementById("chatbot-talk");

        highlightActiveSidebarLink();

        loadGreeting();

        if (inputField) {

            selectedPlaceholder =
                words[
                    Math.floor(
                        Math.random() * words.length
                    )
                ];

            typeEffect();

        }

    }
);

// ==========================================================
// PART 2 - Forms, Attachments & Menus
// ==========================================================

const form = document.querySelector(".talk");

const attachButton = document.querySelector(".attach-btn");
const attachMenu = document.querySelector(".attach-menu");
const micButton =
    document.getElementById("micButton");

const imageBtn = document.querySelector(".menu-item-upload");
console.log("imageBtn =", imageBtn);

const photoBtn = document.querySelector(".menu-item-photo");
console.log("photoBtn =", photoBtn);

const scanBtn = document.querySelector(".menu-item-scan");
console.log("scanBtn =", scanBtn);

const fileBtn = document.querySelector(".menu-item-file");
console.log("fileBtn =", fileBtn);

const imageUpload = document.getElementById("imageUpload");
const cameraInput = document.getElementById("cameraInput");
const scanInput = document.getElementById("scanInput");
const fileUpload = document.getElementById("fileUpload");

console.log("imageUpload =", imageUpload);
console.log("imageUpload id:", imageUpload.id);
console.log("imageUpload type:", imageUpload.type);
console.log("cameraInput =", cameraInput);
console.log("scanInput =", scanInput);
console.log("fileUpload =", fileUpload);

let attachments = [];

// ---------------- Attachment Menu ----------------

if (attachButton && attachMenu) {

    attachButton.addEventListener("click", e => {

        e.stopPropagation();
        attachMenu.classList.toggle("show");

    });

    document.addEventListener("click", () => {

        attachMenu.classList.remove("show");

    });

}

// ---------------- Helper ----------------

function addFiles(fileList) {

    [...fileList].forEach(file => {

        attachments.push({
            file,
            status: "waiting"
        });

    });

    showAttachment();

}

// ---------------- Upload Buttons ----------------

if (imageBtn) {
    imageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Image button clicked");

    try {
        imageUpload.click();
        console.log("click() succeeded");
    } catch (err) {
        console.error("CLICK ERROR:", err);
    }

    attachMenu.classList.remove("show");
});
}

if (photoBtn) {
    photoBtn.addEventListener("click", e => {
        e.preventDefault();
        cameraInput.click();
    });
}

if (scanBtn) {
    scanBtn.addEventListener("click", e => {
        e.preventDefault();
        scanInput.click();
    });
}

if (fileBtn) {
    fileBtn.addEventListener("click", e => {
        e.preventDefault();
        fileUpload.click();
    });
}

// ---------------- File Inputs ----------------

imageUpload.addEventListener("change", (e) => {

    console.log("CHANGE FIRED");
    console.log("Files:", e.target.files);
    console.log("Length:", e.target.files.length);

    if (e.target.files.length) {

        attachments.push({
            file: e.target.files[0],
            status: "waiting"
        });

        console.log("Attachments:", attachments);

        showAttachment();
    }

});



if (cameraInput) {
    cameraInput.addEventListener("change", () => {
        if (cameraInput.files.length) {
            addFiles(cameraInput.files);
        }
    });
}

if (scanInput) {
    scanInput.addEventListener("change", () => {
        if (scanInput.files.length) {
            addFiles(scanInput.files);
        }
    });
}

if (fileUpload) {
    fileUpload.addEventListener("change", () => {
        if (fileUpload.files.length) {
            addFiles(fileUpload.files);
        }
    });
}

// ---------------- Suggestion Chips ----------------

document.querySelectorAll(".chip").forEach(chip => {

    chip.addEventListener("click", () => {

        inputField.value = chip.dataset.prompt;

        form.requestSubmit();

    });

});

if (micButton && recognition) {

    micButton.addEventListener("click", () => {

        alert("Mic button clicked");

        setTimeout(() => {
    recognition.start();
}, 100);

    });

}


if (recognition) {

    recognition.onresult = (event) => {

    let transcript = "";

    for (let i = 0; i < event.results.length; i++) {

        transcript += event.results[i][0].transcript;

    }

    inputField.value = transcript.trim();

    inputField.focus();

    // Put the cursor at the end
    inputField.setSelectionRange(
        inputField.value.length,
        inputField.value.length
    );

};

}

// ==========================================================
// Mobile Dropdown Menu
// ==========================================================

function toggleMenu() {

    const menu = document.getElementById("dropdown-menu");
    const trigger = document.getElementById("menu-trigger");

    menu.classList.toggle("hidden");

    trigger.setAttribute(
        "aria-expanded",
        !menu.classList.contains("hidden")
    );

}

window.addEventListener("click", e => {

    const menu = document.getElementById("dropdown-menu");
    const trigger = document.getElementById("menu-trigger");

    if (!menu || !trigger) return;

    if (
        !trigger.contains(e.target) &&
        !menu.contains(e.target)
    ) {
        menu.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
    }

});

// ---------------- Dropdown Highlight ----------------

const currentPage =
    window.location.pathname.split("/").pop();

document.querySelectorAll(".dropdown-item")
.forEach(link => {

    if (link.getAttribute("href") === currentPage)
        link.classList.add("active");

    link.addEventListener("click", () => {

        document
            .getElementById("dropdown-menu")
            .classList.add("hidden");

    });

});

// ==========================================================
// PART 3 - Chat Engine
// ==========================================================

const messages = document.getElementById("messages");

let autoScroll = true;
let scrollTimer;

if (messages) {

messages.addEventListener("scroll", () => {

    scrollDownBtn.classList.remove("show");

    const nearBottom =
        messages.scrollHeight -
        messages.scrollTop -
        messages.clientHeight < 60;

    autoScroll = nearBottom;

    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {

        if (!autoScroll) {
            scrollDownBtn.classList.add("show");
        }

    },350);

});

}

function addMessage(text, className) {

    // Create a row for the message
    const wrapper = document.createElement("div");
    wrapper.className = "message-row";

    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.margin = "12px 0";

    if (className === "user-message") {
        wrapper.style.alignItems = "flex-end";
    } else {
        wrapper.style.alignItems = "flex-start";
    }

    // Holds both the bubble and the copy button
    const bubbleContainer = document.createElement("div");

    bubbleContainer.style.display = "flex";
    bubbleContainer.style.flexDirection = "column";

    if (className === "user-message") {
    wrapper.style.alignItems = "flex-end";
    wrapper.dataset.message = text;
    } else {
        bubbleContainer.style.alignItems = "flex-start";
    }

    // Message bubble
    const bubble = document.createElement("div");
    bubble.className = className;

    if (className === "ai-message") {
        animateWords(bubble, text);
    } else {
        bubble.textContent = text;
    }

    bubbleContainer.appendChild(bubble);

    // Only AI messages get a copy button
    if (className === "ai-message") {

        const copyBtn = document.createElement("button");

        copyBtn.className = "copy-btn";

        copyBtn.innerHTML = `
<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">
<rect x="9" y="9" width="13" height="13" rx="2"/>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>
`;

        copyBtn.style.marginTop = "6px";

        copyBtn.onclick = async () => {

            await navigator.clipboard.writeText(text);
            
            copyBtn.classList.add("success");

            copyBtn.innerHTML = `
<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">
<polyline points="20 6 9 17 4 12"/>
</svg>
`;

            setTimeout(() => {
              
              copyBtn.classList.remove("success");

                copyBtn.innerHTML = `
<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">
<rect x="9" y="9" width="13" height="13" rx="2"/>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>
`;

            }, 1500);

        };

        
        const retryBtn = document.createElement("button");

retryBtn.className = "retry-btn";

retryBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">
<polyline points="1 4 1 10 7 10"/>
<path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>
</svg>
`;

retryBtn.onclick = async () => {

    let previousUser = wrapper.previousElementSibling;

    while (
        previousUser &&
        !previousUser.dataset.message
    ) {
        previousUser = previousUser.previousElementSibling;
    }

    if (!previousUser) return;

    const prompt = previousUser.dataset.message;

    if (!prompt) return;

    // Remove the old AI message
    wrapper.remove();

    // Ask again
    await sendToAI(prompt);

};

const actions = document.createElement("div");

actions.style.display = "flex";
actions.style.gap = "10px";
actions.style.marginTop = "6px";

actions.appendChild(copyBtn);
actions.appendChild(retryBtn);

bubbleContainer.appendChild(actions);

    }

    wrapper.appendChild(bubbleContainer);

    messages.appendChild(wrapper);

    if (autoScroll) {

    messages.scrollTo({

        top: messages.scrollHeight,

        behavior:"smooth"

    });

}

    return wrapper;

}

function startConversation() {

    document
        .getElementById("hero")
        .classList.add("hidden");

    document
        .querySelector(".talk")
        .classList.add("bottom");

    document
        .querySelector(".chat-container")
        .classList.add("show-fade");

}

function createThinkingBubble() {

    const bubble = document.createElement("div");

    bubble.className = "ai-message thinking";

    bubble.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    messages.appendChild(bubble);

    if (autoScroll) {
    messages.scrollTop = messages.scrollHeight;
}

    return bubble;

}

async function sendToAI(message) {

    startConversation();

    const thinking = createThinkingBubble();

    try {

        const response = await fetch(
"https://homeup-ai.onrender.com/chat",
{
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        message: message
    })
});

        const data = await response.json();

        thinking.remove();

        addMessage(data.reply, "ai-message");

    } catch (error) {

        thinking.remove();

        addMessage(
            "Something went wrong. Please try again.",
            "ai-message"
        );

    }

}

if (form) {

    form.addEventListener("submit", async e => {

    e.preventDefault();

    const message = inputField.value.trim();

    if (!message && attachments.length === 0)
        return;

    startConversation();

    addMessage(message, "user-message");

    inputField.value = "";

    attachments.forEach(file => {

        file.status = "uploading";

    });

    showAttachment();

    const thinking = createThinkingBubble();

    try {

        const formData = new FormData();

        formData.append("message", message);

        attachments.forEach(item => {

            formData.append(
                "files",
                item.file
            );

        });

        const response = await fetch(
    "https://homeup-ai.onrender.com/chat",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message
        })
    }
);

        const data = await response.json();

        thinking.remove();

        attachments.forEach(file => {

            file.status = "success";

        });

        showAttachment();

        addMessage(
            data.reply,
            "ai-message"
        );

        setTimeout(() => {

            attachments = [];
            showAttachment();

        }, 800);

    }

    catch (error) {

    console.error(error);

    thinking.remove();

    attachments.forEach(file => {
        file.status = "error";
    });

    showAttachment();

    let errorMessage;

    if (!navigator.onLine) {
        errorMessage = "You're offline. Please reconnect to the internet and try again.";
    } else if (error.name === "AbortError") {
        errorMessage = "The request took too long. Please try again.";
    } else {
        errorMessage = "Something went wrong on our servers. Please try again in a few moments.";
    }

    addMessage(errorMessage, "ai-message");
}

});

} 

const scrollDownBtn =
document.getElementById("scroll-down-btn");

if (scrollDownBtn) {

scrollDownBtn.onclick = () => {

    messages.scrollTo({
        top: messages.scrollHeight,
        behavior:"smooth"
    });

    autoScroll = true;
    scrollDownBtn.classList.remove("show");

};

}

// ==========================================================
// PART 4 - Attachment Preview
// ==========================================================

function showAttachment() {

    const container =
        document.getElementById("attachment-container");
    
    console.log("Container:", container);
    console.log("Attachments:", attachments);

    container.innerHTML = "";

    if (attachments.length === 0) {

        container.style.display = "none";
        return;

    }

    container.style.display = "flex";

    attachments.forEach((item, index) => {

        const card = document.createElement("div");
        card.className = "attachment-preview";

        // ---------------- Preview ----------------

        if (item.file.type.startsWith("image/")) {

            const img = document.createElement("img");

            img.src = URL.createObjectURL(item.file);
            
            img.onload = () => URL.revokeObjectURL(img.src);

            card.appendChild(img);

        } else {

            card.innerHTML = `
                <div class="file-card">
                    <div class="file-icon">📄</div>
                    <div class="file-name">
                        ${item.file.name}
                    </div>
                </div>
            `;

        }
        
        

        // ---------------- Remove Button ----------------

        const remove = document.createElement("button");

        remove.className = "remove-attachment";
        remove.innerHTML = "×";

        remove.onclick = () => {

            attachments.splice(index, 1);
            showAttachment();

        };

        card.appendChild(remove);

        // ---------------- Status ----------------

        const status = document.createElement("div");

        status.className = "attachment-status";

        switch (item.status) {

            case "waiting":
                status.innerHTML = "🕓";
                break;

            case "uploading":
                status.innerHTML =
                    `<div class="upload-spinner"></div>`;
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

}

function animateWords(element, text) {

    const words = text.split(" ");

    element.textContent = "";

    let i = 0;

    function nextWord() {

        if (i >= words.length) return;

        element.textContent +=
            (i === 0 ? "" : " ") + words[i];

        if (autoScroll) {
    messages.scrollTop = messages.scrollHeight;
}
else{
    scrollDownBtn.classList.add("show");
}

        i++;

        const delay =
            words[i - 1].endsWith(".") ||
            words[i - 1].endsWith("?") ||
            words[i - 1].endsWith("!")
                ? 180
                : 45;

        setTimeout(nextWord, delay);

    }

    nextWord();

}