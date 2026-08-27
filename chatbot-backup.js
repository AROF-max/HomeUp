"use strict";

/* ==========================================================
   HOMEUP CHATBOT
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const API_URL = "https://homeup-ai.onrender.com/chat";

const SEND_ATTACHMENTS_TO_BACKEND = true;


/* ==========================================================
   DOM REFERENCES
   ========================================================== */

let pendingConflictEvent = null;

const PENDING_CONFLICT_KEY =
    "homeup-pending-conflict";

let form = null;
let messages = null;
let inputField = null;

let hero = null;
let greetingText = null;

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
   RESTORE PENDING CONFLICT
========================================================== */

function restorePendingConflict() {

    try {

        const saved =
            localStorage.getItem(
                PENDING_CONFLICT_KEY
            );


        if (!saved) {

            pendingConflictEvent =
                null;

            return;

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            parsed &&
            typeof parsed === "object"
        ) {

            pendingConflictEvent =
                parsed;

            console.log(
                "HomeUp: Restored pending conflict.",
                pendingConflictEvent
            );

        }
        else {

            pendingConflictEvent =
                null;

        }

    }
    catch (error) {

        console.error(
            "HomeUp: Could not restore pending conflict.",
            error
        );

        pendingConflictEvent =
            null;

    }

}


/* ==========================================================
   SAVE PENDING CONFLICT
========================================================== */

function savePendingConflict(
    event
) {

    try {

        if (
            !event
        ) {

            localStorage.removeItem(
                PENDING_CONFLICT_KEY
            );

            pendingConflictEvent =
                null;

            return;

        }


        pendingConflictEvent =
            event;


        localStorage.setItem(
            PENDING_CONFLICT_KEY,
            JSON.stringify(
                event
            )
        );


        console.log(
            "HomeUp: Saved pending conflict.",
            event
        );

    }
    catch (error) {

        console.error(
            "HomeUp: Could not save pending conflict.",
            error
        );

    }

}


/* ==========================================================
   CLEAR PENDING CONFLICT
========================================================== */

function clearPendingConflict() {

    pendingConflictEvent =
        null;


    try {

        localStorage.removeItem(
            PENDING_CONFLICT_KEY
        );

    }
    catch (error) {

        console.error(
            "HomeUp: Could not clear pending conflict.",
            error
        );

    }

}

/* ==========================================================
   AI GENERATION STATE
   ========================================================== */

let isSending = false;

let currentAbortController = null;

let activeTypingAnimation = null;

let activeAIWrapper = null;


/* ==========================================================
   APPLICATION STATE
   ========================================================== */

let attachments = [];

let autoScroll = true;
let scrollTimer = null;

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

    restorePendingConflict();

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

    /*
       Make sure the button starts as SEND.
    */

    setSendButtonState(false);
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
   SEND / STOP BUTTON
   ========================================================== */

function setSendButtonState(
    stopping
) {

    if (!form) return;


    /*
       Find the actual submit button.

       This supports common button structures.
    */

    const sendButton =
        form.querySelector(
            'button[type="submit"]'
        ) ||
        form.querySelector(
            ".send-btn"
        );


    if (!sendButton) {
        return;
    }


    if (stopping) {

        sendButton.classList.add(
            "stop-active"
        );


        sendButton.setAttribute(
            "aria-label",
            "Stop generating"
        );


        sendButton.setAttribute(
            "title",
            "Stop generating"
        );


        sendButton.dataset.mode =
            "stop";


        /*
           ChatGPT-style stop icon:
           simple filled square.
        */

        sendButton.innerHTML = `
            <svg
                class="stop-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
            >
                <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    rx="2"
                />
            </svg>
        `;

    } else {

        sendButton.classList.remove(
            "stop-active"
        );


        sendButton.setAttribute(
            "aria-label",
            "Send message"
        );


        sendButton.setAttribute(
            "title",
            "Send message"
        );


        sendButton.dataset.mode =
            "send";

      sendButton.innerHTML = `
            <svg
            class="send-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
>
    <path d="M12 18V6"/>
    <path d="M7 11l5-5 5 5"/>
</svg>`;

    }
}


