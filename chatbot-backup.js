 "use strict";

/* ==========================================================
   HOMEUP CHATBOT
   COMPLETE JS FILE
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const API_URL = "https://homeup-ai.onrender.com/chat";

// Set false if your backend does not support multipart uploads.
const SEND_ATTACHMENTS_TO_BACKEND = true;


/* ==========================================================
   DOM REFERENCES
   ========================================================== */

let form = null;
let messages = null;
let inputField = null;

let hero = null;
let greetingText = null;
let voiceVisualizer = null;

let scrollDownBtn = null;

let attachButton = null;
let attachMenu = null;

let micButton = null;

let imageBtn = null;
let photoBtn = null;
let scanBtn = null;
let fileBtn = null;

let imageUpload = null;
let cameraInput = null;
let scanInput = null;
let fileUpload = null;


/* ==========================================================
   APPLICATION STATE
   ========================================================== */

let attachments = [];

let autoScroll = true;
let scrollTimer = null;

let isSending = false;


/* ==========================================================
   VOICE STATE
   ========================================================== */

let recognition = null;

let speechSupported = false;
let isListening = false;
let manuallyStopped = false;

let finalTranscript = "";
let interimTranscript = "";

let speechRestartTimer = null;


/* ==========================================================
   VOICE VISUALIZER STATE
   ========================================================== */

let microphoneStream = null;
let audioContext = null;
let analyser = null;
let animationFrame = null;


/* ==========================================================
   PLACEHOLDER
   ========================================================== */

const placeholderWords = [
    "Ask about reminders, bills, visas, or forms...",
    'Try "Remind me to pay my electricity bill."',
    "Ask me to remind you of anything.",
    "What would you like to organize today?",
    "Need help with reminders or paperwork?",
    "Ask me to schedule, remind, or autofill."
];

let selectedPlaceholder = "";
let placeholderIndex = 0;
let isDeletingPlaceholder = false;
let placeholderTimer = null;


/* ==========================================================
   GREETINGS
   ========================================================== */

const greetings = [
    "How can I help today?",
    "What's on your mind?",
    "Ready when you are.",
    "What are we working on today?",
    "What can I help you create?",
    "Where would you like to start?",
    "Tell me what you need.",
    "Let's build something.",
    "Ask away."
];


/* ==========================================================
   STARTUP
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeHomeUp
);


/* ==========================================================
   INITIALIZE
   ========================================================== */

function initializeHomeUp() {

    form =
        document.querySelector(".talk");

    messages =
        document.getElementById("messages");

    inputField =
        document.getElementById("chatbot-talk");

    hero =
        document.getElementById("hero");

    greetingText =
        document.getElementById("greeting-text");

    voiceVisualizer =
        document.getElementById("voice-visualizer");

    scrollDownBtn =
        document.getElementById("scroll-down-btn");

    attachButton =
        document.querySelector(".attach-btn");

    attachMenu =
        document.querySelector(".attach-menu");

    micButton =
        document.getElementById("micButton");

    imageBtn =
        document.querySelector(".menu-item-upload");

    photoBtn =
        document.querySelector(".menu-item-photo");

    scanBtn =
        document.querySelector(".menu-item-scan");

    fileBtn =
        document.querySelector(".menu-item-file");

    imageUpload =
        document.getElementById("imageUpload");

    cameraInput =
        document.getElementById("cameraInput");

    scanInput =
        document.getElementById("scanInput");

    fileUpload =
        document.getElementById("fileUpload");


    console.log("HomeUp chatbot initialized");


    initializeGreeting();
    initializePlaceholder();
    initializeSidebar();
    initializeAttachments();
    initializeSuggestions();
    initializeDropdown();
    initializeChatScrolling();
    initializeSpeechRecognition();
    initializeForm();
}


/* ==========================================================
   SIDEBAR
   ========================================================== */

function initializeSidebar() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase() || "index.html";


    document
        .querySelectorAll("#navi a")
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) return;

            link.classList.toggle(
                "active",
                href.toLowerCase() === currentPage
            );

        });
}


/* ==========================================================
   GREETING
   ========================================================== */

function initializeGreeting() {

    if (!greetingText) return;


    let previous =
        Number(
            localStorage.getItem(
                "homeup_last_greeting"
            )
        );


    if (
        !Number.isInteger(previous) ||
        previous < 0 ||
        previous >= greetings.length
    ) {
        previous = -1;
    }


    let randomIndex;


    do {

        randomIndex =
            Math.floor(
                Math.random() *
                greetings.length
            );

    } while (
        randomIndex === previous &&
        greetings.length > 1
    );


    localStorage.setItem(
        "homeup_last_greeting",
        randomIndex
    );


    greetingText.textContent =
        greetings[randomIndex];
}


/* ==========================================================
   PLACEHOLDER
   ========================================================== */

function initializePlaceholder() {

    if (!inputField) return;

    selectedPlaceholder =
        getRandomPlaceholder();

    placeholderIndex = 0;
    isDeletingPlaceholder = false;

    runPlaceholderAnimation();
}


function getRandomPlaceholder() {

    return placeholderWords[
        Math.floor(
            Math.random() *
            placeholderWords.length
        )
    ];
}


