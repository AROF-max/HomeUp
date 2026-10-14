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

        /* ==========================================================
       CHAT HISTORY PANEL
    ========================================================== */

    const aiHistoryTrigger =
        document.getElementById(
            "ai-history-trigger"
        );

    const chatHistoryPanel =
        document.getElementById(
            "chat-history-panel"
        );

    const chatHistoryBackdrop =
        document.getElementById(
            "chat-history-backdrop"
        );

    const chatHistoryClose =
        document.getElementById(
            "chat-history-close"
        );


    function openChatHistory() {

    renderChatHistory();

    chatHistoryPanel.classList.add(
        "open"
    );

        chatHistoryBackdrop.classList.add(
            "open"
        );

        aiHistoryTrigger.setAttribute(
            "aria-expanded",
            "true"
        );

        chatHistoryPanel.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeChatHistory() {

        chatHistoryPanel.classList.remove(
            "open"
        );

        chatHistoryBackdrop.classList.remove(
            "open"
        );

        aiHistoryTrigger.setAttribute(
            "aria-expanded",
            "false"
        );

        chatHistoryPanel.setAttribute(
            "aria-hidden",
            "true"
        );

    }
  
        /*
       ======================================================
       RENDER CHAT HISTORY
       ======================================================
    */

    function renderChatHistory() {

    const chatHistoryContent =
        chatHistoryPanel.querySelector(
            ".chat-history-content"
        );

    if (!chatHistoryContent) {
        return;
    }


    /*
       Remove dynamically created
       history items and titles.
    */

    chatHistoryContent
        .querySelectorAll(
            ".chat-history-item, .chat-history-section-title-dynamic"
        )
        .forEach(
            element => element.remove()
        );


    const conversations =
        loadChatHistory();


    /*
       Find the three history views.
    */

    const recentView =
        chatHistoryContent.querySelector(
            '[data-history-view="recent"]'
        );

    const pinnedView =
        chatHistoryContent.querySelector(
            '[data-history-view="pinned"]'
        );

    const trashView =
        chatHistoryContent.querySelector(
            '[data-history-view="trash"]'
        );


    /*
       Make sure every view exists
       before continuing.
    */

    if (
        !recentView ||
        !pinnedView ||
        !trashView
    ) {
        return;
    }


    /*
       Determine which section is active.
       Recent is the default.
    */

    const activeView =
        window.darnaActiveHistoryView ||
        "recent";


    /*
       Hide all three views first.
    */

    recentView.hidden = true;
    pinnedView.hidden = true;
    trashView.hidden = true;


    /*
       Select the correct conversations.
    */

    let selectedConversations = [];


    if (activeView === "pinned") {

        selectedConversations =
            conversations
                .filter(
                    conversation =>
                        conversation.pinned === true &&
                        conversation.deleted !== true
                )
                .sort(
                    (a, b) =>
                        (b.updatedAt || 0) -
                        (a.updatedAt || 0)
                );

        pinnedView.hidden = false;

    }


    else if (activeView === "trash") {

        selectedConversations =
            conversations
                .filter(
                    conversation =>
                        conversation.deleted === true
                )
                .sort(
                    (a, b) =>
                        (b.updatedAt || 0) -
                        (a.updatedAt || 0)
                );

        trashView.hidden = false;

    }


    else {

        selectedConversations =
            conversations
                .filter(
                    conversation =>
                        conversation.pinned !== true &&
                        conversation.deleted !== true
                )
                .sort(
                    (a, b) =>
                        (b.updatedAt || 0) -
                        (a.updatedAt || 0)
                )
                .slice(
                    0,
                    5
                );

        recentView.hidden = false;

    }


    /*
       Find the currently visible view.
    */

    const activeViewElement =
        activeView === "pinned"
            ? pinnedView
            : activeView === "trash"
                ? trashView
                : recentView;


    /*
       Find the empty-state element
       inside the active view.
    */

    const emptyState =
        activeViewElement.querySelector(
            ".chat-history-empty"
        );


    if (emptyState) {

        emptyState.style.display =
            selectedConversations.length === 0
                ? ""
                : "none";

    }


    /*
       Stop here if the section is empty.
    */

    if (
        selectedConversations.length === 0
    ) {

        return;

    }


    /*
       Create each conversation row.
    */

    selectedConversations.forEach(
        conversation => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "chat-history-item";


            /*
               Open conversation.
            */

            let longPressTriggered = false;

item.addEventListener("click", () => {
    if (longPressTriggered) {
        longPressTriggered = false;
        return;
    }

    openConversation(conversation.id);
});


            /*
               Existing temporary delete behavior.
               For now this moves the chat to Trash
               instead of permanently deleting it.
            */

            
let pressTimer = null;

item.addEventListener("contextmenu", event => {
    event.preventDefault();

    showConversationMenu(
        conversation,
        event.clientX,
        event.clientY,
        activeView
    );
});

item.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse") {
        return;
    }

    pressTimer = setTimeout(() => {
        longPressTriggered = true;

        showConversationMenu(
            conversation,
            event.clientX,
            event.clientY,
            activeView,
            true
        );

        // Prevent an accidental swallowed click
        // if the browser does not generate one.
        setTimeout(() => {
            longPressTriggered = false;
        }, 1000);
    }, 600);
});

item.addEventListener("pointerup", () => {
    clearTimeout(pressTimer);
});

item.addEventListener("pointercancel", () => {
    clearTimeout(pressTimer);
});