/* ==========================================================
   STOP AI GENERATION
   ========================================================== */

function stopAIGeneration() {

    if (!isSending) {
        return;
    }


    console.log(
        "HomeUp: stopping AI generation..."
    );


    /*
       Stop network request.
    */

    if (currentAbortController) {

        try {

            currentAbortController.abort();

        }

        catch (error) {

            console.warn(
                "Abort error:",
                error
            );

        }

    }


    currentAbortController =
        null;


    /*
       Stop word animation.
    */

    stopTypingAnimation();


    /*
       Keep whatever text has already appeared.

       We deliberately DO NOT remove
       activeAIWrapper.
    */

    if (activeAIWrapper) {

        activeAIWrapper.classList.add(
            "generation-stopped"
        );

    }


    /*
       Reset state.
    */

    isSending =
        false;


    setSendButtonState(false);


    /*
       Remove thinking bubble if one exists.
    */

    document
        .querySelectorAll(".thinking-row")
        .forEach(
            bubble => bubble.remove()
        );


    console.log(
        "HomeUp: AI generation stopped."
    );
}


/* ==========================================================
   STOP TYPING ANIMATION
   ========================================================== */

function stopTypingAnimation() {

    if (activeTypingAnimation) {

        activeTypingAnimation.stopped =
            true;


        if (
            activeTypingAnimation.timer
        ) {

            clearTimeout(
                activeTypingAnimation.timer
            );

        }


        activeTypingAnimation =
            null;

    }

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

        activeAIWrapper =
            wrapper;


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
        createSpeechButton(safeText)
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
   TEXT TO SPEECH BUTTON
   ========================================================== */

let currentlySpeakingButton = null;
let currentlySpeakingText = "";


function createSpeechButton(text) {

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "speech-btn";

    button.setAttribute(
        "aria-label",
        "Read message aloud"
    );

    setSpeechIcon(
        button,
        false
    );


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();


            /*
               If THIS message is currently speaking,
               stop it.
            */

            if (
                currentlySpeakingButton ===
                button &&
                window.speechSynthesis.speaking
            ) {

                stopTextToSpeech();

                return;
            }


            /*
               Stop anything else currently speaking.
            */

            stopTextToSpeech();


            if (
                !("speechSynthesis" in window)
            ) {

                console.warn(
                    "Text-to-speech is not supported."
                );

                return;
            }


            const utterance =
                new SpeechSynthesisUtterance(
                    text
                );


            utterance.lang =
                "en-US";


            /*
               Adjust these if you want
               a different voice style.
            */

            utterance.rate =
                1;

            utterance.pitch =
                1;

            utterance.volume =
                1;


            currentlySpeakingButton =
                button;

            currentlySpeakingText =
                text;


            setSpeechIcon(
                button,
                true
            );


            button.classList.add(
                "speaking"
            );


            button.setAttribute(
                "aria-label",
                "Stop reading"
            );


            utterance.onend =
                () => {

                    resetSpeechButton(
                        button
                    );

                };


            utterance.onerror =
                error => {

                    console.error(
                        "Text-to-speech error:",
                        error
                    );

                    resetSpeechButton(
                        button
                    );

                };


            window.speechSynthesis.speak(
                utterance
            );

        }
    );


    return button;
}


/* ==========================================================
   STOP TEXT TO SPEECH
   ========================================================== */

function stopTextToSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }


    if (currentlySpeakingButton) {

        resetSpeechButton(
            currentlySpeakingButton
        );

    }


    currentlySpeakingButton =
        null;

    currentlySpeakingText =
        "";
}


/* ==========================================================
   RESET SPEECH BUTTON
   ========================================================== */

function resetSpeechButton(
    button
) {

    if (!button) {
        return;
    }


    button.classList.remove(
        "speaking"
    );


    setSpeechIcon(
        button,
        false
    );


    button.setAttribute(
        "aria-label",
        "Read message aloud"
    );


    if (
        currentlySpeakingButton ===
        button
    ) {

        currentlySpeakingButton =
            null;

        currentlySpeakingText =
            "";

    }
}