function runPlaceholderAnimation() {

    if (!inputField) return;

    const word =
        selectedPlaceholder;

    if (!word) return;


    if (isDeletingPlaceholder) {

        placeholderIndex--;

    } else {

        placeholderIndex++;

    }


    inputField.placeholder =
        word.substring(
            0,
            placeholderIndex
        );


    let delay =
        isDeletingPlaceholder
            ? 35
            : 60;


    if (
        !isDeletingPlaceholder &&
        placeholderIndex >= word.length
    ) {

        placeholderIndex =
            word.length;

        isDeletingPlaceholder =
            true;

        delay = 2500;

    }


    else if (
        isDeletingPlaceholder &&
        placeholderIndex <= 0
    ) {

        placeholderIndex = 0;

        isDeletingPlaceholder =
            false;


        let nextPlaceholder;

        do {

            nextPlaceholder =
                getRandomPlaceholder();

        } while (
            nextPlaceholder === word &&
            placeholderWords.length > 1
        );


        selectedPlaceholder =
            nextPlaceholder;

        delay = 500;

    }


    clearTimeout(
        placeholderTimer
    );


    placeholderTimer =
        setTimeout(
            runPlaceholderAnimation,
            delay
        );
}


/* ==========================================================
   START CONVERSATION
   ========================================================== */

function startConversation() {

    if (hero) {
        hero.classList.add("hidden");
    }


    if (form) {
        form.classList.add("bottom");
    }


    const chatContainer =
        document.querySelector(".chat-container");


    if (chatContainer) {

        chatContainer.classList.add(
            "show-fade"
        );

    }
}


/* ==========================================================
   ATTACHMENT MENU
   ========================================================== */

function initializeAttachments() {

    if (attachButton && attachMenu) {

        attachButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                attachMenu.classList.toggle("show");

            }
        );


        document.addEventListener(
            "click",
            event => {

                if (
                    !attachMenu.contains(event.target) &&
                    !attachButton.contains(event.target)
                ) {

                    attachMenu.classList.remove("show");

                }

            }
        );

    }


    if (imageBtn && imageUpload) {

        imageBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeAttachmentMenu();

                imageUpload.click();

            }
        );

    }


    if (photoBtn && cameraInput) {

        photoBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeAttachmentMenu();

                cameraInput.click();

            }
        );

    }


    if (scanBtn && scanInput) {

        scanBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeAttachmentMenu();

                scanInput.click();

            }
        );

    }


    if (fileBtn && fileUpload) {

        fileBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeAttachmentMenu();

                fileUpload.click();

            }
        );

    }


    if (imageUpload) {

        imageUpload.addEventListener(
            "change",
            event => {

                addFiles(event.target.files);

                event.target.value = "";

            }
        );

    }


    if (cameraInput) {

        cameraInput.addEventListener(
            "change",
            event => {

                addFiles(event.target.files);

                event.target.value = "";

            }
        );

    }


    if (scanInput) {

        scanInput.addEventListener(
            "change",
            event => {

                addFiles(event.target.files);

                event.target.value = "";

            }
        );

    }


    if (fileUpload) {

        fileUpload.addEventListener(
            "change",
            event => {

                addFiles(event.target.files);

                event.target.value = "";

            }
        );

    }


    showAttachment();
}


function closeAttachmentMenu() {

    if (attachMenu) {

        attachMenu.classList.remove("show");

    }
}


/* ==========================================================
   ADD FILES
   ========================================================== */

function addFiles(fileList) {

    if (!fileList || !fileList.length) {
        return;
    }


    Array.from(fileList).forEach(file => {

        if (!file) return;


        const duplicate =
            attachments.some(
                item =>
                    item.file.name === file.name &&
                    item.file.size === file.size &&
                    item.file.lastModified ===
                        file.lastModified
            );


        if (duplicate) return;


        attachments.push({
            file: file,
            status: "waiting"
        });

    });


    showAttachment();
}


/* ==========================================================
   SHOW ATTACHMENTS
   ========================================================== */

function showAttachment() {

    const container =
        document.getElementById(
            "attachment-container"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!attachments.length) {

        container.style.display = "none";

        return;

    }


    container.style.display = "flex";


    attachments.forEach(
        (item, index) => {

            const card =
                document.createElement("div");

            card.className =
                "attachment-preview";


            if (
                item.file.type &&
                item.file.type.startsWith("image/")
            ) {

                const img =
                    document.createElement("img");

                const objectURL =
                    URL.createObjectURL(item.file);

                img.src = objectURL;
                img.alt = item.file.name;

                img.onload = () => {

                    URL.revokeObjectURL(
                        objectURL
                    );

                };

                card.appendChild(img);

            } else {

                const fileCard =
                    document.createElement("div");

                fileCard.className =
                    "file-card";


                const icon =
                    document.createElement("div");

                icon.className =
                    "file-icon";

                icon.textContent =
                    getFileIcon(item.file);


                const name =
                    document.createElement("div");

                name.className =
                    "file-name";

                name.textContent =
                    item.file.name;


                fileCard.appendChild(icon);
                fileCard.appendChild(name);

                card.appendChild(fileCard);

            }


            const remove =
                document.createElement("button");

            remove.type = "button";

            remove.className =
                "remove-attachment";

            remove.setAttribute(
                "aria-label",
                "Remove " + item.file.name
            );

            remove.textContent = "×";


            remove.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    attachments.splice(index, 1);

                    showAttachment();

                }
            );


            card.appendChild(remove);


            const status =
                document.createElement("div");

            status.className =
                "attachment-status";


            if (item.status === "waiting") {

                status.textContent = "🕓";

            }

            else if (item.status === "uploading") {

                status.innerHTML =
                    `<div class="upload-spinner"></div>`;

            }

            else if (item.status === "success") {

                status.textContent = "✓";

            }

            else if (item.status === "error") {

                status.textContent = "⚠";

            }


            card.appendChild(status);

            container.appendChild(card);

        }
    );
}