item.addEventListener("pointerleave", () => {
    clearTimeout(pressTimer);
});



            /*
               Text container.
            */

            const text =
                document.createElement(
                    "div"
                );


            text.className =
                "chat-history-item-text";


            /*
               Chat title.
            */

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "chat-history-item-title";


            title.textContent =
                conversation.title ||
                "New chat";


            /*
               Updated time.
            */

            const preview =
                document.createElement(
                    "div"
                );


            preview.className =
                "chat-history-item-preview";


            const updatedDate =
                conversation.updatedAt
                    ? new Date(
                        conversation.updatedAt
                    )
                    : null;


            let updatedLabel = "";


            if (updatedDate) {

                const now =
                    new Date();


                const isToday =
                    updatedDate.toDateString() ===
                    now.toDateString();


                const yesterday =
                    new Date(now);


                yesterday.setDate(
                    now.getDate() - 1
                );


                const isYesterday =
                    updatedDate.toDateString() ===
                    yesterday.toDateString();


                const time =
                    updatedDate.toLocaleTimeString(
                        [],
                        {
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    );


                if (isToday) {

                    updatedLabel =
                        "Today · " +
                        time;

                }


                else if (isYesterday) {

                    updatedLabel =
                        "Yesterday · " +
                        time;

                }


                else {

                    updatedLabel =
                        updatedDate.toLocaleDateString(
                            [],
                            {
                                month: "short",
                                day: "numeric"
                            }
                        ) +
                        " · " +
                        time;

                }

            }


            preview.textContent =
                updatedLabel;


            text.appendChild(
                title
            );


            text.appendChild(
                preview
            );


            item.appendChild(
                text
            );


            activeViewElement.appendChild(
                item
            );

        }

    );

}

      window.renderChatHistory = renderChatHistory;

        /*
       ======================================================
       OPEN SAVED CONVERSATION
       ======================================================
    */

    function openConversation(
        conversationId
    ) {

        const conversations =
            loadChatHistory();


        const conversation =
            conversations.find(
                item =>
                    item.id ===
                    conversationId
            );


        if (!conversation) {

            return;

        }


        /*
           Make this the active conversation.
        */

        currentConversation =
            conversation;


        /*
           Save the active conversation ID.
        */

        try {

            localStorage.setItem(
                ACTIVE_CHAT_STORAGE_KEY,
                conversation.id
            );

        }
        catch (error) {

            console.error(
                "Daarna: Could not save active chat.",
                error
            );

        }


        /*
           Synchronize AI history.
        */

        currentConversationHistory =
            conversation.messages
                .map(
                    item => ({
                        role:
                            item.role,

                        content:
                            item.content
                    })
                );


        window.currentConversationHistory =
            currentConversationHistory;


        /*
           Clear the current visible chat.
        */

        if (messages) {

            messages.innerHTML = "";

        }
      
        /*
           Switch from welcome screen
           to active conversation.
        */

        if (hero) {

            hero.style.display = "none";

        }

        const suggestions =
            document.querySelector(
                ".suggestions"
            );

        if (suggestions) {

            suggestions.style.display =
                "none";

        }

        const talk =
    document.querySelector(
        ".talk"
    );

if (talk) {
    talk.classList.add(
        "bottom"
    );
}

      const chatContainer =
    document.querySelector(
        ".chat-container"
    );

if (chatContainer) {
    chatContainer.classList.add(
        "show-fade"
    );
}

        /*
           Restore every saved message.
        */

        conversation.messages.forEach(
            item => {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "message-row";


                wrapper.style.display =
                    "flex";

                wrapper.style.flexDirection =
                    "column";

                wrapper.style.margin =
                    "12px 0";


                const isUser =
                    item.role ===
                    "user";


                wrapper.style.alignItems =
                    isUser
                        ? "flex-end"
                        : "flex-start";


                if (isUser) {

                    wrapper.dataset.message =
                        item.content;

                }


                const bubbleContainer =
                    document.createElement(
                        "div"
                    );


                bubbleContainer.style.display =
                    "flex";

                bubbleContainer.style.flexDirection =
                    "column";

                bubbleContainer.style.alignItems =
                    isUser
                        ? "flex-end"
                        : "flex-start";


                const bubble =
                    document.createElement(
                        "div"
                    );


                bubble.className =
                    isUser
                        ? "user-message"
                        : "ai-message";


                if (isUser) {

    bubble.textContent =
        item.content || "";

} else {

    renderAIFormatting(
        bubble,
        item.content || ""
    );

}

bubbleContainer.appendChild(
    bubble
);

/*
   AI ACTIONS
*/

if (
    !isUser
) {

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "ai-message-actions";

    actions.style.display =
        "flex";

    actions.style.gap =
        "10px";

    actions.style.marginTop =
        "6px";


    actions.appendChild(
        createCopyButton(
            item.content || ""
        )
    );


    actions.appendChild(
        createSpeechButton(
            item.content || ""
        )
    );


    actions.appendChild(
        createRetryButton(
            wrapper
        )
    );


    /*
       RESTORE SOURCES
    */

    const sourceButton =
        createSourceButton(
            Array.isArray(item.sources)
                ? item.sources
                : []
        );


    if (sourceButton) {

        actions.appendChild(
            sourceButton
        );

    }


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

            }
        );


        /*
           Close the history panel.
        */

        closeChatHistory();


        /*
           Scroll to the latest message.
        */

        requestAnimationFrame(
            () => {

                scrollToBottom(
                    false
                );

            }
        );

    }

    if (
    aiHistoryTrigger &&
    chatHistoryPanel &&
    chatHistoryBackdrop &&
    chatHistoryClose
) {
    aiHistoryTrigger.addEventListener(
        "click",
        openChatHistory
    );

    chatHistoryClose.addEventListener(
        "click",
        closeChatHistory
    );

    chatHistoryBackdrop.addEventListener(
        "click",
        closeChatHistory
    );


    /*
       HISTORY QUICK ACCESS
    */

    chatHistoryPanel.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".chat-history-quick-btn"
                );

            if (!button) {
                return;
            }


            const targetView =
                button.getAttribute(
                    "data-history-target"
                );

            if (!targetView) {
                return;
            }


            window.darnaActiveHistoryView =
                targetView;


            chatHistoryPanel
                .querySelectorAll(
                    ".chat-history-quick-btn"
                )
                .forEach(
                    otherButton => {

                        otherButton.classList.toggle(
                            "active",
                            otherButton === button
                        );

                    }
                );


            renderChatHistory();

        }
    );


    renderChatHistory();
}

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
    initializeChatInputResize();
    initializeSuggestions();
    initializeDropdown();
    initializeChatScrolling();
  
    try {

    initializeSpeechRecognition();

} catch (error) {

    console.error(
        "HomeUp: Speech initialization failed:",
        error
    );

}