/* ==========================================================
   SPEECH ICON
   ========================================================== */

function setSpeechIcon(
    button,
    speaking
) {

    if (speaking) {

        button.innerHTML = `
            <svg
                class="speech-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    rx="2"
                />
            </svg>
        `;

    } else {

        button.innerHTML = `
            <svg
                class="speech-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 26 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polygon
                    points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                />

                <path
                    d="M19 9c1.2 1.6 1.2 4.4 0 6"
                />

                <path
                    d="M22 6.5c2.2 3.2 2.2 7.8 0 11"
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

            if (isSending) {

                stopAIGeneration();

                return;

            }


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

    /*
       Stop any previous animation first.
    */

    stopTypingAnimation();


    const words =
        String(text ?? "")
            .split(/\s+/)
            .filter(Boolean);


    element.textContent =
        "";


    const animation = {
        stopped: false,
        timer: null
    };


    activeTypingAnimation =
        animation;


    let index = 0;


    function nextWord() {

        if (animation.stopped) {

            return;

        }


        if (index >= words.length) {

            if (
                activeTypingAnimation ===
                animation
            ) {

                activeTypingAnimation =
                    null;

            }

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


        animation.timer =
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


    isSending =
        true;


    setSendButtonState(true);


    startConversation();


    const thinking =
        createThinkingBubble();


    currentAbortController =
        new AbortController();


    try {

        const data =
            await requestAI(
                cleanMessage,
                files,
                currentAbortController.signal
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

        /*
           AbortError means the user clicked STOP.

           Do NOT show an error message.
        */

        if (
            error &&
            error.name === "AbortError"
        ) {

            console.log(
                "AI request stopped by user."
            );


            if (thinking) {

                thinking.remove();

            }


            return;

        }


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

        if (
            currentAbortController
        ) {

            currentAbortController =
                null;

        }


        isSending =
            false;


        setSendButtonState(false);

    }
}


/* ==========================================================
   REQUEST AI
   ========================================================== */

async function requestAI(
    message,
    files,
    signal
) {

    if (
        !files.length ||
        !SEND_ATTACHMENTS_TO_BACKEND
    ) {

        return await fetchJSON(
            message,
            signal
        );

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
                body: formData,
                signal: signal
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
    message,
    signal
) {

    /*
       Read the current HomeUp calendar
       directly from localStorage.

       This is persistent calendar data,
       so it survives conversation resets.
    */

    let calendarEvents = [];

    try {

        calendarEvents =
            JSON.parse(
                localStorage.getItem(
                    "homeup-events"
                ) || "[]"
            );

        if (
            !Array.isArray(
                calendarEvents
            )
        ) {

            calendarEvents = [];

        }

    }
    catch (
        error
    ) {

        console.error(
            "HomeUp: Could not read calendar events.",
            error
        );

        calendarEvents = [];

    }


    /*
       Send both the user's message
       AND the current calendar data.
    */

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

                        message:
                            message,

                        calendarEvents:
                            calendarEvents

                    }),

                signal:
                    signal
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

        return "";

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


            /*
               IMPORTANT:

               If AI is currently generating,
               the same Send button becomes STOP.
            */

            if (isSending) {

                stopAIGeneration();

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


    isSending =
        true;


    setSendButtonState(true);


    const thinking =
        createThinkingBubble();


    currentAbortController =
    new AbortController();


try {

    /*
       ======================================================
       PENDING CONFLICT CONFIRMATION
       ======================================================

       If the user is answering a previous
       "Would you like me to schedule it anyway?"
       question, handle that locally.

       Do NOT send "Yes" or "No" to the AI backend.
    */

    const confirmationText =
        String(
            message || ""
        )
        .trim()
        .toLowerCase();


    if (
        pendingConflictEvent &&
        (
            confirmationText === "yes" ||
            confirmationText === "y" ||
            confirmationText === "yes please" ||
            confirmationText === "yes, please" ||
            confirmationText === "schedule it" ||
            confirmationText === "schedule it anyway" ||
            confirmationText === "do it" ||
            confirmationText === "go ahead"
        )
    ) {

        const eventToSave =
            {
                ...pendingConflictEvent
            };


        /*
           Make sure the event has an ID.
        */

        if (
            !eventToSave.id &&
            typeof createSharedEventId ===
            "function"
        ) {

            eventToSave.id =
                createSharedEventId();

        }


        /*
           Read current calendar events.
        */

        const currentEvents =
            typeof getHomeUpEvents ===
            "function"
                ? getHomeUpEvents()
                : [];


        /*
           Save the previously blocked
           event despite the conflict.
        */

        currentEvents.push(
            eventToSave
        );


        const saved =
            typeof saveHomeUpEvents ===
            "function"
                ? saveHomeUpEvents(
                    currentEvents
                )
                : false;


        if (
            saved
        ) {

            /*
               The conflict has now
               been explicitly accepted.
            */

            pendingConflictEvent =
                null;

            if (
    thinking
) {

    thinking.remove();

}


            /*
               Tell the calendar that
               an event was created.
            */

            window.dispatchEvent(
                new CustomEvent(
                    "homeup-event-created",
                    {
                        detail:
                            eventToSave
                    }
                )
            );


            /*
               Tell the user it worked.
            */

            addMessage(
                `Okay — I scheduled "${eventToSave.title}" for ${eventToSave.date} at ${eventToSave.start}, even though it conflicts with another event.`,
                "ai-message"
            );


            return;

        }


        /*
           Saving failed.
        */

        console.error(
            "HomeUp AI: Could not save confirmed conflicting event."
        );


        clearPendingConflict();


        addMessage(
            "I couldn't save that event. Please try again.",
            "ai-message"
        );


        return;

    }


    /*
       ======================================================
       USER DECLINED THE CONFLICT
       ======================================================
    */

    if (
        pendingConflictEvent &&
        (
            confirmationText === "no" ||
            confirmationText === "n" ||
            confirmationText === "no thanks" ||
            confirmationText === "cancel" ||
            confirmationText === "don't" ||
            confirmationText === "do not"
        )
    ) {

        const cancelledEvent =
            pendingConflictEvent;


        clearPendingConflict();

if (
    thinking
) {

    thinking.remove();

}


addMessage(
    `Okay — I won't schedule "${cancelledEvent.title}".`,
    "ai-message"
);


        return;

    }


    /*
       ======================================================
       NORMAL AI REQUEST
       ======================================================
    */

    const data =
        await requestAI(
            message,
            files,
            currentAbortController.signal
        );
  
        console.log(
    "HOMEUP AI DATA:",
    data
);