/* ==========================================================
   FILE ICON
   ========================================================== */

function getFileIcon(file) {

    const type =
        file.type || "";


    if (type.includes("pdf")) return "📕";

    if (
        type.includes("word") ||
        type.includes("document")
    ) {
        return "📘";
    }

    if (
        type.includes("spreadsheet") ||
        type.includes("excel")
    ) {
        return "📗";
    }

    if (type.includes("text")) return "📄";

    return "📎";
}


/* ==========================================================
   SUGGESTION CHIPS
   ========================================================== */

function initializeSuggestions() {

    document
        .querySelectorAll(".chip")
        .forEach(chip => {

            chip.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const prompt =
                        chip.dataset.prompt;


                    if (!prompt || !inputField) {
                        return;
                    }


                    inputField.value =
                        prompt;


                    if (form) {

                        form.requestSubmit();

                    }

                }
            );

        });
}


/* ==========================================================
   MOBILE DROPDOWN / MENU
   ========================================================== */

function initializeDropdown() {

    const menu =
        document.getElementById(
            "dropdown-menu"
        );


    const trigger =
        document.getElementById(
            "menu-trigger"
        );


    if (!menu || !trigger) {

        console.warn(
            "HomeUp: dropdown menu elements not found."
        );

        return;

    }


    /*
       IMPORTANT:

       We deliberately DO NOT add another click
       listener if the HTML already contains:

       onclick="toggleMenu()"

       Otherwise the menu would open and immediately
       close because it gets toggled twice.
    */


    const inlineHandler =
        trigger.getAttribute("onclick");


    if (!inlineHandler) {

        trigger.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                toggleMenu();

            }
        );

    }


    document.addEventListener(
        "click",
        event => {

            if (
                !trigger.contains(event.target) &&
                !menu.contains(event.target)
            ) {

                closeDropdown();

            }

        }
    );


    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    document
        .querySelectorAll(".dropdown-item")
        .forEach(link => {

            const href =
                link.getAttribute("href");


            if (
                href &&
                href.toLowerCase() === currentPage
            ) {

                link.classList.add("active");

            }


            link.addEventListener(
                "click",
                () => {

                    closeDropdown();

                }
            );

        });

}


/* ==========================================================
   TOGGLE MENU
   ========================================================== */

function toggleMenu() {

    const menu =
        document.getElementById(
            "dropdown-menu"
        );


    const trigger =
        document.getElementById(
            "menu-trigger"
        );


    if (!menu || !trigger) {
        return;
    }


    /*
       Supports either:

       class="hidden"

       or

       aria-expanded
    */

    const currentlyHidden =
        menu.classList.contains("hidden");


    if (currentlyHidden) {

        menu.classList.remove("hidden");

        trigger.setAttribute(
            "aria-expanded",
            "true"
        );

    } else {

        closeDropdown();

    }

}


/* ==========================================================
   CLOSE MENU
   ========================================================== */

function closeDropdown() {

    const menu =
        document.getElementById(
            "dropdown-menu"
        );


    const trigger =
        document.getElementById(
            "menu-trigger"
        );


    if (menu) {

        menu.classList.add("hidden");

    }


    if (trigger) {

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/*
   Make toggleMenu globally available.

   This is important if your HTML still contains:

   onclick="toggleMenu()"
*/

window.toggleMenu =
    toggleMenu;


/* ==========================================================
   CHAT SCROLLING
   ========================================================== */

function initializeChatScrolling() {

    if (!messages) return;


    messages.addEventListener(
        "scroll",
        () => {

            const distanceFromBottom =
                messages.scrollHeight -
                messages.scrollTop -
                messages.clientHeight;


            autoScroll =
                distanceFromBottom < 60;


            if (scrollDownBtn) {

                scrollDownBtn.classList.remove(
                    "show"
                );

            }


            clearTimeout(scrollTimer);


            scrollTimer =
                setTimeout(
                    () => {

                        if (
                            !autoScroll &&
                            scrollDownBtn
                        ) {

                            scrollDownBtn.classList.add(
                                "show"
                            );

                        }

                    },
                    350
                );

        }
    );


    if (scrollDownBtn) {

        scrollDownBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                scrollToBottom(true);

                autoScroll = true;

                scrollDownBtn.classList.remove(
                    "show"
                );

            }
        );

    }

}


/* ==========================================================
   SCROLL TO BOTTOM
   ========================================================== */