initializeForm();

  console.log(
    "SEND TEST:",
    form,
    form?.querySelector(".send-btn")
);

form?.addEventListener("submit", () => {
    console.log("🔥 SEND CLICK REACHED FORM");
});
  
  const sendButton =
    form?.querySelector(".send-btn");

if (sendButton) {

    sendButton.addEventListener(
        "click",
        () => {

            console.log(
                "SEND BUTTON CLICKED"
            );

        }
    );

}

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
   CHAT HISTORY STORAGE
========================================================== */

const CHAT_HISTORY_STORAGE_KEY =
    "darna-chat-history";

const ACTIVE_CHAT_STORAGE_KEY =
    "darna-active-chat";

let currentConversation =
    null;

let currentConversationHistory =
    [];


function loadChatHistory() {

    try {

        const saved =
            localStorage.getItem(
                CHAT_HISTORY_STORAGE_KEY
            );

        if (!saved) {

            return [];

        }


        const conversations =
            JSON.parse(saved);


        if (
            !Array.isArray(
                conversations
            )
        ) {

            return [];

        }


        return conversations;

    }
    catch (error) {

        console.error(
            "Darna: Could not load chat history.",
            error
        );

        return [];

    }

}


function saveChatHistory(
    conversations
) {

    try {

        localStorage.setItem(
            CHAT_HISTORY_STORAGE_KEY,
            JSON.stringify(
                conversations
            )
        );

    }
    catch (error) {

        console.error(
            "Daarna: Could not save chat history.",
            error
        );

    }

}


function createConversation() {

    const now =
        Date.now();


    return {

        id:
            "chat-" +
            now +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8),

        title:
            "New chat",

        pinned:
            false,

        createdAt:
            now,

        updatedAt:
            now,

        messages:
            []

    };

}


/* ==========================================================
   NEW CHAT BUTTON
   ========================================================== */

const newChatButton = document.getElementById("new-chat-button");

if (newChatButton && !newChatButton.dataset.initialized) {
    newChatButton.dataset.initialized = "true";

    newChatButton.addEventListener("click", event => {
        event.preventDefault();

        const chat = createConversation();
        const chats = loadChatHistory();

        chats.unshift(chat);
        saveChatHistory(chats);

        if (typeof openConversation === "function") {
            openConversation(chat.id);
        }

        if (typeof startConversation === "function") {
            startConversation();
        }

        window.renderChatHistory?.();
    });
}



function showConversationMenu(
    conversation,
    x,
    y,
    view,
    ignoreFirstClick = false
) {
    document
        .getElementById("darna-chat-action-menu")
        ?.remove();

    const menu = document.createElement("div");
    menu.id = "darna-chat-action-menu";

    Object.assign(menu.style, {
        position: "fixed",
        left: Math.max(
            8,
            Math.min(x, window.innerWidth - 205)
        ) + "px",
        top: Math.max(
            8,
            Math.min(y, window.innerHeight - 170)
        ) + "px",
        width: "195px",
        padding: "6px",
        background: "#ffffff",
        color: "#222222",
        border: "1px solid #dddddd",
        borderRadius: "12px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
        zIndex: "99999"
    });

    const actions = view === "trash"
        ? [
            ["Restore chat", "restore"],
            ["Delete permanently", "permanent"]
        ]
        : [
            ["Rename chat", "rename"],
            [
                conversation.pinned
                    ? "Unpin chat"
                    : "Pin chat",
                conversation.pinned
                    ? "unpin"
                    : "pin"
            ],
            ["Delete chat", "trash"]
        ];

    actions.forEach(([label, action]) => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;

        Object.assign(button.style, {
            display: "block",
            width: "100%",
            padding: "11px 10px",
            border: "0",
            borderRadius: "7px",
            background: "transparent",
            color: "inherit",
            textAlign: "left",
            cursor: "pointer",
            fontSize: "14px"
        });

        button.addEventListener("mouseenter", () => {
            button.style.background = "#eeeeee";
        });

        button.addEventListener("mouseleave", () => {
            button.style.background = "transparent";
        });

        button.addEventListener("click", event => {
            event.stopPropagation();

            const chats = loadChatHistory();

            const target = chats.find(chat =>
                chat.id === conversation.id
            );

            if (!target) {
                menu.remove();
                return;
            }

            if (action === "rename") {
                const newTitle = prompt(
                    "Enter a new chat name:",
                    target.title || "New chat"
                );

                if (newTitle === null) {
                    menu.remove();
                    return;
                }

                if (newTitle.trim()) {
                    target.title = newTitle.trim();
                }
            }

            else if (action === "pin") {
                target.pinned = true;
                target.deleted = false;
            }

            else if (action === "unpin") {
                target.pinned = false;
            }

            else if (action === "trash") {
                target.deleted = true;
                target.pinned = false;
            }

            else if (action === "restore") {
                target.deleted = false;
            }

            else if (action === "permanent") {
                const confirmed = confirm(
                    "Permanently delete this chat? This cannot be undone."
                );

                if (!confirmed) {
                    menu.remove();
                    return;
                }

                saveChatHistory(
                    chats.filter(chat =>
                        chat.id !== target.id
                    )
                );

                if (
                    currentConversation?.id === target.id
                ) {
                    currentConversation = null;
                    currentConversationHistory = [];

                    localStorage.removeItem(
                        ACTIVE_CHAT_STORAGE_KEY
                    );
                }

                menu.remove();
                window.renderChatHistory?.();
                return;
            }

            target.updatedAt = Date.now();

saveChatHistory(chats);

menu.remove();

// Refresh the history panel after the menu closes.
requestAnimationFrame(() => {
window.renderChatHistory?.();
});
        });

        menu.appendChild(button);
    });

    document.body.appendChild(menu);

    const closeMenu = event => {
if (!menu.contains(event.target)) {
menu.remove();

    document.removeEventListener(
        "click",
        closeMenu
    );
}

};