console.log(
    "createEventFromAI:",
    typeof createEventFromAI
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


       /* ======================================================
   HOMEUP AI ACTIONS
====================================================== */

if (
    data &&
    data.type === "action"
) {

    /* ==================================================
       CREATE EVENT
    ================================================== */

    if (
    data.action ===
    "create_event"
) {

    if (
        typeof createEventFromAI ===
        "function"
    ) {

        const result =
            createEventFromAI(
                data.data
            );


        /*
           EVENT CONFLICT
        */

        if (
            result &&
            result.conflict ===
            true
        ) {

            console.warn(
                "HomeUp AI: Event conflict detected.",
                result
            );

            savePendingConflict(
    result.proposedEvent
);
          
            /*
               Build a useful message
               for the user.
            */

            let conflictMessage =
                "That event conflicts with ";

            
            const conflicts =
                result.conflicts ||
                [];


            if (
                conflicts.length ===
                1
            ) {

                const conflict =
                    conflicts[0];


                conflictMessage +=
                    `"${conflict.title}"`;


                if (
                    conflict.start
                ) {

                    conflictMessage +=
    ` at ${conflict.start}`;

                }


                if (
                    conflict.end
                ) {

                    conflictMessage +=
    `–${conflict.end}`;

                }

            }
            else if (
                conflicts.length >
                1
            ) {

                conflictMessage +=
                    "these events: ";


                conflictMessage +=
                    conflicts
                        .map(
                            conflict => {

                                let text =
                                    `"${conflict.title}"`;

                                if (
    conflict.start
) {

    text +=
        ` at ${conflict.start}`;

}

                                return text;

                            }
                        )
                        .join(
                            ", "
                        );

            }
            else {

                conflictMessage +=
                    "an existing calendar event";

            }


            conflictMessage +=
                ". Would you like me to schedule it anyway?";


            /*
               Show conflict message
               in the chatbot.
            */

            addMessage(
    conflictMessage,
    "ai-message"
);


            return;

        }


        /*
           NORMAL CREATION FAILURE
        */

        if (
            result ===
            false
        ) {

            console.error(
                "HomeUp AI: Event could not be created.",
                data.data
            );

        }

    }
    else {

        console.error(
            "HomeUp AI: createEventFromAI() is not available."
        );

    }

}

    /* ==================================================
       EDIT EVENT
    ================================================== */

    else if (
        data.action ===
        "edit_event"
    ) {

        if (
            typeof editEventFromAI ===
            "function"
        ) {

            const edited =
                editEventFromAI(
                    data.data
                );


            if (!edited) {

                console.error(
                    "HomeUp AI: Event could not be edited.",
                    data.data
                );

            }

        }
        else {

            console.error(
                "HomeUp AI: editEventFromAI() is not available."
            );

        }

    }


    /* ==================================================
       DELETE EVENT
    ================================================== */

    else if (
        data.action ===
        "delete_event"
    ) {

        if (
            typeof deleteEventFromAI ===
            "function"
        ) {

            const deleted =
                deleteEventFromAI(
                    data.data
                );


            if (!deleted) {

                console.error(
                    "HomeUp AI: Event could not be deleted.",
                    data.data
                );

            }

        }
        else {

            console.error(
                "HomeUp AI: deleteEventFromAI() is not available."
            );

        }

    }

}

        /*
           DISPLAY AI RESPONSE
        */

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

        if (
            error &&
            error.name === "AbortError"
        ) {

            console.log(
                "File request stopped by user."
            );


            if (thinking) {

                thinking.remove();

            }


            return;

        }


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

        currentAbortController =
            null;


        isSending =
            false;


        setSendButtonState(false);

    }

}