function scrollToBottom(
    smooth = true
) {

    if (!messages) return;


    messages.scrollTo({

        top:
            messages.scrollHeight,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


/* ==========================================================
   ADD MESSAGE
   ========================================================== */

function addMessage(
    text,
    className
) {

    if (!messages) return null;


    const safeText =
        typeof text === "string"
            ? text
            : String(text ?? "");


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-row";


    wrapper.style.display =
        "flex";

    wrapper.style.flexDirection =
        "column";

    wrapper.style.margin =
        "12px 0";


    const isUser =
        className === "user-message";


    wrapper.style.alignItems =
        isUser
            ? "flex-end"
            : "flex-start";


    if (isUser) {

        wrapper.dataset.message =
            safeText;

    }


    const bubbleContainer =
        document.createElement("div");


    bubbleContainer.style.display =
        "flex";

    bubbleContainer.style.flexDirection =
        "column";

    bubbleContainer.style.alignItems =
        isUser
            ? "flex-end"
            : "flex-start";


    const bubble =
        document.createElement("div");


    bubble.className =
        className;


    if (className === "ai-message") {

        animateWords(
            bubble,
            safeText
        );

    } else {

        bubble.textContent =
            safeText;

    }


    bubbleContainer.appendChild(
        bubble
    );


    if (className === "ai-message") {

        const actions =
            document.createElement("div");


        actions.className =
            "ai-message-actions";


        actions.style.display =
            "flex";

        actions.style.gap =
            "10px";

        actions.style.marginTop =
            "6px";


        actions.appendChild(
            createCopyButton(safeText)
        );


        actions.appendChild(
            createRetryButton(wrapper)
        );


        bubbleContainer.appendChild(
            actions
        );

    }


    wrapper.appendChild(
        bubbleContainer
    );


    messages.appendChild(
        wrapper
    );


    if (autoScroll) {

        requestAnimationFrame(
            () => {

                scrollToBottom(true);

            }
        );

    }


    return wrapper;
}


/* ==========================================================
   COPY BUTTON
   ========================================================== */

function createCopyButton(text) {

    const button =
        document.createElement("button");


    button.type =
        "button";


    button.className =
        "copy-btn";


    button.setAttribute(
        "aria-label",
        "Copy message"
    );


    setCopyIcon(
        button,
        false
    );


    button.addEventListener(
        "click",
        async () => {

            try {

                await copyText(text);

                button.classList.add(
                    "success"
                );

                setCopyIcon(
                    button,
                    true
                );


                setTimeout(
                    () => {

                        button.classList.remove(
                            "success"
                        );

                        setCopyIcon(
                            button,
                            false
                        );

                    },
                    1500
                );

            }

            catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );


    return button;
}


/* ==========================================================
   COPY TEXT
   ========================================================== */

async function copyText(text) {

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        await navigator.clipboard.writeText(
            text
        );

        return;

    }


    const textarea =
        document.createElement("textarea");


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    document.execCommand("copy");


    textarea.remove();
}


/* ==========================================================
   COPY ICON
   ========================================================== */

function setCopyIcon(
    button,
    success
) {

    if (success) {

        button.innerHTML = `
            <svg
                class="copy-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;

    } else {

        button.innerHTML = `
            <svg
                class="copy-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                />
                <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                />
            </svg>
        `;

    }
}


/* ==========================================================
   RETRY
   ========================================================== */

function createRetryButton(
    aiWrapper
) {

    const button =
        document.createElement("button");


    button.type =
        "button";


    button.className =
        "retry-btn";


    button.setAttribute(
        "aria-label",
        "Retry response"
    );


    button.innerHTML = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>
        </svg>
    `;


    button.addEventListener(
        "click",
        async () => {

            if (isSending) return;


            const userMessage =
                findPreviousUserMessage(
                    aiWrapper
                );


            if (!userMessage) return;


            aiWrapper.remove();


            await sendToAI(
                userMessage
            );

        }
    );


    return button;
}


/* ==========================================================
   FIND PREVIOUS USER MESSAGE
   ========================================================== */

function findPreviousUserMessage(
    aiWrapper
) {

    let current =
        aiWrapper.previousElementSibling;


    while (current) {

        if (
            current.dataset &&
            current.dataset.message
        ) {

            return current.dataset.message;

        }


        current =
            current.previousElementSibling;

    }


    return "";
}


/* ==========================================================
   THINKING BUBBLE
   ========================================================== */

function createThinkingBubble() {

    if (!messages) return null;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-row thinking-row";


    wrapper.style.display =
        "flex";

    wrapper.style.flexDirection =
        "column";

    wrapper.style.alignItems =
        "flex-start";

    wrapper.style.margin =
        "12px 0";


    const bubble =
        document.createElement("div");


    bubble.className =
        "ai-message thinking";


    bubble.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;


    wrapper.appendChild(
        bubble
    );


    messages.appendChild(
        wrapper
    );


    if (autoScroll) {

        scrollToBottom(true);

    }


    return wrapper;
}


/* ==========================================================
   AI WORD ANIMATION
   ========================================================== */

function animateWords(
    element,
    text
) {

    const words =
        String(text ?? "")
            .split(/\s+/)
            .filter(Boolean);


    element.textContent =
        "";


    let index = 0;


    function nextWord() {

        if (index >= words.length) {
            return;
        }


        element.textContent +=
            (
                index === 0
                    ? ""
                    : " "
            ) +
            words[index];


        if (autoScroll) {

            requestAnimationFrame(
                () => {

                    scrollToBottom(false);

                }
            );

        } else if (scrollDownBtn) {

            scrollDownBtn.classList.add(
                "show"
            );

        }


        const currentWord =
            words[index];


        index++;


        const hasPunctuation =
            /[.!?]$/.test(
                currentWord
            );


        const delay =
            hasPunctuation
                ? 180
                : 45;


        setTimeout(
            nextWord,
            delay
        );

    }


    nextWord();
}


/* ==========================================================
   SEND TO AI
   ========================================================== */

async function sendToAI(
    message,
    files = []
) {

    const cleanMessage =
        String(message ?? "").trim();


    if (
        !cleanMessage &&
        !files.length
    ) {
        return;
    }


    if (isSending) {
        return;
    }


    isSending = true;


    startConversation();


    const thinking =
        createThinkingBubble();


    try {

        const data =
            await requestAI(
                cleanMessage,
                files
            );


        if (thinking) {
            thinking.remove();
        }


        addMessage(
            extractReply(data),
            "ai-message"
        );

    }


    catch (error) {

        console.error(
            "HomeUp AI error:",
            error
        );


        if (thinking) {
            thinking.remove();
        }


        addMessage(
            getFriendlyError(error),
            "ai-message"
        );

    }


    finally {

        isSending = false;

    }
}


/* ==========================================================
   REQUEST AI
   ========================================================== */

async function requestAI(
    message,
    files
) {

    if (
        !files.length ||
        !SEND_ATTACHMENTS_TO_BACKEND
    ) {

        return await fetchJSON(message);

    }


    const formData =
        new FormData();


    formData.append(
        "message",
        message
    );


    files.forEach(
        item => {

            formData.append(
                "files",
                item.file,
                item.file.name
            );

        }
    );


    const response =
        await fetch(
            API_URL,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const errorText =
            await safeResponseText(
                response
            );


        const error =
            new Error(
                `Server returned ${response.status}`
            );


        error.status =
            response.status;


        error.serverMessage =
            errorText;


        throw error;

    }


    return await parseResponse(
        response
    );
}


/* ==========================================================
   JSON REQUEST
   ========================================================== */

async function fetchJSON(
    message
) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            60000
        );


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message: message
                        }),

                    signal:
                        controller.signal
                }
            );


        if (!response.ok) {

            const errorText =
                await safeResponseText(
                    response
                );


            const error =
                new Error(
                    `Server returned ${response.status}`
                );


            error.status =
                response.status;


            error.serverMessage =
                errorText;


            throw error;

        }


        return await parseResponse(
            response
        );

    }


    finally {

        clearTimeout(timeout);

    }
}