menu.addEventListener("click", event => {
event.stopPropagation();
});

document.addEventListener("click", closeMenu);
  
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
   CHAT INPUT AUTO RESIZE
========================================================== */

function initializeChatInputResize() {

    const chatField =
        document.getElementById(
            "chatbot-talk"
        );

    const inputChat =
        document.querySelector(
            ".input-chat"
        );

    const hero =
        document.getElementById(
            "hero"
        );

    if (
        !chatField ||
        !inputChat ||
        !hero
    ) {
        return;
    }

    const BASE_HEIGHT = 52;
    const MAX_HEIGHT = 160;

    function resizeChatInput() {

        chatField.style.height =
            BASE_HEIGHT + "px";

        const requiredHeight =
            Math.min(
                chatField.scrollHeight,
                MAX_HEIGHT
            );

        const isMultiline =
            requiredHeight > BASE_HEIGHT + 2;

        chatField.style.height =
            requiredHeight + "px";

        document
    .querySelector(".chat-container")
    ?.style
    .setProperty(
        "--input-height",
        requiredHeight + "px"
    );

        inputChat.classList.toggle(
            "multiline",
            isMultiline
        );

        if (isMultiline) {

    const growth =
        requiredHeight -
        BASE_HEIGHT;

    const greeting =
        document.getElementById(
            "greeting-text"
        );

    const suggestions =
        document.querySelector(
            ".suggestions"
        );

    if (greeting) {

        greeting.style.transform =
            `translateY(-${growth}px)`;

    }

    if (suggestions) {
    suggestions.style.transform =
        `translateY(${Math.min(growth, 8)}px)`;
}

} else {

    const greeting =
        document.getElementById(
            "greeting-text"
        );

    const suggestions =
        document.querySelector(
            ".suggestions"
        );

    if (greeting) {

        greeting.style.transform =
            "";

    }

    if (suggestions) {

        suggestions.style.transform =
            "";

    }

}
      
    }

    chatField.addEventListener(
        "input",
        resizeChatInput
    );

    chatField.addEventListener(
        "focus",
        resizeChatInput
    );

    resizeChatInput();
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

                clearTimeout(scrollTimer);

                scrollTimer =
                    setTimeout(
                        () => {

                            if (
                                scrollDownBtn
                            ) {

                                scrollDownBtn.classList.remove(
                                    "show"
                                );

                            }

                        },
                        2000
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

    sendButton.disabled = false;

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
    className,
    sources = [],
    files = []
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


    console.log(
        "HOMEUP MESSAGE SOURCES:",
        sources,
        "TEXT:",
        safeText
    );


    wrapper.style.alignItems =
        isUser
            ? "flex-end"
            : "flex-start";


    if (isUser) {

        wrapper.dataset.message =
            safeText;

    }


    /*
       USER IMAGE ATTACHMENTS

       Images are deliberately kept
       OUTSIDE the blue text bubble.
    */

    if (
        isUser &&
        files.length
    ) {

        files.forEach(
            fileItem => {

                if (!fileItem.file) {
    return;
}

const fileType =
    (fileItem.file.type || "").toLowerCase();

const fileName =
    (fileItem.file.name || "").toLowerCase();

const isImage =
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif|heic|heif|tif|tiff)$/i.test(
        fileName
    );

if (!isImage) {
    return;
}

                const imageWrap =
                    document.createElement(
                        "div"
                    );


                imageWrap.style.position =
                    "relative";

                imageWrap.style.display =
                    "block";

                imageWrap.style.width =
                    "180px";

                imageWrap.style.maxWidth =
                    "100%";

                imageWrap.style.borderRadius =
                    "14px";

                imageWrap.style.overflow =
                    "hidden";


                const img =
                    document.createElement(
                        "img"
                    );


                const objectURL =
                    URL.createObjectURL(
                        fileItem.file
                    );


                img.src =
                    objectURL;

                img.alt =
                    fileItem.file.name;


                img.style.display =
                    "block";

                img.style.width =
                    "100%";

                img.style.height =
                    "auto";

                img.style.maxHeight =
                    "240px";

                img.style.objectFit =
                    "contain";


                img.onload = () => {

                    URL.revokeObjectURL(
                        objectURL
                    );

                };


                imageWrap.appendChild(
                    img
                );


                /*
                   PROCESSING SPINNER
                */

                const spinner =
                    document.createElement(
                        "div"
                    );


                spinner.className =
                    "upload-spinner";


                spinner.style.position =
                    "absolute";

                spinner.style.left =
                    "50%";

                spinner.style.top =
                    "50%";

                spinner.style.transform =
                    "translate(-50%, -50%)";

                spinner.style.width =
                    "24px";

                spinner.style.height =
                    "24px";

                spinner.style.borderWidth =
                    "3px";

                spinner.style.opacity =
                    "0";

                spinner.style.pointerEvents =
                    "none";


                imageWrap.appendChild(
                    spinner
                );


                /*
                   IMAGE IS A SIBLING OF
                   THE BLUE BUBBLE
                */

                wrapper.appendChild(
                    imageWrap
                );


                /*
                   SAVE REFERENCES
                   FOR PROCESSING STATE
                */

                fileItem._messageImage =
                    img;

                fileItem._messageSpinner =
                    spinner;

            }
        );

    }


    /*
       TEXT / BUBBLE
    */

    if (
        !isUser ||
        safeText
    ) {

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


        if (
            className ===
            "ai-message"
        ) {

            activeAIWrapper =
                wrapper;


            animateWords(
                bubble,
                safeText
            );

        } else {

            /*
               USER CAPTION
            */

            if (safeText) {

                const caption =
                    document.createElement(
                        "div"
                    );


                caption.textContent =
                    safeText;


                if (files.length) {

                    caption.style.marginTop =
                        "8px";

                }


                bubble.appendChild(
                    caption
                );

            }

        }


        bubbleContainer.appendChild(
            bubble
        );


        /*
           AI ACTIONS
        */

        if (
            className ===
            "ai-message"
        ) {

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "ai-message-actions";


            actions.style.display =
                "flex";

            actions.style.gap =
                "10px";

            actions.style.marginTop =
                "6px";


            actions.appendChild(
                createCopyButton(
                    safeText
                )
            );


            actions.appendChild(
                createSpeechButton(
                    safeText
                )
            );


            actions.appendChild(
                createRetryButton(
                    wrapper
                )
            );


            /*
               SOURCE BUTTON
            */

            const sourceButton =
                createSourceButton(
                    sources
                );


            if (sourceButton) {

                actions.appendChild(
                    sourceButton
                );

            }


            bubbleContainer.appendChild(
                actions
            );

        }


        wrapper.appendChild(
            bubbleContainer
        );

    }


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
   SOURCE BUTTON
========================================================== */

function createSourceButton(
    sources
) {

    if (
        !Array.isArray(sources) ||
        sources.length === 0
    ) {

        return null;

    }


    const button =
        document.createElement("button");


    button.type =
        "button";


    button.className =
        "ai-source-button";


    button.setAttribute(
        "aria-label",
        "View sources"
    );


    /*
       SOURCE ICONS
       Show a maximum of 3.
    */

    const icons =
        document.createElement("span");

    icons.className =
        "ai-source-icons";


    const visibleSources =
        sources.slice(
            0,
            3
        );


    visibleSources.forEach(
        source => {

            const icon =
                document.createElement("img");


            icon.className =
                "ai-source-icon";


            icon.src =
                getSourceFavicon(
                    source.url
                );


            icon.alt =
                "";


            icon.onerror =
                () => {

                    icon.style.display =
                        "none";

                };


            icons.appendChild(
                icon
            );

        }
    );


    /*
       MORE SOURCES
    */

    if (
        sources.length >
        3
    ) {

        const more =
            document.createElement("span");


        more.className =
            "ai-source-more";


        more.textContent =
            "+";


        icons.appendChild(
            more
        );

    }


    button.appendChild(
        icons
    );


    /*
       SOURCE COUNT
    */

    const count =
        document.createElement("span");


    count.className =
        "ai-source-count";


    if (
    sources.length >
    3
) {

    count.textContent =
        "3+";

}
      
    else {

        count.textContent =
            `${sources.length} ${
                sources.length === 1
                    ? "source"
                    : "sources"
            }`;

    }


    button.appendChild(
        count
    );


    /*
       OPEN SOURCE MENU
    */

    button.addEventListener(
    "click",
    () => {

        console.log(
            "HOMEUP: Source button clicked",
            sources
        );

        showSourceMenu(
            sources,
            button
        );

    }
);


    return button;

}

/* ==========================================================
   SOURCE FAVICON
========================================================== */

function getSourceFavicon(
    url
) {

    try {

        const hostname =
            new URL(url).hostname;


        return (
            "https://www.google.com/s2/favicons" +
            `?domain=${encodeURIComponent(hostname)}` +
            "&sz=64"
        );

    }

    catch {

        return "";

    }

}

/* ==========================================================
   SOURCE MENU
========================================================== */

function showSourceMenu(
    sources,
    sourceButton
) {

    /*
       Remove an existing menu first.
    */

    const existingMenu =
    document.querySelector(
        ".ai-source-menu"
    );

if (existingMenu) {

    existingMenu.classList.remove(
        "show"
    );

    existingMenu.classList.add(
        "closing"
    );

    setTimeout(
        () => {

            if (existingMenu) {

                existingMenu.remove();

            }

        },
        200
    );

}


    if (
        !Array.isArray(sources) ||
        !sources.length
    ) {

        return;

    }


    const menu =
        document.createElement("div");


    menu.className =
    "ai-source-menu";
  
    requestAnimationFrame(
    () => {

        menu.classList.add(
            "show"
        );

    }
);

    /*
       SOURCE TITLE
    */

    const header =
    document.createElement("div");

header.className =
    "ai-source-menu-header";


const title =
    document.createElement("div");

title.className =
    "ai-source-menu-title";

title.textContent =
    "Sources";


const closeButton =
    document.createElement("button");

closeButton.type =
    "button";

closeButton.className =
    "ai-source-menu-close";

closeButton.setAttribute(
    "aria-label",
    "Close sources"
);

closeButton.setAttribute(
    "title",
    "Close sources"
);

closeButton.innerHTML =
    "×";


header.appendChild(
    title
);

header.appendChild(
    closeButton
);

menu.appendChild(
    header
);

  function closeSourceMenu() {

    if (!menu) {
        return;
    }


    if (
        menu.classList.contains(
            "closing"
        )
    ) {

        return;

    }


    menu.classList.remove(
        "show"
    );


    menu.classList.add(
        "closing"
    );


    setTimeout(
        () => {

            if (
                menu.parentNode
            ) {

                menu.remove();

            }

        },
        200
    );

}

  closeButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        closeSourceMenu();

    }
);

    /*
       CREATE EVERY SOURCE
    */

    sources.forEach(
        source => {

            if (
                !source ||
                !source.url
            ) {

                return;

            }


            const link =
                document.createElement("a");


            link.className =
                "ai-source-item";


            link.href =
                source.url;


            link.target =
                "_blank";


            link.rel =
                "noopener noreferrer";


            /*
               FAVICON
            */

            const icon =
                document.createElement("img");


            icon.className =
                "ai-source-item-icon";


            icon.src =
                getSourceFavicon(
                    source.url
                );


            icon.alt =
                "";


            icon.onerror =
                () => {

                    icon.style.display =
                        "none";

                };


            /*
               TEXT
            */

            const text =
                document.createElement("div");


            text.className =
                "ai-source-item-text";


            const sourceTitle =
                document.createElement("div");


            sourceTitle.className =
                "ai-source-item-title";


            sourceTitle.textContent =
                source.title ||
                source.url;


            const sourceUrl =
                document.createElement("div");


            sourceUrl.className =
                "ai-source-item-url";


            sourceUrl.textContent =
                source.url;


            text.appendChild(
                sourceTitle
            );


            text.appendChild(
                sourceUrl
            );


            link.appendChild(
                icon
            );


            link.appendChild(
                text
            );


            menu.appendChild(
                link
            );

        }
    );


    /*
       Put the menu directly above
       the source button.
    */

    document.body.appendChild(
        menu
    );


    /*
   CENTER THE SOURCE MENU
   ----------------------
   Use the actual viewport,
   not the source button position.

   This keeps the menu centered on:
   - large screens
   - small screens
   - tablets
   - split screen
*/