/* ==========================================================
   FRESH VOICE INPUT
   ========================================================== */

let voiceRecognition = null;
let voiceSupported = false;
let voiceListening = false;
let voiceStopping = false;

let voiceFinalText = "";

let voiceRestartTimer = null;

/* ==========================================================
   INITIALIZE VOICE RECOGNITION
   ========================================================== */

function initializeSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.warn(
            "HomeUp: Speech recognition is not supported."
        );

        voiceSupported =
            false;

        return;

    }


    voiceSupported =
        true;


    voiceRecognition =
        new SpeechRecognition();


    voiceRecognition.lang =
        "en-US";


    /*
       Keep the recognition session continuous.

       Chrome can still end an individual
       recognition session, so onend below
       will restart it while Voice mode
       is active.
    */

    voiceRecognition.continuous =
        true;


    voiceRecognition.interimResults =
        true;


    voiceRecognition.maxAlternatives =
        1;


    voiceRecognition.onstart =
        () => {

            voiceListening =
                true;

            voiceStopping =
                false;

            updateVoiceButton();

        };


    voiceRecognition.onresult =
        event => {

            handleNewVoiceResult(
                event
            );

        };


    voiceRecognition.onerror =
        event => {

            console.warn(
                "HomeUp voice error:",
                event.error
            );


            /*
               Permission and microphone
               failures should stop voice mode.
            */

            if (
                event.error ===
                "not-allowed" ||
                event.error ===
                "service-not-allowed" ||
                event.error ===
                "audio-capture"
            ) {

                voiceStopping =
                    true;

                voiceListening =
                    false;

                updateVoiceButton();

                return;

            }

        };


    voiceRecognition.onend =
        () => {

            /*
               If the user pressed STOP,
               this is the end of the
               voice session.
            */

            if (voiceStopping) {

                voiceListening =
                    false;

                updateVoiceButton();

                return;

            }


            /*
               Chrome sometimes ends a
               recognition session even
               though the user is still
               speaking.

               Restart it automatically.
            */

            voiceListening =
                false;

            updateVoiceButton();


            clearTimeout(
                voiceRestartTimer
            );


            voiceRestartTimer =
                setTimeout(
                    () => {

                        if (
                            !voiceStopping &&
                            voiceRecognition
                        ) {

                            try {

                                voiceRecognition.start();

                            }

                            catch (error) {

                                console.warn(
                                    "HomeUp: Could not restart voice recognition.",
                                    error
                                );

                            }

                        }

                    },
                    150
                );

        };


    /*
       Voice button
    */

    if (micButton) {

        micButton.addEventListener(
            "click",
            handleNewVoiceButton
        );

    }

}