/* ==========================================================
   PARSE RESPONSE
   ========================================================== */

async function parseResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        return await response.json();

    }


    const text =
        await response.text();


    try {

        return JSON.parse(text);

    }

    catch {

        return {
            reply: text
        };

    }
}


/* ==========================================================
   SAFE RESPONSE TEXT
   ========================================================== */

async function safeResponseText(
    response
) {

    try {

        return await response.text();

    }

    catch {

        return "";

    }
}


/* ==========================================================
   EXTRACT REPLY
   ========================================================== */

function extractReply(
    data
) {

    if (!data) {

        return "I didn't receive a response from the AI.";

    }


    if (
        typeof data.reply === "string" &&
        data.reply.trim()
    ) {

        return data.reply.trim();

    }


    if (
        typeof data.message === "string" &&
        data.message.trim()
    ) {

        return data.message.trim();

    }


    if (
        typeof data.response === "string" &&
        data.response.trim()
    ) {

        return data.response.trim();

    }


    if (
        typeof data.output === "string" &&
        data.output.trim()
    ) {

        return data.output.trim();

    }


    return "I received a response, but I couldn't read the AI message.";
}


/* ==========================================================
   FRIENDLY ERROR
   ========================================================== */

function getFriendlyError(
    error
) {

    if (!navigator.onLine) {

        return (
            "You're offline. " +
            "Please reconnect to the internet and try again."
        );

    }


    if (
        error &&
        error.name === "AbortError"
    ) {

        return (
            "The request took too long. " +
            "Please try again."
        );

    }


    if (
        error &&
        error.status === 413
    ) {

        return (
            "That file or message is too large. " +
            "Please try a smaller file."
        );

    }


    if (
        error &&
        (
            error.status === 415 ||
            error.status === 400
        )
    ) {

        return (
            "The server could not process that request. " +
            "Please check the message or attachment and try again."
        );

    }


    if (
        error &&
        error.status >= 500
    ) {

        return (
            "HomeUp's server is having trouble right now. " +
            "Please try again in a moment."
        );

    }


    return (
        "Something went wrong while contacting HomeUp AI. " +
        "Please try again."
    );
}


/* ==========================================================
   FORM
   ========================================================== */

function initializeForm() {

    if (!form) {

        console.error(
            "HomeUp: .talk form not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (isSending) {
                return;
            }


            const message =
                inputField
                    ? inputField.value.trim()
                    : "";


            const filesToSend =
                attachments.slice();


            if (
                !message &&
                !filesToSend.length
            ) {

                return;

            }


            /*
               Stop voice WITHOUT clearing the text.
            */

            if (isListening) {

                stopListening(false);

            }


            startConversation();


            if (message) {

                addMessage(
                    message,
                    "user-message"
                );

            }


            if (inputField) {

                inputField.value = "";

            }


            if (filesToSend.length) {

                attachments.forEach(
                    item => {

                        item.status =
                            "uploading";

                    }
                );


                showAttachment();

            }


            await sendMessageWithFiles(
                message,
                filesToSend
            );

        }
    );

}