menu.style.position =
    "fixed";

menu.style.left =
    "50%";

menu.style.top =
    "55%";

menu.style.right =
    "auto";

menu.style.bottom =
    "auto";

    /*
       Close when clicking elsewhere.
    */

    const closeMenu =
        event => {

            if (
    !menu.contains(
        event.target
    ) &&
    !sourceButton.contains(
        event.target
    )
) {

    closeSourceMenu();

    document.removeEventListener(
        "click",
        closeMenu
    );

}

        };


    setTimeout(
        () => {

            document.addEventListener(
                "click",
                closeMenu
            );

        },
        0
    );

}

/* ==========================================================
   COPY BUTTON
   ========================================================== */

function createCopyButton(text) {

    const button =
        document.createElement("button");


    button.type =


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


    const fullText =
        String(text ?? "");


    element.textContent =
        "";


    const animation = {
        stopped: false,
        timer: null
    };


    activeTypingAnimation =
        animation;


    /*
       Preserve spaces AND line breaks.

       The old version used:
       split(/\s+/)

       which destroyed the AI's formatting.
    */

    const parts =
        fullText.match(
            /\S+|\s+/g
        ) || [];


    let index = 0;


    function nextPart() {

        if (animation.stopped) {

            return;

        }


        if (index >= parts.length) {

            /*
               Formatting is applied after
               the typing animation finishes.
            */

            if (
                activeTypingAnimation ===
                animation
            ) {

                activeTypingAnimation =
                    null;

            }


            renderAIFormatting(
                element,
                fullText
            );


            return;

        }


        element.textContent +=
            parts[index];


        const currentPart =
            parts[index];


        index++;


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


        const hasPunctuation =
            /[.!?]["')\]]?$/.test(
                currentPart
            );


        const delay =
            hasPunctuation
                ? 180
                : 45;


        animation.timer =
            setTimeout(
                nextPart,
                delay
            );

    }


    nextPart();

}