/* ==========================================================
   VOICE BUTTON
   ========================================================== */

function handleNewVoiceButton() {

    if (!voiceSupported) {

        alert(
            "Voice input is not supported by this browser."
        );

        return;

    }


    /*
       Currently listening:
       clicking the button means STOP.
    */

    if (voiceListening) {

        stopNewVoiceInput();

        return;

    }


    startNewVoiceInput();

}


/* ==========================================================
   START VOICE INPUT
   ========================================================== */

function startNewVoiceInput() {

    if (
        !voiceRecognition ||
        voiceListening
    ) {

        return;

    }


    clearTimeout(
        voiceRestartTimer
    );


    voiceStopping =
        false;


    /*
       Start a fresh transcript only
       when a new Voice session begins.
    */

    voiceFinalText = "";

    voiceResultSlots = [];

    try {

        voiceRecognition.start();

    }

    catch (error) {

        console.warn(
            "HomeUp: Voice recognition could not start.",
            error
        );

    }

}


/* ==========================================================
   PROCESS VOICE RESULTS
   ========================================================== */

function handleNewVoiceResult(event) {

    if (!inputField) {
        return;
    }


    let interimText = "";


    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {

        const result =
            event.results[i];


        if (
            !result ||
            !result[0]
        ) {
            continue;
        }


        const text =
            result[0]
                .transcript
                .trim();


        if (!text) {
            continue;
        }


        if (result.isFinal) {

            /*
               FINAL RESULT

               Add this phrase once to the
               permanent voice transcript.
            */

            if (voiceFinalText) {

                voiceFinalText += " ";

            }


            voiceFinalText += text;

        }

        else {

            /*
               INTERIM RESULT

               This is temporary.

               NEVER add it to voiceFinalText.
            */

            interimText += text;

        }

    }


    /*
       Display:

       permanent final text
       +
       temporary interim text
    */

    inputField.value =
        (
            voiceFinalText +
            (
                interimText
                    ? " " + interimText
                    : ""
            )
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();


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
   STOP VOICE INPUT
   ========================================================== */

function stopNewVoiceInput() {

    voiceStopping =
        true;


    clearTimeout(
        voiceRestartTimer
    );


    if (voiceRecognition) {

        try {

            voiceRecognition.stop();

        }

        catch (error) {

            console.warn(
                "HomeUp: Voice recognition stop failed.",
                error
            );

        }

    }


    voiceListening =
        false;


    /*
       Make sure the final transcript
       remains in the input field.
    */

    if (inputField) {

        inputField.value =
            voiceFinalText.trim();

    }


    updateVoiceButton();

}


/* ==========================================================
   UPDATE VOICE BUTTON
   ========================================================== */

function updateVoiceButton() {

    if (!micButton) {

        return;

    }


    if (voiceListening) {

        micButton.classList.add(
            "voice-active"
        );


        micButton.setAttribute(
            "aria-label",
            "Stop voice input"
        );


        micButton.setAttribute(
            "title",
            "Stop voice input"
        );

    }

    else {

        micButton.classList.remove(
            "voice-active"
        );


        micButton.setAttribute(
            "aria-label",
            "Voice input"
        );


        micButton.setAttribute(
            "title",
            "Voice input"
        );

    }

}

/* ==========================================================
   PAGE CLEANUP
   ========================================================== */

window.addEventListener(
    "pagehide",
    () => {

        clearTimeout(
            placeholderTimer
        );


        stopTypingAnimation();


        if (currentAbortController) {

            try {

                currentAbortController.abort();

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