/* ==========================================================
   SEND MESSAGE + FILES
   ========================================================== */

async function sendMessageWithFiles(
    message,
    files
) {

    if (isSending) {
        return;
    }


    isSending = true;


    const thinking =
        createThinkingBubble();


    try {

        const data =
            await requestAI(
                message,
                files
            );


        if (thinking) {
            thinking.remove();
        }


        if (files.length) {

            attachments.forEach(
                item => {

                    const wasSent =
                        files.some(
                            sent =>
                                sent.file === item.file
                        );


                    if (wasSent) {

                        item.status =
                            "success";

                    }

                }
            );


            showAttachment();

        }


        addMessage(
            extractReply(data),
            "ai-message"
        );


        if (files.length) {

            setTimeout(
                () => {

                    attachments =
                        attachments.filter(
                            item =>
                                item.status !==
                                "success"
                        );


                    showAttachment();

                },
                900
            );

        }

    }


    catch (error) {

        console.error(
            "Send error:",
            error
        );


        if (thinking) {
            thinking.remove();
        }


        if (files.length) {

            attachments.forEach(
                item => {

                    const wasSent =
                        files.some(
                            sent =>
                                sent.file === item.file
                        );


                    if (wasSent) {

                        item.status =
                            "error";

                    }

                }
            );


            showAttachment();

        }


        addMessage(
            getFriendlyError(error),
            "ai-message"
        );

    }


    finally {

        isSending = false;

    }

}


/* ==========================================================
   ==========================================================
   VOICE RECOGNITION
   ==========================================================
   ========================================================== */


/* ==========================================================
   INITIALIZE VOICE
   ========================================================== */

function initializeSpeechRecognition() {

    if (!micButton) {

        console.warn(
            "HomeUp: #micButton not found."
        );

        return;

    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.warn(
            "Speech recognition is not supported."
        );


        speechSupported =
            false;


        micButton.disabled =
            true;


        micButton.setAttribute(
            "aria-label",
            "Speech recognition is not supported"
        );


        return;

    }


    speechSupported =
        true;


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    /*
       IMPORTANT:

       We intentionally use non-continuous recognition.
       Android Chrome is much more reliable this way.

       When it ends while the user is still listening,
       we start it again automatically.
    */

    recognition.continuous =
        false;


    recognition.interimResults =
        true;


    recognition.maxAlternatives =
        1;


    recognition.onstart =
        handleSpeechStart;


    recognition.onresult =
        handleSpeechResult;


    recognition.onerror =
        handleSpeechError;


    recognition.onend =
        handleSpeechEnd;


    /*
       ONE click listener only.
    */

    micButton.addEventListener(
        "click",
        handleMicButton
    );


    micButton.setAttribute(
        "aria-pressed",
        "false"
    );


    console.log(
        "HomeUp voice recognition initialized"
    );
}


/* ==========================================================
   MICROPHONE BUTTON
   ========================================================== */

async function handleMicButton(
    event
) {

    event.preventDefault();
    event.stopPropagation();


    if (!speechSupported) {
        return;
    }


    /*
       If currently listening,
       clicking again means STOP.
    */

    if (isListening) {

        stopListening(true);

        return;

    }


    /*
       Otherwise START.
    */

    await startListening();
}


/* ==========================================================
   START LISTENING
   ========================================================== */

async function startListening() {

    if (!recognition) {
        return;
    }


    if (isListening) {
        return;
    }


    clearTimeout(
        speechRestartTimer
    );


    manuallyStopped =
        false;


    /*
       Start a fresh recognition session.

       DO NOT erase existing typed text.
       This allows voice to continue after typed text.
    */

    finalTranscript =
        inputField
            ? inputField.value.trim()
            : "";


    interimTranscript =
        "";


    try {

        /*
           Request microphone permission.
           This is especially important on Android.
        */

        await requestMicrophone();

    }


    catch (error) {

        console.error(
            "Microphone permission error:",
            error
        );


        manuallyStopped =
            true;


        setMicVisualState(false);

        return;

    }


    try {

        recognition.start();

    }


    catch (error) {

        console.error(
            "Speech recognition could not start:",
            error
        );

    }
}


/* ==========================================================
   MICROPHONE PERMISSION
   ========================================================== */

async function requestMicrophone() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        throw new Error(
            "Microphone API unavailable."
        );

    }


    const stream =
        await navigator.mediaDevices.getUserMedia(
            {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            }
        );


    /*
       This stream is ONLY for permission.

       The visualizer creates its own stream.
    */

    stream
        .getTracks()
        .forEach(
            track => track.stop()
        );
}


/* ==========================================================
   SPEECH START
   ========================================================== */

function handleSpeechStart() {

    isListening =
        true;


    setMicVisualState(true);


    if (greetingText) {

        greetingText.classList.add(
            "voice-hidden"
        );

    }


    if (voiceVisualizer) {

        voiceVisualizer.classList.add(
            "active"
        );

    }


    startVoiceVisualizer();


    console.log(
        "HomeUp speech started"
    );
}


/* ==========================================================
   SPEECH RESULT
   ========================================================== */