/* ==========================================================
   AI RESPONSE FORMATTING
   ========================================================== */

function renderAIFormatting(
    element,
    text
) {

    element.textContent =
        "";


    const lines =
        String(text ?? "")
            .replace(/\r\n/g, "\n")
            .split("\n");


    let currentList = null;
    let currentListType = null;


    function closeList() {

        if (currentList) {

            element.appendChild(
                currentList
            );

            currentList = null;
            currentListType = null;

        }

    }


    function addInlineContent(
        container,
        line
    ) {

        /*
           Split safely into:
           **bold**
           `code`
           "quoted text"
           and normal text.
        */

        const parts =
            line.split(
                /(\*\*[^*]+\*\*|`[^`]+`)/g
            );


        parts.forEach(
            part => {

                if (
                    /^\*\*[^*]+\*\*$/.test(
                        part
                    )
                ) {

                    const strong =
                        document.createElement(
                            "strong"
                        );


                    strong.textContent =
                        part.slice(
                            2,
                            -2
                        );


                    container.appendChild(
                        strong
                    );


                } else if (
                    /^`[^`]+`$/.test(
                        part
                    )
                ) {

                    const code =
                        document.createElement(
                            "code"
                        );


                    code.textContent =
                        part.slice(
                            1,
                            -1
                        );


                    container.appendChild(
                        code
                    );


                } else {

                    container.appendChild(
                        document.createTextNode(
                            part
                        )
                    );

                }

            }
        );

    }


    lines.forEach(
        rawLine => {

            const line =
                rawLine.trim();


            /*
               Completely blank line.
            */

            if (!line) {

                closeList();

                const spacer =
                    document.createElement(
                        "div"
                    );


                spacer.className =
                    "ai-format-spacer";


                element.appendChild(
                    spacer
                );


                return;

            }


            /*
               Heading
            */

            if (
                /^#{1,3}\s+/.test(
                    line
                )
            ) {

                closeList();


                const heading =
                    document.createElement(
                        "div"
                    );


                heading.className =
                    "ai-format-heading";


                addInlineContent(
                    heading,
                    line.replace(
                        /^#{1,3}\s+/,
                        ""
                    )
                );


                element.appendChild(
                    heading
                );


                return;

            }


            /*
               Bullet list
            */

            const bulletMatch =
                line.match(
                    /^[-*•]\s+(.+)$/
                );


            if (bulletMatch) {

                if (
                    currentListType !==
                    "ul"
                ) {

                    closeList();


                    currentList =
                        document.createElement(
                            "ul"
                        );


                    currentListType =
                        "ul";

                }


                const item =
                    document.createElement(
                        "li"
                    );


                addInlineContent(
                    item,
                    bulletMatch[1]
                );


                currentList.appendChild(
                    item
                );


                return;

            }


            /*
               Numbered list
            */

            const numberedMatch =
                line.match(
                    /^\d+[.)]\s+(.+)$/
                );


            if (numberedMatch) {

                if (
                    currentListType !==
                    "ol"
                ) {

                    closeList();


                    currentList =
                        document.createElement(
                            "ol"
                        );


                    currentListType =
                        "ol";

                }


                const item =
                    document.createElement(
                        "li"
                    );


                addInlineContent(
                    item,
                    numberedMatch[1]
                );


                currentList.appendChild(
                    item
                );


                return;

            }


            /*
               Block quote
            */

            if (
                line.startsWith(">")
            ) {

                closeList();


                const quote =
                    document.createElement(
                        "blockquote"
                    );


                addInlineContent(
                    quote,
                    line.replace(
                        /^>\s?/,
                        ""
                    )
                );


                element.appendChild(
                    quote
                );


                return;

            }


            /*
               Normal paragraph
            */

            closeList();


            const paragraph =
                document.createElement(
                    "p"
                );


            addInlineContent(
                paragraph,
                line
            );


            element.appendChild(
                paragraph
            );

        }
    );


    closeList();

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

      console.log(
    "HOMEUP FRONTEND SOURCES:",
    data.sources
);

        if (thinking) {

            thinking.remove();

        }


        addMessage(
    extractReply(data),
    "ai-message",
    data.sources || []
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
  
    formData.append(
    "calendarEvents",
    localStorage.getItem("homeup-events") || "[]"
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


    const response = await fetch(
    "https://homeup-ai.onrender.com/chat-image",
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
            calendarEvents,

        conversationHistory:
            window.currentConversationHistory || []

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

            console.log(
    "SEND FORM:",
    "isSending =", isSending,
    "message =", inputField?.value
);

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

            console.log(
    "SEND FLOW: passed message check"
);

            startConversation();


/*
   Create a conversation if this
   is the first message.
*/

if (!currentConversation) {

    currentConversation =
        createConversation();

}


/*
   Save the user's message.
*/

currentConversation.messages.push({

    role:
        "user",

    content:
        message,

    timestamp:
        Date.now()

});


currentConversation.updatedAt =
    Date.now();


const conversations =
    loadChatHistory();


const existingIndex =
    conversations.findIndex(
        conversation =>
            conversation.id ===
            currentConversation.id
    );


if (existingIndex === -1) {

    conversations.push(
        currentConversation
    );

}
else {

    conversations[existingIndex] =
        currentConversation;

}


saveChatHistory(
    conversations
);



/*
   Keep the AI request in sync
   with the saved conversation.
*/

currentConversationHistory =
    currentConversation.messages
        .slice(0, -1)
        .map(
            item => ({
                role:
                    item.role,

                content:
                    item.content
            })
        );


window.currentConversationHistory =
    currentConversationHistory;


const userMessage =
    addMessage(
        message,
        "user-message",
        [],
        filesToSend
    );

            if (inputField) {

    inputField.value = "";

    inputField.style.height = "auto";

    inputField.scrollTop = 0;

    inputField.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );

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

            console.log(
    "SEND FLOW: calling sendMessageWithFiles"
);

            await sendMessageWithFiles(
    message,
    filesToSend,
    userMessage
);

        }
    );

}