function handleSpeechResult(
    event
) {

    if (!inputField) {
        return;
    }


    let sessionFinal =
        "";


    let sessionInterim =
        "";


    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {

        const result =
            event.results[i];


        const transcript =
            result[0].transcript;


        if (result.isFinal) {

            sessionFinal +=
                transcript;

        } else {

            sessionInterim +=
                transcript;

        }

    }


    /*
       Add finalized words permanently.
    */

    if (sessionFinal) {

        finalTranscript =
            (
                finalTranscript +
                " " +
                sessionFinal
            ).trim();

    }


    interimTranscript =
        sessionInterim;


    /*
       THIS is what gets displayed.

       Final speech + current interim speech.
    */

    inputField.value =
        (
            finalTranscript +
            (
                interimTranscript
                    ? " " +
                      interimTranscript
                    : ""
            )
        ).trim();


    inputField.focus();


    try {

        inputField.setSelectionRange(
            inputField.value.length,
            inputField.value.length
        );

    }

    catch {}
}


/* ==========================================================
   SPEECH ERROR
   ========================================================== */

function handleSpeechError(
    event
) {

    console.error(
        "Speech recognition error:",
        event.error
    );


    /*
       Permission denied.
    */

    if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
    ) {

        manuallyStopped =
            true;


        isListening =
            false;


        setMicVisualState(false);


        stopVoiceVisualizer();


        return;

    }


    /*
       Microphone unavailable.
    */

    if (
        event.error === "audio-capture"
    ) {

        manuallyStopped =
            true;


        isListening =
            false;


        setMicVisualState(false);


        stopVoiceVisualizer();


        return;

    }


    /*
       "no-speech" is not fatal.

       If the user still has the mic active,
       the recognition session will restart.
    */

    if (
        event.error === "no-speech"
    ) {

        return;

    }


    /*
       Network errors can happen on Android.

       Keep the transcript.
    */

    if (
        event.error === "network"
    ) {

        console.warn(
            "Speech recognition network error."
        );

    }
}


/* ==========================================================
   SPEECH END
   ========================================================== */

function handleSpeechEnd() {

    console.log(
        "Speech recognition ended"
    );


    isListening =
        false;


    setMicVisualState(false);


    stopVoiceVisualizer();


    if (voiceVisualizer) {

        voiceVisualizer.classList.remove(
            "active"
        );

    }


    if (greetingText) {

        greetingText.classList.remove(
            "voice-hidden"
        );

    }


    /*
       If the user DID NOT press the microphone
       to stop, automatically restart.

       This is what makes Android Chrome's
       non-continuous recognition behave like
       continuous recognition.
    */

    if (!manuallyStopped) {

        clearTimeout(
            speechRestartTimer
        );


        speechRestartTimer =
            setTimeout(
                () => {

                    if (
                        !manuallyStopped &&
                        !isListening
                    ) {

                        startRecognitionAgain();

                    }

                },
                250
            );


        return;

    }


    /*
       User intentionally stopped.

       Only finalized speech is used.
    */

    interimTranscript =
        "";


    if (inputField) {

        inputField.value =
            finalTranscript.trim();

    }


    /*
       Do NOT automatically submit here.

       The user can now look at/edit the
       transcription before pressing Send.
    */

    console.log(
        "Final voice text:",
        finalTranscript
    );
}


/* ==========================================================
   RESTART RECOGNITION
   ========================================================== */

async function startRecognitionAgain() {

    if (
        manuallyStopped ||
        isListening ||
        !recognition
    ) {

        return;

    }


    try {

        recognition.start();

    }


    catch (error) {

        /*
           InvalidStateError can happen if
           Chrome thinks recognition is already
           starting. Wait and try once more.
        */

        console.warn(
            "Speech restart failed:",
            error
        );


        clearTimeout(
            speechRestartTimer
        );


        speechRestartTimer =
            setTimeout(
                () => {

                    if (
                        !manuallyStopped &&
                        !isListening
                    ) {

                        try {

                            recognition.start();

                        }

                        catch (retryError) {

                            console.warn(
                                "Second speech restart failed:",
                                retryError
                            );

                        }

                    }

                },
                500
            );

    }
}


/* ==========================================================
   STOP LISTENING
   ========================================================== */

function stopListening(
    keepText = true
) {

    manuallyStopped =
        true;


    clearTimeout(
        speechRestartTimer
    );


    if (keepText && inputField) {

        /*
           Preserve whatever is currently visible.
        */

        const currentText =
            inputField.value.trim();


        if (currentText) {

            finalTranscript =
                currentText;

        }

    }


    interimTranscript =
        "";


    if (recognition) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.warn(
                "Speech stop error:",
                error
            );

        }

    }


    isListening =
        false;


    setMicVisualState(false);


    stopVoiceVisualizer();


    if (voiceVisualizer) {

        voiceVisualizer.classList.remove(
            "active"
        );

    }


    if (greetingText) {

        greetingText.classList.remove(
            "voice-hidden"
        );

    }


    if (inputField) {

        inputField.value =
            finalTranscript.trim();

    }


    console.log(
        "Voice manually stopped"
    );
}


/* ==========================================================
   MIC VISUAL STATE
   ========================================================== */

function setMicVisualState(
    active
) {

    if (!micButton) {
        return;
    }


    micButton.classList.toggle(
        "listening",
        active
    );


    micButton.setAttribute(
        "aria-pressed",
        String(active)
    );

}


/* ==========================================================
   VOICE VISUALIZER
   ========================================================== */

async function startVoiceVisualizer() {

    if (!voiceVisualizer) {
        return;
    }


    /*
       Don't create multiple streams.
    */

    if (microphoneStream) {
        return;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        return;

    }


    try {

        microphoneStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                }
            );


        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContextClass) {

            stopVoiceVisualizer();

            return;

        }


        audioContext =
            new AudioContextClass();


        if (
            audioContext.state ===
            "suspended"
        ) {

            await audioContext.resume();

        }


        analyser =
            audioContext.createAnalyser();


        analyser.fftSize =
            256;


        analyser.smoothingTimeConstant =
            0.65;


        const source =
            audioContext.createMediaStreamSource(
                microphoneStream
            );


        source.connect(
            analyser
        );


        const bufferLength =
            analyser.frequencyBinCount;


        const frequencyData =
            new Uint8Array(
                bufferLength
            );


        const timeData =
            new Uint8Array(
                analyser.fftSize
            );


        const bars =
            voiceVisualizer.querySelectorAll(
                ".voice-bar"
            );


        if (!bars.length) {

            return;

        }


        const currentHeights =
            new Array(
                bars.length
            ).fill(6);


        function animate() {

            if (
                !analyser ||
                !isListening
            ) {

                return;

            }


            analyser.getByteFrequencyData(
                frequencyData
            );


            analyser.getByteTimeDomainData(
                timeData
            );


            let sum =
                0;


            for (
                let i = 0;
                i < timeData.length;
                i++
            ) {

                const value =
                    (
                        timeData[i] -
                        128
                    ) / 128;


                sum +=
                    value * value;

            }


            const rms =
                Math.sqrt(
                    sum /
                    timeData.length
                );


            let volume =
                Math.min(
                    1,
                    rms * 4.5
                );


            bars.forEach(
                (bar, index) => {

                    const start =
                        Math.floor(
                            index *
                            bufferLength /
                            bars.length
                        );


                    const end =
                        Math.max(
                            start + 1,
                            Math.floor(
                                (
                                    index + 1
                                ) *
                                bufferLength /
                                bars.length
                            )
                        );


                    let total = 0;
                    let count = 0;


                    for (
                        let i = start;
                        i < end;
                        i++
                    ) {

                        total +=
                            frequencyData[i];

                        count++;

                    }


                    const frequencyLevel =
                        count
                            ? total /
                              count /
                              255
                            : 0;


                    let level =
                        (
                            volume * 0.75
                        ) +
                        (
                            frequencyLevel * 0.9
                        );


                    level =
                        Math.min(
                            1,
                            level
                        );


                    level =
                        Math.pow(
                            level,
                            0.65
                        );


                    const minHeight = 6;
                    const maxHeight = 55;


                    const variation =
                        0.75 +
                        (
                            Math.sin(
                                index * 1.7 +
                                performance.now() /
                                120
                            ) * 0.25
                        );


                    let targetHeight =
                        minHeight +
                        (
                            level *
                            maxHeight *
                            variation
                        );


                    targetHeight =
                        Math.max(
                            minHeight,
                            Math.min(
                                maxHeight,
                                targetHeight
                            )
                        );


                    currentHeights[index] +=
                        (
                            targetHeight -
                            currentHeights[index]
                        ) *
                        0.35;


                    bar.style.height =
                        `${currentHeights[index]}px`;


                    bar.style.opacity =
                        `${0.5 + level * 0.5}`;

                }
            );


            animationFrame =
                requestAnimationFrame(
                    animate
                );

        }


        animate();

    }


    catch (error) {

        console.error(
            "Voice visualizer error:",
            error
        );


        /*
           Visualizer failure does NOT
           stop speech recognition.
        */

        stopVoiceVisualizer();

    }
}


/* ==========================================================
   STOP VISUALIZER
   ========================================================== */

function stopVoiceVisualizer() {

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }


    if (microphoneStream) {

        microphoneStream
            .getTracks()
            .forEach(
                track => {

                    try {

                        track.stop();

                    }

                    catch {}

                }
            );


        microphoneStream =
            null;

    }


    if (audioContext) {

        try {

            audioContext.close();

        }

        catch {}

        audioContext =
            null;

    }


    analyser =
        null;


    if (voiceVisualizer) {

        voiceVisualizer
            .querySelectorAll(
                ".voice-bar"
            )
            .forEach(
                bar => {

                    bar.style.height =
                        "6px";

                    bar.style.opacity =
                        "0.5";

                }
            );

    }
}


/* ==========================================================
   PAGE CLEANUP
   ========================================================== */

window.addEventListener(
    "pagehide",
    () => {

        manuallyStopped =
            true;


        clearTimeout(
            speechRestartTimer
        );


        clearTimeout(
            placeholderTimer
        );


        stopVoiceVisualizer();


        if (recognition) {

            try {

                recognition.stop();

            }

            catch {}

        }

    }
);


/* ==========================================================
   GLOBAL ERROR LOGGING
   ========================================================== */

window.addEventListener(
    "error",
    event => {

        console.error(
            "HomeUp JavaScript error:",
            event.error ||
            event.message
        );

    }
);


/* ==========================================================
   END
   ========================================================== */