/* ==========================================================
   SEND MESSAGE + FILES
   ========================================================== */

async function sendMessageWithFiles(
    message,
    files,
    userMessage
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

/*
   SHOW IMAGE PROCESSING STATE
*/

if (files.length) {

    files.forEach(
        item => {

            if (item._messageImage) {

                item._messageImage.style.opacity =
                    "0.55";

            }

            if (item._messageSpinner) {

                item._messageSpinner.style.opacity =
                    "1";

            }

        }
    );

}
  
    const data =
        await requestAI(
            message,
            files,
            currentAbortController.signal
        );

  /*
   RESTORE SENT IMAGE AFTER PROCESSING
*/

if (files.length) {

    files.forEach(
        item => {

            if (item._messageImage) {

                item._messageImage.style.opacity =
                    "1";

            }

            if (item._messageSpinner) {

                item._messageSpinner.style.opacity =
                    "0";

            }

        }
    );

}
  
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

        /* ======================================================
   DISPLAY AI RESPONSE
*/

const aiReply =
    extractReply(data);

  console.log(
    "HOMEUP WEB SOURCES:",
    data.sources
);


addMessage(
    aiReply,
    "ai-message",
    data.sources || []
);


/*
   Save the AI response
   to the current conversation.
*/

if (
    currentConversation
) {

    
const userMessageCount =
    currentConversation.messages.filter(
        item => item.role === "user"
    ).length;

const proposedTitle =
    typeof data?.title === "string"
        ? data.title.trim()
        : "";

if (
    proposedTitle &&
    userMessageCount === 1 &&
    currentConversation.title === "New chat"
) {
    currentConversation.title =
        proposedTitle.slice(0, 60);
}


    currentConversation.messages.push({

    role:
        "assistant",

    content:
        aiReply,

    sources:
        Array.isArray(data.sources)
            ? data.sources
            : [],

    timestamp:
        Date.now()

});

    currentConversation.updatedAt =
        Date.now();


    const conversations =
        loadChatHistory();


    const existingIndex =
        conversations.findIndex(
            conversation =>
                conversation.id ===
                currentConversation.id
        );


    if (
        existingIndex === -1
    ) {

        conversations.push(
            currentConversation
        );

    }
    else {

        conversations[existingIndex] =
            currentConversation;

    }


    saveChatHistory(
        conversations
    );

  


    /*
       Keep the AI conversation
       history synchronized.
    */

    currentConversationHistory =
        currentConversation.messages
            .map(
                item => ({
                    role:
                        item.role,

                    content:
                        item.content
                })
            );


    window.currentConversationHistory =
        currentConversationHistory;

}

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

          /*
   RESTORE SENT IMAGE IF PROCESSING WAS STOPPED
*/

if (files.length) {

    files.forEach(
        item => {

            if (item._messageImage) {

                item._messageImage.style.opacity =
                    "1";

            }

            if (item._messageSpinner) {

                item._messageSpinner.style.opacity =
                    "0";

            }

        }
    );

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
      
        /*
   RESTORE SENT IMAGE AFTER ERROR
*/

if (files.length) {

    files.forEach(
        item => {

            if (item._messageImage) {

                item._messageImage.style.opacity =
                    "1";

            }

            if (item._messageSpinner) {

                item._messageSpinner.style.opacity =
                    "0";

            }

        }
    );

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

// ==========================================================
// SPEECH RECOGNITION
// ==========================================================

let recognition = null;

let isVoiceListening = false;

let voiceText = "";


function initializeSpeechRecognition() {

    if (
        !(
            "SpeechRecognition" in window ||
            "webkitSpeechRecognition" in window
        )
    ) {

        console.warn(
            "HomeUp: Speech Recognition is not supported."
        );

        return;

    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    recognition =
        new SpeechRecognition();


    console.log(
        "HomeUp: Speech Recognition Loaded"
    );


    recognition.lang =
        "en-US";


    /*
       IMPORTANT:

       These are deliberately kept the same
       as your old working version.

       We are NOT using interim results.
    */

    recognition.continuous =
        true;

    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        1;


    // ======================================================
    // START
    // ======================================================

    recognition.onstart = () => {

        isVoiceListening =
            true;


        if (micButton) {

            micButton.classList.add(
                "listening"
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


        console.log(
            "HomeUp: Voice listening started."
        );

    };


    // ======================================================
    // RESULT
    // ======================================================

    recognition.onresult = event => {

        let transcript =
            "";


        /*
           This is intentionally based directly
           on your original working code.
        */

        for (
            let i = 0;
            i < event.results.length;
            i++
        ) {

            transcript +=
                event.results[i][0].transcript;

        }


        transcript =
            transcript.trim();


        if (!transcript) {

            return;

        }


        voiceText =
            transcript;


        if (inputField) {

            inputField.value =
                voiceText;


            inputField.focus();


            try {

                inputField.setSelectionRange(
                    inputField.value.length,
                    inputField.value.length
                );

            }

            catch {}

        }


        console.log(
            "HomeUp: Voice transcript:",
            voiceText
        );

    };


    // ======================================================
    // END
    // ======================================================

    recognition.onend = () => {

        isVoiceListening =
            false;


        if (micButton) {

            micButton.classList.remove(
                "listening"
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


        console.log(
            "HomeUp: Voice listening stopped."
        );

    };


    // ======================================================
    // ERROR
    // ======================================================

    recognition.onerror = event => {

        console.error(
            "HomeUp: Speech recognition error:",
            event.error
        );


        isVoiceListening =
            false;


        if (micButton) {

            micButton.classList.remove(
                "listening"
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

    };


    // ======================================================
    // MICROPHONE BUTTON
    // ======================================================

    if (micButton) {

        /*
           Prevent accidentally attaching the
           listener more than once.
        */

        micButton.onclick =
            handleVoiceButton;

    }

}


// ==========================================================
// VOICE BUTTON
// ==========================================================

function handleVoiceButton() {

    if (!recognition) {

        console.warn(
            "HomeUp: Speech Recognition is unavailable."
        );

        return;

    }


    /*
       If we're listening, the SAME button
       becomes the Stop button.
    */

    if (isVoiceListening) {

        stopVoiceInput();

        return;

    }


    startVoiceInput();

}


// ==========================================================
// START VOICE
// ==========================================================

function startVoiceInput() {

    if (
        !recognition ||
        isVoiceListening
    ) {

        return;

    }


    /*
       Start a fresh voice message.
    */

    voiceText =
        "";


    try {

        recognition.start();

    }

    catch (error) {

        console.warn(
            "HomeUp: Could not start speech recognition.",
            error
        );

    }

}


// ==========================================================
// STOP VOICE
// ==========================================================

function stopVoiceInput() {

    if (!recognition) {

        return;

    }


    console.log(
        "HomeUp: Stopping voice input."
    );


    try {

        recognition.stop();

    }

    catch (error) {

        console.warn(
            "HomeUp: Could not stop speech recognition.",
            error
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