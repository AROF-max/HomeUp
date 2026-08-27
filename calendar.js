"use strict";

/* ==========================================================
   HOMEUP CALENDAR.JS
   COMPLETE VERSION
   STEP 4 — EVENT CATEGORIES + CUSTOM COLORS
========================================================== */


/* ==========================================================
   GLOBAL STATE
========================================================== */

let currentDate = new Date();

let selectedDuration = "forever";

let calendarView = "month";

let events = JSON.parse(
    localStorage.getItem("homeup-events") || "[]"
);



/* ==========================================================
   REPEAT EVENT STATE
========================================================== */

let selectedRepeat = "none";

let repeatDailyInterval = 1;
let repeatWeeklyInterval = 1;
let repeatMonthlyInterval = 1;
let repeatYearlyInterval = 1;

let repeatWeekdays = [];

let repeatDuration = "forever";

let repeatCount = null;

let repeatUntil = null;

/*
   Day View scale.

   60 minutes = 80 pixels
*/
const DAY_VIEW_PIXELS_PER_HOUR = 80;

const DAY_VIEW_PIXELS_PER_MINUTE =
    DAY_VIEW_PIXELS_PER_HOUR / 60;


/* ==========================================================
   EVENT CATEGORIES
========================================================== */

/*
   No emojis are used anywhere.
   Every category uses an SVG icon.
*/

const EVENT_CATEGORIES = {

    family: {
        name: "Family",
        color: "#22c55e",
        icon: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <circle
                    cx="9"
                    cy="7"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />
                <path
                    d="M22 21v-2a4 4 0 0 0-3-3.87"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
                <path
                    d="M16 3.13a4 4 0 0 1 0 7.75"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        `
    },


    work: {
        name: "Work",
        color: "#3b82f6",
        icon: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <rect
                    x="3"
                    y="7"
                    width="18"
                    height="13"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />
                <path
                    d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
                <path
                    d="M3 12h18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />
            </svg>
        `
    },


    health: {
        name: "Health",
        color: "#ef4444",
        icon: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                />
                <path
                    d="M8 12h2l1-3 2 6 1-3h2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        `
    },


    school: {
        name: "School",
        color: "#8b5cf6",
        icon: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="m3 10 9-5 9 5-9 5-9-5Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                />
                <path
                    d="M7 12.5V17c2.5 2 7.5 2 10 0v-4.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
                <path
                    d="M21 10v6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        `
    },
  
    sports: {
    name: "Sports",
    color: "#f97316",
    icon: `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            />

            <path
                d="M3 12h18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            />

            <path
                d="M7 5.5c1.5 1.5 2.5 3.5 2.5 6.5S8.5 17 7 18.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />

            <path
                d="M17 5.5c-1.5 1.5-2.5 3.5-2.5 6.5s1 5 2.5 6.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />
        </svg>
    `
},

    travel: {
        name: "Travel",
        color: "#06b6d4",
icon: `
<svg viewBox="0 0 24 24"
     xmlns="http://www.w3.org/2000/svg"
     aria-hidden="true">

    <path
        d="
        M12 2.2
        C11.2 2.2 10.7 2.9 10.6 3.8
        L10.5 8.2

        L2.9 12.7
        C2.4 13 2.2 13.5 2.3 14
        C2.4 14.5 2.9 14.7 3.4 14.6

        L9.9 12.9
        L9.7 17.2

        L6.3 19.4
        C5.9 19.7 5.8 20.2 6 20.6
        C6.2 21 6.7 21.1 7.1 20.9

        L11.1 19.1
        L11.1 21.1
        C11.1 21.6 11.5 21.9 12 21.9
        C12.5 21.9 12.9 21.6 12.9 21.1
        L12.9 19.1

        L16.9 20.9
        C17.3 21.1 17.8 21 18 20.6
        C18.2 20.2 18.1 19.7 17.7 19.4

        L14.3 17.2
        L14.1 12.9
        L20.6 14.6
        C21.1 14.7 21.6 14.5 21.7 14
        C21.8 13.5 21.6 13 21.1 12.7

        L13.5 8.2
        L13.4 3.8
        C13.3 2.9 12.8 2.2 12 2.2
        Z
        "
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        transform="rotate(45 12 12)"/>
</svg>
`
    },


    finance: {
        name: "Finance",
        color: "#f59e0b",
        icon: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />
                <path
                    d="M3 10h18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />
                <circle
                    cx="8"
                    cy="15"
                    r="1"
                    fill="currentColor"
                />
                <path
                    d="M12 15h5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        `
    },


    other: {
        name: "Other",
        color: "#64748b",
        icon: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />
                <path
                    d="M12 8v4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
                <circle
                    cx="12"
                    cy="16"
                    r="1"
                    fill="currentColor"
                />
            </svg>
        `
    }

};


/* ==========================================================
   DEFAULT EVENT SETTINGS
========================================================== */

const DEFAULT_EVENT_CATEGORY = "other";

const DEFAULT_EVENT_COLOR =
    EVENT_CATEGORIES.other.color;


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNavigation();

        initializeCalendar();

        initializeCalendarViewMenu();

        initializeEventModal();

        initializeEventCategoryControls();

        injectEventCategoryStyles();

        injectDayViewAllDayStyles();

        normalizeExistingEvents();

        window.addEventListener(
    "homeup-event-created",
    event => {

        events =
            JSON.parse(
                localStorage.getItem(
                    "homeup-events"
                ) || "[]"
            );

        if (
            event.detail &&
            event.detail.date
        ) {

            const dateParts =
                event.detail.date.split("-");

            if (
                dateParts.length === 3
            ) {

                currentDate =
                    new Date(
                        Number(dateParts[0]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[2])
                    );

            }

        }

        renderCalendar();

    }
);

    }
);


/* ==========================================================
   NORMALIZE EXISTING EVENTS
========================================================== */

/*
   This keeps old HomeUp events working.

   Older events may only contain:

   id
   title
   date
   start
   end
   description

   We automatically give them:

   category: "other"
   color: default Other color
*/

function normalizeExistingEvents() {

    let changed = false;


    events.forEach(
        event => {

            if (
                !event.category ||
                !EVENT_CATEGORIES[
                    event.category
                ]
            ) {

                event.category =
                    DEFAULT_EVENT_CATEGORY;

                changed = true;

            }


            if (
                !event.color
            ) {

                event.color =
                    EVENT_CATEGORIES[
                        event.category
                    ]?.color ||
                    DEFAULT_EVENT_COLOR;

                changed = true;

            }

        }
    );


    if (changed) {

        saveEvents();

    }

}

function getEventTextColor(backgroundColor) {
    if (!backgroundColor) {
        return "#000000";
    }

    let color = backgroundColor.trim();

    // Convert HEX to RGB
    if (color.startsWith("#")) {
        color = color.replace("#", "");

        if (color.length === 3) {
            color = color
                .split("")
                .map(char => char + char)
                .join("");
        }

        if (color.length === 6) {
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);

            // Calculate perceived brightness
            const brightness =
                (r * 299 +
                 g * 587 +
                 b * 114) / 1000;

            return brightness < 150
                ? "#ffffff"
                : "#000000";
        }
    }

    // Fallback
    return "#000000";
}

/* ==========================================================
   NAVIGATION
========================================================== */

function initializeNavigation() {

    initializeSidebar();

    initializeMobileMenu();

}


/* ==========================================================
   SIDEBAR
========================================================== */

function initializeSidebar() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .split("?")[0]
            .split("#")[0]
            .toLowerCase() ||
        "index.html";


    document
        .querySelectorAll(
            "#navi a"
        )
        .forEach(
            link => {

                const href =
                    link.getAttribute(
                        "href"
                    );

                if (!href) return;


                const linkPage =
                    getPageName(
                        href
                    );


                link.classList.toggle(
                    "active",
                    linkPage ===
                        currentPage
                );

            }
        );


    document
        .querySelectorAll(
            "#dropdown-menu .dropdown-item"
        )
        .forEach(
            link => {

                const href =
                    link.getAttribute(
                        "href"
                    );

                if (!href) return;


                const linkPage =
                    getPageName(
                        href
                    );


                link.classList.toggle(
                    "active",
                    linkPage ===
                        currentPage
                );

            }
        );

}


/* ==========================================================
   GET PAGE NAME
========================================================== */

function getPageName(
    href
) {

    if (!href) {

        return "";

    }


    return String(href)
        .split("/")
        .pop()
        .split("?")[0]
        .split("#")[0]
        .toLowerCase();

}


/* ==========================================================
   MOBILE MENU
========================================================== */

function initializeMobileMenu() {

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


    trigger.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleMenu();

        }
    );


    document
        .querySelectorAll(
            "#dropdown-menu .dropdown-item"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        closeDropdown();

                    }
                );

            }
        );


    document.addEventListener(
        "click",
        event => {

            if (
                !trigger.contains(
                    event.target
                ) &&
                !menu.contains(
                    event.target
                )
            ) {

                closeDropdown();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeDropdown();

            }

        }
    );

}


/* ==========================================================
   MOBILE MENU TOGGLE
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


    if (!menu) {

        return;

    }


    const hidden =
        menu.classList.contains(
            "hidden"
        );


    if (hidden) {

        menu.classList.remove(
            "hidden"
        );


        if (trigger) {

            trigger.setAttribute(
                "aria-expanded",
                "true"
            );

        }

    }

    else {

        closeDropdown();

    }

}


window.toggleMenu =
    toggleMenu;


/* ==========================================================
   CLOSE MOBILE MENU
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

        menu.classList.add(
            "hidden"
        );

    }


    if (trigger) {

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* ==========================================================
   CALENDAR INITIALIZATION
========================================================== */

function initializeCalendar() {

    const previousButton =
        document.getElementById(
            "prev-month"
        );

    const nextButton =
        document.getElementById(
            "next-month"
        );

    const todayButton =
        document.getElementById(
            "today-btn"
        );


    if (
        !previousButton ||
        !nextButton ||
        !todayButton
    ) {

        console.warn(
            "HomeUp Calendar: navigation buttons not found."
        );

        return;

    }


    previousButton.addEventListener(
        "click",
        () => {

            navigateCalendar(
                -1
            );

        }
    );


    nextButton.addEventListener(
        "click",
        () => {

            navigateCalendar(
                1
            );

        }
    );


    todayButton.addEventListener(
        "click",
        () => {

            currentDate =
                new Date();

            animateCalendarNavigation();

        }
    );


    calendarView =
        "month";


    setActiveView(
        "month"
    );
  
    initializeCalendarSwipe();

    renderCalendar();

}

/* ==========================================================
   SWIPE CALENDAR NAVIGATION
========================================================== */

function initializeCalendarSwipe() {

    const calendar =
        document.querySelector(
            ".calendar"
        );


    if (!calendar) {

        return;

    }


    let touchStartX =
        0;

    let touchStartY =
        0;

    let swipeHandled =
        false;


    calendar.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.touches[0];


            if (!touch) {

                return;

            }


            touchStartX =
                touch.clientX;

            touchStartY =
                touch.clientY;

            /*
               Allow exactly one navigation
               per touch gesture.
            */

            swipeHandled =
                false;

        },
        {
            passive: true
        }
    );


    calendar.addEventListener(
        "touchend",
        event => {

            /*
               Prevent the same gesture from
               navigating more than once.
            */

            if (
                swipeHandled
            ) {

                return;

            }


            const touch =
                event.changedTouches[0];


            if (!touch) {

                return;

            }


            const touchEndX =
                touch.clientX;

            const touchEndY =
                touch.clientY;


            const differenceX =
                touchEndX -
                touchStartX;

            const differenceY =
                touchEndY -
                touchStartY;


            /*
               Ignore small movements.
            */

            if (
                Math.abs(
                    differenceX
                ) < 60
            ) {

                return;

            }


            /*
               Ignore mostly vertical
               swipes.
            */

            if (
                Math.abs(
                    differenceY
                ) >
                Math.abs(
                    differenceX
                )
            ) {

                return;

            }


            /*
               Lock the gesture BEFORE
               navigating.

               This is important because
               navigation causes the calendar
               to re-render.
            */

            swipeHandled =
                true;


            /*
               Swipe left:
               Next period.
            */

            if (
                differenceX < 0
            ) {

                navigateCalendar(
                    1
                );

            }


            /*
               Swipe right:
               Previous period.
            */

            else {

                navigateCalendar(
                    -1
                );

            }

        },
        {
            passive: true
        }
    );

}

/* ==========================================================
   CALENDAR NAVIGATION
========================================================== */

function navigateCalendar(
    direction
) {

    const newDate =
        new Date(
            currentDate
        );


    if (
        calendarView ===
        "year"
    ) {

        newDate.setFullYear(
            newDate.getFullYear() +
            direction
        );

    }

    else if (
        calendarView ===
        "day"
    ) {

        newDate.setDate(
            newDate.getDate() +
            direction
        );

    }

    else if (
    calendarView ===
    "week"
) {

    newDate.setDate(
        newDate.getDate() +
        (direction * 7)
    );

}

else {

    newDate.setDate(
        1
    );

    newDate.setMonth(
        newDate.getMonth() +
        direction
    );

}


    currentDate =
        newDate;


    animateCalendarNavigation();

}


/* ==========================================================
   CALENDAR NAVIGATION ANIMATION
========================================================== */

function animateCalendarNavigation() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );


    if (!calendarDays) {

        renderCalendar();

        return;

    }


    calendarDays.classList.remove(
        "view-changing"
    );


    void calendarDays.offsetWidth;


    renderCalendar();


    requestAnimationFrame(
        () => {

            calendarDays.classList.remove(
                "view-changing"
            );


            void calendarDays.offsetWidth;


            calendarDays.classList.add(
                "view-changing"
            );

        }
    );

}


/* ==========================================================
   VIEW BODY CLASS
========================================================== */

function updateCalendarViewClass() {

    document.body.classList.remove(
        "year-view",
        "month-view",
        "week-view",
        "day-view"
    );


    document.body.classList.add(
        `${calendarView}-view`
    );

}


/* ==========================================================
   VIEW ANIMATION
========================================================== */

function animateCalendarView() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );


    if (!calendarDays) {

        return;

    }


    calendarDays.classList.remove(
        "view-changing"
    );


    void calendarDays.offsetWidth;


    requestAnimationFrame(
        () => {

            calendarDays.classList.add(
                "view-changing"
            );

        }
    );

}


/* ==========================================================
   CALENDAR VIEW MENU
========================================================== */

function initializeCalendarViewMenu() {

    const trigger =
        document.getElementById(
            "calendar-trigger"
        );

    const menu =
        document.getElementById(
            "calendar-view-menu"
        );


    if (!trigger || !menu) {

        return;

    }


    trigger.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleCalendarViewMenu();

        }
    );


    document
        .querySelectorAll(
            ".calendar-view-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const selectedView =
                            button.dataset.view;


                        if (
    ![
        "year",
        "month",
        "week",
        "day"
    ].includes(
        selectedView
    )
) {

    return;

}


                        calendarView =
                            selectedView;


                        setActiveView(
                            selectedView
                        );


                        closeCalendarViewMenu();


                        renderCalendar();

                    }
                );

            }
        );


    document.addEventListener(
        "click",
        event => {

            if (
                !trigger.contains(
                    event.target
                ) &&
                !menu.contains(
                    event.target
                )
            ) {

                closeCalendarViewMenu();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeCalendarViewMenu();

            }

        }
    );


    setActiveView(
        "month"
    );

}


/* ==========================================================
   CALENDAR VIEW MENU TOGGLE
========================================================== */

function toggleCalendarViewMenu() {

    const menu =
        document.getElementById(
            "calendar-view-menu"
        );

    const trigger =
        document.getElementById(
            "calendar-trigger"
        );


    if (!menu) {

        return;

    }


    const hidden =
        menu.classList.contains(
            "hidden"
        );


    if (hidden) {

        menu.classList.remove(
            "hidden"
        );


        if (trigger) {

            trigger.setAttribute(
                "aria-expanded",
                "true"
            );

        }

    }

    else {

        closeCalendarViewMenu();

    }

}


/* ==========================================================
   CLOSE VIEW MENU
========================================================== */

function closeCalendarViewMenu() {

    const menu =
        document.getElementById(
            "calendar-view-menu"
        );

    const trigger =
        document.getElementById(
            "calendar-trigger"
        );


    if (menu) {

        menu.classList.add(
            "hidden"
        );

    }


    if (trigger) {

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* ==========================================================
   ACTIVE CALENDAR VIEW
========================================================== */

function setActiveView(
    view
) {

    document
        .querySelectorAll(
            ".calendar-view-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.view ===
                        view
                );

            }
        );

}

/* ==========================================================
   HOMEUP — BUILD REPEATED EVENT OCCURRENCES
========================================================== */

function getRenderableEvents() {

    const output = [];

    const visibleStart =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );

    const visibleEnd =
        calendarView === "day"
            ? new Date(visibleStart)
            : new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
            );

    const rangeStart =
        addDays(
            visibleStart,
            -42
        );

    const rangeEnd =
        addDays(
            visibleEnd,
            42
        );


    events.forEach(baseEvent => {

        const repeat =
            baseEvent.repeat || {
                frequency: "none"
            };


        /*
           Normal event
        */

        if (
            !repeat.frequency ||
            repeat.frequency === "none"
        ) {

            output.push(
                baseEvent
            );

            return;
        }


        /*
           Recurring event
        */

        const occurrences =
            buildEventOccurrences(
                baseEvent,
                repeat,
                rangeStart,
                rangeEnd
            );

        output.push(
            ...occurrences
        );

    });


    return output;
}

function buildEventOccurrences(
    baseEvent,
    repeat,
    rangeStart,
    rangeEnd
) {

    const results = [];


    const startDate =
        parseHomeUpDate(
            baseEvent.date
        );


    if (!startDate) {
        return results;
    }


    const frequency =
        repeat.frequency || "none";

    const interval =
        Math.max(
            1,
            Number(
                repeat.interval
            ) || 1
        );

    const weekdays =
        Array.isArray(
            repeat.weekdays
        )
            ? repeat.weekdays
            : [];


    const duration =
        repeat.duration ||
        "forever";


    const count =
        Number(
            repeat.count
        ) || null;


    const untilDate =
        duration === "until" &&
        repeat.until
            ? parseHomeUpDate(
                repeat.until
            )
            : null;


    let occurrenceIndex = 0;


    /*
       Maximum safety limit.
       Prevents a broken repeat setting
       from generating thousands of events.
    */

    const maxOccurrences =
        duration === "count" &&
        count
            ? count
            : 500;


    /*
       ======================================================
       WEEKLY WITH SELECTED DAYS
       ======================================================
    */

    if (
        frequency === "weekly" &&
        weekdays.length > 0
    ) {

        let cursor =
            new Date(startDate);


        while (
            cursor <= rangeEnd &&
            occurrenceIndex < maxOccurrences
        ) {

            /*
               Stop at "until" date.
            */

            if (
                untilDate &&
                cursor > untilDate
            ) {
                break;
            }


            const weeksSinceStart =
                Math.floor(
                    (
                        cursor.getTime() -
                        startDate.getTime()
                    ) /
                    (
                        7 *
                        24 *
                        60 *
                        60 *
                        1000
                    )
                );


            const correctWeek =
                weeksSinceStart >= 0 &&
                weeksSinceStart %
                    interval === 0;


            const correctDay =
                weekdays.includes(
                    cursor.getDay()
                );


            if (
                correctWeek &&
                correctDay
            ) {

                if (
                    cursor >= rangeStart
                ) {

                    results.push(
                        createRepeatedOccurrence(
                            baseEvent,
                            cursor,
                            occurrenceIndex
                        )
                    );
                }


                occurrenceIndex++;


                if (
                    duration === "count" &&
                    occurrenceIndex >= count
                ) {
                    break;
                }
            }


            cursor =
                addDays(
                    cursor,
                    1
                );
        }


        return results;
    }


    /*
       ======================================================
       DAILY / WEEKLY / MONTHLY / YEARLY
       ======================================================
    */

    let cursor =
        new Date(startDate);


    while (
        cursor <= rangeEnd &&
        occurrenceIndex < maxOccurrences
    ) {

        if (
            untilDate &&
            cursor > untilDate
        ) {
            break;
        }


        if (
            cursor >= rangeStart
        ) {

            results.push(
                createRepeatedOccurrence(
                    baseEvent,
                    cursor,
                    occurrenceIndex
                )
            );
        }


        occurrenceIndex++;


        if (
            duration === "count" &&
            occurrenceIndex >= count
        ) {
            break;
        }


        if (
            frequency === "daily"
        ) {

            cursor =
                addDays(
                    cursor,
                    interval
                );

        }

        else if (
            frequency === "weekly"
        ) {

            cursor =
                addDays(
                    cursor,
                    7 * interval
                );

        }

        else if (
            frequency === "monthly"
        ) {

            cursor =
                addMonths(
                    cursor,
                    interval
                );

        }

        else if (
            frequency === "yearly"
        ) {

            cursor =
                addYears(
                    cursor,
                    interval
                );

        }

        else {

            break;
        }
    }


    return results;
}

function createRepeatedOccurrence(
    baseEvent,
    occurrenceDate,
    occurrenceIndex
) {

    return {

        ...baseEvent,

        date:
            formatDate(
                occurrenceDate
            ),

        /*
           Keep the original event ID.
           This means editing/deleting the
           repeated event still refers to
           the main event.
        */

        _isOccurrence: true,

        _occurrenceIndex:
            occurrenceIndex,

        _sourceEventId:
            baseEvent.id
    };
}

/* ==========================================================
   MASTER CALENDAR RENDERER
========================================================== */

function updateTodayButton() {

    const todayButton =
        document.getElementById(
            "today-btn"
        );


    if (!todayButton) {

        return;

    }


    const today =
        new Date();


    todayButton.textContent =
        today.getDate();


    todayButton.setAttribute(
        "aria-label",
        `Go to today, ${today.toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        )}`
    );

}

function renderCalendar() {

    updateTodayButton();

    if (
    ![
        "year",
        "month",
        "week",
        "day"
    ].includes(
        calendarView
    )
) {

        calendarView =
            "month";

    }


    updateCalendarViewClass();


    const calendarDays =
        document.getElementById(
            "calendar-days"
        );


    if (!calendarDays) {

        return;

    }


    calendarDays.style.gridTemplateColumns =
        "";


    calendarDays.classList.remove(
    "day-view-grid"
);

calendarDays.classList.remove(
    "week-view-grid"
);

calendarDays.classList.remove(
    "year-view-grid"
);


    const weekdays =
        document.querySelector(
            ".calendar-weekdays"
        );


    if (weekdays) {

    weekdays.style.display =
        (
            calendarView === "month" ||
            calendarView === "week"
        )
            ? ""
            : "none";

}


    if (
        calendarView ===
        "year"
    ) {

        renderYearView();

        return;

    }

    if (
    calendarView ===
    "week"
) {

    renderWeekView();

    return;

}
  
    if (
        calendarView ===
        "day"
    ) {

        renderDayView();

        return;

    }

    if (
    calendarView ===
    "week"
) {

    renderWeekView();

    return;

}


    renderMonthView();

}


/* ==========================================================
   MONTH VIEW
========================================================== */

function renderMonthView() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );

    const monthTitle =
        document.getElementById(
            "month-title"
        );


    if (
        !calendarDays ||
        !monthTitle
    ) {

        return;

    }


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    monthTitle.textContent =
        currentDate.toLocaleDateString(
            "en-US",
            {
                month:
                    "long",
                year:
                    "numeric"
            }
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    calendarDays.innerHTML =
        "";


    /*
       PREVIOUS MONTH
    */

    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            daysInPreviousMonth -
            i;


        calendarDays.appendChild(
            createDayCell(
                day,
                true,
                false,
                year,
                month - 1
            )
        );

    }


    /*
       CURRENT MONTH
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        calendarDays.appendChild(
            createDayCell(
                day,
                false,
                isCurrentDay(
                    year,
                    month,
                    day
                ),
                year,
                month
            )
        );

    }


    /*
       NEXT MONTH
    */

    const totalCells =
        calendarDays.children.length;


    const cellsNeeded =
        totalCells <= 35
            ? 35
            : 42;


    const nextMonthDays =
        cellsNeeded -
        totalCells;


    for (
        let day = 1;
        day <= nextMonthDays;
        day++
    ) {

        calendarDays.appendChild(
            createDayCell(
                day,
                true,
                false,
                year,
                month + 1
            )
        );

    }


    animateCalendarView();

}

/* ==========================================================
   GET EVENTS FOR CALENDAR DATE
========================================================== */

/* ==========================================================
   MULTI-DAY EVENT POSITION
========================================================== */

function getMultiDayEventPosition(
    event,
    dateString
) {

    if (
        !event ||
        !event.date ||
        !dateString
    ) {

        return "single";

    }


    const startDate =
        event.date;


    const endDate =
        event.endDate ||
        event.date;


    if (
        startDate ===
        endDate
    ) {

        return "single";

    }


    if (
        dateString ===
        startDate
    ) {

        return "start";

    }


    if (
        dateString ===
        endDate
    ) {

        return "end";

    }


    if (
        dateString >
        startDate &&
        dateString <
        endDate
    ) {

        return "middle";

    }


    return "single";

}


/* ==========================================================
   IS MULTI-DAY EVENT
========================================================== */

function isMultiDayEvent(
    event
) {

    if (
        !event ||
        !event.date
    ) {

        return false;

    }


    return (
        event.endDate &&
        event.endDate >
        event.date
    );

}

function getEventsForCalendarDate(
    dateString
) {

    const targetDate =
        new Date(
            dateString + "T00:00:00"
        );


    if (
        Number.isNaN(
            targetDate.getTime()
        )
    ) {

        return [];

    }


    return events.filter(
        event => {

/*
   NORMAL EVENT
*/

if (
    !event.recurrence
) {

    const eventStartDate =
        event.date;

    const eventEndDate =
        event.endDate ||
        event.date;


    /*
       Show the event on every date
       from start date through end date.
    */

    return (
        dateString >=
            eventStartDate &&
        dateString <=
            eventEndDate
    );

}

            /*
               RECURRING EVENT
            */

            const startDate =
                new Date(
                    event.date +
                    "T00:00:00"
                );


            if (
                Number.isNaN(
                    startDate.getTime()
                )
            ) {

                return false;

            }


            /*
               Do not show recurring events
               before their first occurrence.
            */

            if (
                targetDate <
                startDate
            ) {

                return false;

            }


            const recurrence =
    event.recurrence;


/*
   STOP RECURRING AFTER UNTIL DATE
*/

if (
    recurrence.duration ===
    "until" &&
    recurrence.until
) {

    const untilDate =
        new Date(
            recurrence.until +
            "T00:00:00"
        );


    if (
        !Number.isNaN(
            untilDate.getTime()
        ) &&
        targetDate >
        untilDate
    ) {

        return false;

    }

}


const frequency =
    String(
        recurrence.frequency ||
        ""
    )
    .toLowerCase();


            const interval =
                Math.max(
                    1,
                    Number(
                        recurrence.interval ||
                        1
                    )
                );


            /*
               DAILY
            */

            if (
                frequency ===
                "daily"
            ) {

                const difference =
                    Math.floor(
                        (
                            targetDate -
                            startDate
                        ) /
                        86400000
                    );


                return (
                    difference %
                    interval ===
                    0
                );

            }


            /*
               WEEKLY
            */

            if (
                frequency ===
                "weekly"
            ) {

                const difference =
                    Math.floor(
                        (
                            targetDate -
                            startDate
                        ) /
                        86400000
                    );


                const weeks =
                    Math.floor(
                        difference /
                        7
                    );


                const daysOfWeek =
    Array.isArray(
        recurrence.daysOfWeek
    )
        ? recurrence.daysOfWeek
        : [];


/*
   Convert weekday values to numbers.

   0 = Sunday
   1 = Monday
   2 = Tuesday
   3 = Wednesday
   4 = Thursday
   5 = Friday
   6 = Saturday
*/

const normalizedDaysOfWeek =
    daysOfWeek.map(day => {

        if (
            typeof day === "number"
        ) {
            return day;
        }

        const value =
            String(day)
                .trim()
                .toLowerCase();

        const weekdayNumbers = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
        };

        return weekdayNumbers[value];

    }).filter(
        day =>
            Number.isInteger(day) &&
            day >= 0 &&
            day <= 6
    );


/*
   If specific weekdays were selected,
   only show the event on those days.
*/

if (
    normalizedDaysOfWeek.length
) {

    const targetWeekday =
        targetDate.getDay();


    if (
        !normalizedDaysOfWeek.includes(
            targetWeekday
        )
    ) {

        return false;

    }


    /*
       Check the week interval.

       Example:

       Every week:
       interval = 1

       Every 2 weeks:
       interval = 2
    */

    const startWeekday =
        startDate.getDay();


    const daysFromStartWeek =
        difference +
        startWeekday;


    const weekNumber =
        Math.floor(
            daysFromStartWeek /
            7
        );


    if (
    recurrence.duration ===
    "count"
) {

    const occurrenceNumber =
        Math.floor(
            weekNumber /
            interval
        ) + 1;


    if (
        occurrenceNumber >
        Number(
            recurrence.count
        )
    ) {

        return false;

    }

}


return (
    weekNumber %
    interval ===
    0
);

}


                /*
                   No specific weekday:
                   repeat on the original
                   weekday.
                */

                if (
                    targetDate.getDay() !==
                    startDate.getDay()
                ) {

                    return false;

                }


                return (
                    weeks %
                    interval ===
                    0
                );

            }


            /*
               MONTHLY
            */

            if (
                frequency ===
                "monthly"
            ) {

                const monthDifference =
                    (
                        targetDate.getFullYear() -
                        startDate.getFullYear()
                    ) *
                    12 +
                    (
                        targetDate.getMonth() -
                        startDate.getMonth()
                    );


                if (
                    monthDifference %
                    interval !==
                    0
                ) {

                    return false;

                }


                return (
                    targetDate.getDate() ===
                    startDate.getDate()
                );

            }


            /*
               YEARLY
            */

            if (
                frequency ===
                "yearly"
            ) {

                const yearDifference =
                    targetDate.getFullYear() -
                    startDate.getFullYear();


                if (
                    yearDifference %
                    interval !==
                    0
                ) {

                    return false;

                }


                return (
                    targetDate.getMonth() ===
                    startDate.getMonth() &&
                    targetDate.getDate() ===
                    startDate.getDate()
                );

            }


            /*
               Unknown recurrence.
            */

            return false;

        }
    );

}

/* ==========================================================
   CREATE MONTH DAY CELL
========================================================== */

function createDayCell(
    day,
    isOtherMonth,
    isToday,
    year,
    month
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "calendar-day";


    if (isOtherMonth) {

        cell.classList.add(
            "other-month"
        );

    }


    if (isToday) {

        cell.classList.add(
            "today"
        );

    }


    const number =
        document.createElement(
            "div"
        );


    number.className =
        "day-number";


    number.textContent =
        day;


    cell.appendChild(
        number
    );


    const cellDate =
        new Date(
            year,
            month,
            day
        );


    const dateString =
        formatDate(
            cellDate
        );


    const dayEvents =
        getEventsForCalendarDate(
            dateString
        );


    const eventsContainer =
        document.createElement(
            "div"
        );


    eventsContainer.className =
        "calendar-day-events";


    dayEvents.forEach(
        event => {

            const position =
                getMultiDayEventPosition(
                    event,
                    dateString
                );


            /*
               DO NOT CREATE A SECOND
               EVENT BAR FOR MIDDLE
               OR END DAYS.

               The event is created only
               on its starting date.
            */

            if (
                position === "middle" ||
                position === "end"
            ) {

                return;

            }


            /*
               CREATE THE ACTUAL EVENT
            */

            const eventElement =
                createEventElement(
                    event
                );


            if (!eventElement) {

                return;

            }


            eventElement.classList.add(
                `multi-day-${position}`
            );


            /*
               MULTI-DAY EVENT
            */

            if (
                position === "start" &&
                event.endDate &&
                event.endDate !== event.date
            ) {

                const startDate =
                    new Date(
                        event.date +
                        "T00:00:00"
                    );


                const endDate =
                    new Date(
                        event.endDate +
                        "T00:00:00"
                    );


                const millisecondsPerDay =
                    24 * 60 * 60 * 1000;


                const span =
                    Math.round(
                        (
                            endDate.getTime() -
                            startDate.getTime()
                        ) /
                        millisecondsPerDay
                    ) + 1;


                /*
                   Store how many calendar
                   cells the event occupies.
                */

                eventElement.style.setProperty(
                    "--event-span",
                    span
                );


                eventElement.classList.add(
                    "month-multi-day-span"
                );

            }


            /*
               CLICK
            */

            eventElement.addEventListener(
                "click",
                clickEvent => {

                    clickEvent.stopPropagation();

                }
            );


            /*
               RIGHT CLICK
            */

            eventElement.addEventListener(
                "contextmenu",
                contextEvent => {

                    contextEvent.preventDefault();

                    contextEvent.stopPropagation();


                    showEventActions(
                        event,
                        contextEvent.clientX,
                        contextEvent.clientY
                    );

                }
            );


            eventsContainer.appendChild(
                eventElement
            );

        }
    );


    cell.appendChild(
        eventsContainer
    );


    cell.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".calendar-event"
                )
            ) {

                return;

            }


            currentDate =
                new Date(
                    year,
                    month,
                    day
                );


            calendarView =
                "day";


            setActiveView(
                "day"
            );


            renderCalendar();

        }
    );


    return cell;

}

/* ==========================================================
   GET EVENT CATEGORY
========================================================== */

function getEventCategory(
    event
) {

    const category =
        String(
            event &&
            event.category ||
            ""
        )
        .trim()
        .toLowerCase();


    if (
        category &&
        EVENT_CATEGORIES[
            category
        ]
    ) {

        return EVENT_CATEGORIES[
            category
        ];

    }


    return EVENT_CATEGORIES.other;

}

/* ==========================================================
   GET EVENT COLOR
========================================================== */

function getEventColor(
    event
) {

    if (
        event &&
        event.color
    ) {

        return event.color;

    }


    return getEventCategory(
        event
    ).color;

}


/* ==========================================================
   GET EVENT ICON
========================================================== */

function getEventIcon(
    event
) {

    return getEventCategory(
        event
    ).icon;

}


/* ==========================================================
   CREATE EVENT ELEMENT
========================================================== */

function createEventElement(
    event
) {

    const eventElement =
        document.createElement(
            "div"
        );


    eventElement.className =
        "calendar-event";


    eventElement.dataset.eventId =
        event.id;


    const category =
        getEventCategory(
            event
        );


    const eventColor =
        getEventColor(
            event
        );


    eventElement.style.setProperty(
        "--event-color",
        eventColor
    );
  
    eventElement.style.setProperty(
    "--event-color",
    event.color || DEFAULT_EVENT_COLOR
);

eventElement.style.setProperty(
    "--event-text-color",
    getEventTextColor(
        event.color || DEFAULT_EVENT_COLOR
    )
);

    eventElement.style.setProperty(
        "--event-category-color",
        category.color
    );


    eventElement.innerHTML = `
        <span class="calendar-event-icon">
            ${category.icon}
        </span>
           
        <span class="calendar-event-time">
            ${
                event.start
                    ? escapeHTML(
                        formatTime(
                            event.start
                        )
                    )
                    : ""
            }
        </span>
           
        <span class="calendar-event-title">
            ${escapeHTML(
                event.title ||
                "Untitled event"
            )}
        </span>
    `;


    if (
        event.description
    ) {

        eventElement.title =
            event.description;

    }


    eventElement.addEventListener(
        "click",
        clickEvent => {

            clickEvent.stopPropagation();

        }
    );


    /*
       RIGHT CLICK
    */

    eventElement.addEventListener(
        "contextmenu",
        contextEvent => {

            contextEvent.preventDefault();

            contextEvent.stopPropagation();


            showEventActions(
                event,
                contextEvent.clientX,
                contextEvent.clientY
            );

        }
    );


    /*
       LONG PRESS
    */

    let holdTimer =
        null;

    let longPressTriggered =
        false;


    eventElement.addEventListener(
        "touchstart",
        touchEvent => {

            longPressTriggered =
                false;


            const touch =
                touchEvent.touches[0];


            if (!touch) {

                return;

            }


            holdTimer =
                setTimeout(
                    () => {

                        longPressTriggered =
                            true;


                        showEventActions(
                            event,
                            touch.clientX,
                            touch.clientY
                        );

                    },
                    600
                );

        },
        {
            passive:
                true
        }
    );


    eventElement.addEventListener(
        "touchend",
        touchEvent => {

            clearTimeout(
                holdTimer
            );


            if (
                longPressTriggered
            ) {

                touchEvent.preventDefault();

            }

        }
    );


    eventElement.addEventListener(
        "touchmove",
        () => {

            clearTimeout(
                holdTimer
            );

        },
        {
            passive:
                true
        }
    );


    eventElement.addEventListener(
        "touchcancel",
        () => {

            clearTimeout(
                holdTimer
            );

        }
    );


    return eventElement;

}


/* ==========================================================
   EVENT ACTION MENU
========================================================== */

function showEventActions(
    event,
    x,
    y
) {

    removeEventActions(
        true
    );


    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "event-actions-menu";


    menu.innerHTML = `
        <button
            type="button"
            data-action="edit">

            <span class="event-action-icon">

                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M12 20h9"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />

                    <path
                        d="M16.5 3.5
                           a2.12 2.12 0 0 1 3 3
                           L7 19l-4 1 1-4Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                </svg>

            </span>

            <span>
                Edit
            </span>

        </button>


        <button
            type="button"
            data-action="delete">

            <span class="event-action-icon">

                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M3 6h18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />

                    <path
                        d="M8 6V4h8v2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M19 6l-1 14H6L5 6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M10 11v5M14 11v5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>

            </span>

            <span>
                Delete
            </span>

        </button>
    `;


    menu.style.position =
        "fixed";


    menu.style.left =
        `${x}px`;


    menu.style.top =
        `${y}px`;


    menu.style.zIndex =
        "5000";


    document.body.appendChild(
        menu
    );


    requestAnimationFrame(
        () => {

            const rect =
                menu.getBoundingClientRect();


            let left =
                x;

            let top =
                y;


            if (
                left + rect.width >
                window.innerWidth
            ) {

                left =
                    window.innerWidth -
                    rect.width -
                    10;

            }


            if (
                top + rect.height >
                window.innerHeight
            ) {

                top =
                    window.innerHeight -
                    rect.height -
                    10;

            }


            left =
                Math.max(
                    10,
                    left
                );


            top =
                Math.max(
                    10,
                    top
                );


            menu.style.left =
                `${left}px`;


            menu.style.top =
                `${top}px`;


            requestAnimationFrame(
                () => {

                    menu.classList.add(
                        "show"
                    );

                }
            );

        }
    );


    const editButton =
        menu.querySelector(
            '[data-action="edit"]'
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            clickEvent => {

                clickEvent.preventDefault();

                clickEvent.stopPropagation();


                removeEventActions(
                    true
                );


                openEventModal(
                    event.date,
                    event
                );

            }
        );

    }


    const deleteButton =
        menu.querySelector(
            '[data-action="delete"]'
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            clickEvent => {

                clickEvent.preventDefault();

                clickEvent.stopPropagation();


                removeEventActions(
                    true
                );


                deleteEvent(
                    event.id
                );

            }
        );

    }


    setTimeout(
        () => {

            document.addEventListener(
                "click",
                closeEventActionsOnOutsideClick
            );

        },
        0
    );

}


/* ==========================================================
   EVENT MENU OUTSIDE CLICK
========================================================== */

function closeEventActionsOnOutsideClick(
    event
) {

    const menu =
        document.getElementById(
            "event-actions-menu"
        );


    if (
        menu &&
        !menu.contains(
            event.target
        )
    ) {

        removeEventActions();

    }

}


/* ==========================================================
   REMOVE EVENT ACTION MENU
========================================================== */

function removeEventActions(
    immediate = false
) {

    const menu =
        document.getElementById(
            "event-actions-menu"
        );


    document.removeEventListener(
        "click",
        closeEventActionsOnOutsideClick
    );


    if (!menu) {

        return;

    }


    if (immediate) {

        menu.remove();

        return;

    }


    if (
        menu.dataset.closing ===
        "true"
    ) {

        return;

    }


    menu.dataset.closing =
        "true";


    menu.classList.remove(
        "show"
    );


    setTimeout(
        () => {

            if (
                menu &&
                menu.parentNode
            ) {

                menu.remove();

            }

        },
        200
    );

}


/* ==========================================================
   DELETE EVENT
========================================================== */

function deleteEvent(
    eventId
) {

    const event =
        events.find(
            item =>
                item.id ===
                eventId
        );


    if (!event) {

        return;

    }


    const confirmed =
        window.confirm(
            `Delete "${event.title}"?`
        );


    if (!confirmed) {

        return;

    }


    events =
        events.filter(
            item =>
                item.id !==
                eventId
        );


    saveEvents();


    renderCalendar();

}


/* ==========================================================
   IS TODAY
========================================================== */

function isCurrentDay(
    year,
    month,
    day
) {

    const today =
        new Date();


    return (
        today.getFullYear() ===
            year &&
        today.getMonth() ===
            month &&
        today.getDate() ===
            day
    );

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(
    date
) {

    return (
        `${date.getFullYear()}-` +
        `${String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}-` +
        `${String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )}`
    );

}


/* ==========================================================
   YEAR VIEW
========================================================== */

function renderYearView() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );

    const monthTitle =
        document.getElementById(
            "month-title"
        );


    if (
        !calendarDays ||
        !monthTitle
    ) {

        return;

    }


    const year =
        currentDate.getFullYear();


    monthTitle.textContent =
        String(year);


    calendarDays.innerHTML =
        "";


    /*
       YEAR VIEW
       3 months per row
    */

    calendarDays.style.gridTemplateColumns =
        "repeat(3, 1fr)";


    calendarDays.classList.add(
        "year-view-grid"
    );


    for (
        let month = 0;
        month < 12;
        month++
    ) {

        const monthBox =
            document.createElement(
                "div"
            );


        monthBox.className =
            "year-month";


        /*
           MONTH NAME
        */

        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            new Date(
                year,
                month,
                1
            ).toLocaleDateString(
                "en-US",
                {
                    month:
                        "long"
                }
            );


        monthBox.appendChild(
            title
        );


        /*
           MINI CALENDAR
        */

        const miniCalendar =
            document.createElement(
                "div"
            );


        miniCalendar.className =
            "year-mini-calendar";


        /*
           WEEKDAY HEADERS
        */

        const weekdayNames = [
            "S",
            "M",
            "T",
            "W",
            "T",
            "F",
            "S"
        ];


        weekdayNames.forEach(
            dayName => {

                const weekday =
                    document.createElement(
                        "div"
                    );


                weekday.className =
                    "year-mini-weekday";


                weekday.textContent =
                    dayName;


                miniCalendar.appendChild(
                    weekday
                );

            }
        );


        /*
           FIRST DAY OF MONTH
        */

        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        /*
           NUMBER OF DAYS
        */

        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        /*
           EMPTY CELLS BEFORE
           THE FIRST DAY
        */

        for (
            let i = 0;
            i < firstDay;
            i++
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "year-mini-day empty";


            miniCalendar.appendChild(
                empty
            );

        }


        /*
           DAYS
        */

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const dayCell =
                document.createElement(
                    "div"
                );


            dayCell.className =
                "year-mini-day";


            dayCell.textContent =
                day;


            /*
               TODAY
            */

            if (
                isCurrentDay(
                    year,
                    month,
                    day
                )
            ) {

                dayCell.classList.add(
                    "today"
                );

            }


                        /*
               EVENTS
            */

            const dateString =
                formatDate(
                    new Date(
                        year,
                        month,
                        day
                    )
                );


            const dayEvents =
    getEventsForCalendarDate(
        dateString
    );


if (
    dayEvents.length >
    0
) {

    dayCell.classList.add(
        "has-event"
    );


    /*
       Event count badge.

       Maximum display:
       1–9 = exact number
       10+ = 9+
    */

    const eventCount =
        document.createElement(
            "span"
        );


    eventCount.className =
        "year-event-count";


    eventCount.textContent =
        dayEvents.length > 9
            ? "9+"
            : String(
                dayEvents.length
            );


    dayCell.appendChild(
        eventCount
    );

}
          
            /*
               Click a day
               → Day View
            */

            dayCell.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    currentDate =
                        new Date(
                            year,
                            month,
                            day
                        );


                    calendarView =
                        "day";


                    setActiveView(
                        "day"
                    );


                    renderCalendar();

                }
            );


            miniCalendar.appendChild(
                dayCell
            );

        }


        monthBox.appendChild(
            miniCalendar
        );


        /*
           Click month background
           → Month View
        */

        monthBox.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".year-mini-day"
                    )
                ) {

                    return;

                }


                currentDate =
                    new Date(
                        year,
                        month,
                        1
                    );


                calendarView =
                    "month";


                setActiveView(
                    "month"
                );


                renderCalendar();

            }
        );


        calendarDays.appendChild(
            monthBox
        );

    }


    animateCalendarView();

}

/* ==========================================================
   WEEK VIEW
========================================================== */

function renderWeekView() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );

    const monthTitle =
        document.getElementById(
            "month-title"
        );


    if (
        !calendarDays ||
        !monthTitle
    ) {

        return;

    }


    /*
       Find the Sunday of the current week.
    */

    const weekStart =
        new Date(
            currentDate
        );


    weekStart.setDate(
        currentDate.getDate() -
        currentDate.getDay()
    );


    weekStart.setHours(
        0,
        0,
        0,
        0
    );


    /*
       Find Saturday.
    */

    const weekEnd =
        new Date(
            weekStart
        );


    weekEnd.setDate(
        weekStart.getDate() +
        6
    );


    /*
       Update title.
    */

    const startText =
        weekStart.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );


    const endText =
        weekEnd.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );


    monthTitle.textContent =
        `${startText} – ${endText}`;


    /*
       Clear calendar.
    */

    calendarDays.innerHTML =
        "";


    calendarDays.style.gridTemplateColumns =
        "repeat(7, 1fr)";


    calendarDays.classList.add(
        "week-view-grid"
    );


    /*
       Create seven day columns.
    */

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            new Date(
                weekStart
            );


        date.setDate(
            weekStart.getDate() +
            i
        );


        const column =
            document.createElement(
                "div"
            );


        column.className =
            "week-day-column";


        /*
           Day header.
        */

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "week-day-header";


        const weekday =
            document.createElement(
                "div"
            );


        weekday.textContent =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const dayNumber =
            document.createElement(
                "div"
            );


        dayNumber.textContent =
            date.getDate();


        dayNumber.className =
            "week-day-number";


        if (
            isCurrentDay(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            )
        ) {

            dayNumber.classList.add(
                "today"
            );

        }


        header.appendChild(
            weekday
        );


        header.appendChild(
            dayNumber
        );


        column.appendChild(
            header
        );


        /*
           Events for this date.
        */

        const dateString =
            formatDate(
                date
            );


        const dayEvents =
            getEventsForCalendarDate(
                dateString
            );


        dayEvents.forEach(
    event => {

        const eventElement =
            createEventElement(
                event
            );


        if (!eventElement) {

            return;

        }


        const position =
            getMultiDayEventPosition(
                event,
                dateString
            );


        eventElement.classList.add(
    `multi-day-${position}`
);


/*
   Only the first segment shows
   the event contents.

   Middle and end segments remain
   visible so the event bar keeps
   spanning perfectly.
*/

if (
    position === "middle" ||
    position === "end"
) {

    const icon =
        eventElement.querySelector(
            ".calendar-event-icon"
        );

    const time =
        eventElement.querySelector(
            ".calendar-event-time"
        );

    const title =
        eventElement.querySelector(
            ".calendar-event-title"
        );


    if (icon) {

        icon.style.visibility =
            "hidden";

    }


    if (time) {

        time.style.visibility =
            "hidden";

    }


    if (title) {

        title.style.visibility =
            "hidden";

    }

}


column.appendChild(
    eventElement
);

    }
);


        /*
           Clicking empty area opens Day view.
        */

        column.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".calendar-event"
                    )
                ) {

                    return;

                }


                currentDate =
                    new Date(
                        date
                    );


                calendarView =
                    "day";


                setActiveView(
                    "day"
                );


                renderCalendar();

            }
        );


        calendarDays.appendChild(
            column
        );

    }


    animateCalendarView();

}
              
/* ==========================================================
   DAY VIEW
========================================================== */

function renderDayView() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );

    const monthTitle =
        document.getElementById(
            "month-title"
        );


    if (
        !calendarDays ||
        !monthTitle
    ) {

        return;

    }


    currentDate =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );


    monthTitle.textContent =
        currentDate.toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long",
                month:
                    "long",
                day:
                    "numeric",
                year:
                    "numeric"
            }
        );


    calendarDays.innerHTML =
        "";


    calendarDays.style.gridTemplateColumns =
        "1fr";


    calendarDays.classList.add(
        "day-view-grid"
    );


    const dayContainer =
        document.createElement(
            "div"
        );


    dayContainer.className =
        "day-timeline";


    const timeline =
        document.createElement(
            "div"
        );


    timeline.className =
        "day-timeline-grid";


    for (
        let hour = 0;
        hour < 24;
        hour++
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "day-hour-row";


        const time =
            document.createElement(
                "div"
            );


        time.className =
            "day-hour-label";


        time.textContent =
            formatHourLabel(
                hour
            );


        const content =
            document.createElement(
                "div"
            );


        content.className =
            "day-hour-content";


        row.appendChild(
            time
        );


        row.appendChild(
            content
        );


        timeline.appendChild(
            row
        );

    }

    const dateString =
        formatDate(
            currentDate
        );

    dayContainer.appendChild(
        timeline
    );

    const allDayEvents =
    getEventsForCalendarDate(
        dateString
    ).filter(
    event =>
        event.allDay === true ||
        isMultiDayEvent(
            event
        )
);

if (allDayEvents.length > 0) {

    const allDayContainer =
        document.createElement(
            "div"
        );

    allDayContainer.className =
        "day-all-day-container";

    const allDayLabel =
        document.createElement(
            "div"
        );

    allDayLabel.className =
        "day-all-day-label";

    allDayLabel.textContent =
        "All day";

    allDayContainer.appendChild(
        allDayLabel
    );

    allDayEvents.forEach(
    event => {

        const allDayEvent =
            createEventElement(
                event
            );

        if (!allDayEvent) {

            return;

        }

        allDayEvent.classList.add(
            "day-all-day-event"
        );

        const title =
            allDayEvent.querySelector(
                ".calendar-event-title"
            );

        if (title) {

            title.textContent =
                `${event.title || "Untitled event"} — All day`;

        }

        allDayContainer.appendChild(
            allDayEvent
        );

    }
);

    dayContainer.insertBefore(
        allDayContainer,
        timeline
    );

}

    const eventsLayer =
        document.createElement(
            "div"
        );


    eventsLayer.className =
        "day-events-layer";

        const dayEvents =
    getEventsForCalendarDate(
        dateString
    )
        .filter(
            event =>
                event.start &&
                event.allDay !== true
        )
            .map(
                event => {

                    const startMinutes =
                        getEventMinutes(
                            event.start
                        );


                    if (
                        startMinutes ===
                        null
                    ) {

                        return null;

                    }


                    let endMinutes =
                        getEventMinutes(
                            event.end
                        );


                    if (
                        endMinutes ===
                            null ||
                        endMinutes <=
                            startMinutes
                    ) {

                        endMinutes =
                            Math.min(
                                startMinutes +
                                    60,
                                24 * 60
                            );

                    }


                    return {
                        event,
                        startMinutes,
                        endMinutes,
                        column:
                            0,
                        columns:
                            1
                    };

                }
            )
            .filter(
                item =>
                    item !== null
            )
            .sort(
                (a, b) =>
                    a.startMinutes -
                    b.startMinutes
            );


    const activeEvents =
        [];


    dayEvents.forEach(
        item => {

            for (
                let i =
                    activeEvents.length -
                    1;
                i >= 0;
                i--
            ) {

                if (
                    activeEvents[i]
                        .endMinutes <=
                    item.startMinutes
                ) {

                    activeEvents.splice(
                        i,
                        1
                    );

                }

            }


            let column =
                0;


            while (
                activeEvents.some(
                    active =>
                        active.column ===
                        column
                )
            ) {

                column++;

            }


            item.column =
                column;


            activeEvents.push(
                item
            );

        }
    );


    dayEvents.forEach(
        item => {

            const group =
                dayEvents.filter(
                    other =>
                        other.startMinutes <
                            item.endMinutes &&
                        other.endMinutes >
                            item.startMinutes
                );


            const maxColumn =
                Math.max(
                    0,
                    ...group.map(
                        other =>
                            other.column
                    )
                );


            const columns =
                maxColumn + 1;


            group.forEach(
                member => {

                    member.columns =
                        Math.max(
                            member.columns,
                            columns
                        );

                }
            );

        }
    );


    dayEvents.forEach(
        item => {

            const event =
                item.event;


            const eventElement =
                createDayViewEvent(
                    event
                );


            if (!eventElement) {

                return;

            }


            eventElement.style.left =
                `calc(${(
                    item.column /
                    item.columns
                ) * 100}% + 8px)`;


            eventElement.style.width =
                `calc(${(
                    100 /
                    item.columns
                )}% - 12px)`;


            eventsLayer.appendChild(
                eventElement
            );

        }
    );


    createCurrentTimeLine(
        dayContainer
    );


    dayContainer.appendChild(
        eventsLayer
    );


    calendarDays.appendChild(
        dayContainer
    );


    const now =
        new Date();


    if (
        now.getFullYear() ===
            currentDate.getFullYear() &&
        now.getMonth() ===
            currentDate.getMonth() &&
        now.getDate() ===
            currentDate.getDate()
    ) {

        setTimeout(
            () => {

                scrollDayViewToCurrentTime();

            },
            50
        );

    }


    animateCalendarView();

}


/* ==========================================================
   CREATE DAY VIEW EVENT
========================================================== */

function createDayViewEvent(
    event
) {

    const startMinutes =
        getEventMinutes(
            event.start
        );


    if (
        startMinutes ===
        null
    ) {

        return null;

    }


    let endMinutes =
        getEventMinutes(
            event.end
        );


    if (
        endMinutes ===
            null ||
        endMinutes <=
            startMinutes
    ) {

        endMinutes =
            startMinutes + 60;

    }


    endMinutes =
        Math.min(
            endMinutes,
            1440
        );


    const duration =
        Math.max(
            30,
            endMinutes -
                startMinutes
        );


    const eventElement =
        createEventElement(
            event
        );


    eventElement.classList.add(
        "day-view-event"
    );


    eventElement.style.top =
        `${startMinutes *
            DAY_VIEW_PIXELS_PER_MINUTE}px`;


    eventElement.style.height =
        `${Math.max(
            40,
            duration *
                DAY_VIEW_PIXELS_PER_MINUTE
        )}px`;


    const category =
        getEventCategory(
            event
        );


    eventElement.innerHTML = `
        <div class="day-event-header">

            <span class="day-event-icon">
                ${category.icon}
            </span>

            <div class="day-event-time">
                ${escapeHTML(
                    formatTimeRange(
                        event
                    )
                )}
            </div>

        </div>

        <div class="day-event-title">
            ${escapeHTML(
                event.title ||
                "Untitled event"
            )}
        </div>

        ${
            event.description
                ? `
                    <div class="day-event-description">
                        ${escapeHTML(
                            event.description
                        )}
                    </div>
                  `
                : ""
        }
    `;


    const startLabel =
        formatTimeForDisplay(
            event.start
        );


    const endLabel =
        event.end
            ? formatTimeForDisplay(
                event.end
            )
            : "";


    eventElement.setAttribute(
        "aria-label",
        `${event.title}, ${startLabel}${
            endLabel
                ? ` to ${endLabel}`
                : ""
        }`
    );


    return eventElement;

}


/* ==========================================================
   GET EVENT MINUTES
========================================================== */

function getEventMinutes(
    time
) {

    if (!time) {

        return null;

    }


    const match =
        String(time).match(
            /^(\d{1,2}):(\d{2})/
        );


    if (!match) {

        return null;

    }


    const hour =
        Number(
            match[1]
        );


    const minute =
        Number(
            match[2]
        );


    if (
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {

        return null;

    }


    return (
        hour * 60 +
        minute
    );

}


/* ==========================================================
   COMPATIBILITY ALIAS
========================================================== */

function getTimeInMinutes(
    time
) {

    return getEventMinutes(
        time
    );

}


/* ==========================================================
   FORMAT EVENT TIME RANGE
========================================================== */

function formatTimeRange(
    event
) {

    if (!event.start) {

        return "";

    }


    if (!event.end) {

        return formatTime(
            event.start
        );

    }


    return (
        `${formatTime(
            event.start
        )} – ` +
        `${formatTime(
            event.end
        )}`
    );

}


/* ==========================================================
   FORMAT TIME
========================================================== */

function formatTime(
    time
) {

    const minutes =
        getEventMinutes(
            time
        );


    if (
        minutes ===
        null
    ) {

        return time || "";

    }


    const hour =
        Math.floor(
            minutes / 60
        );


    const minute =
        minutes % 60;


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    const displayHour =
        hour % 12 ||
        12;


    return (
        `${displayHour}:` +
        `${String(
            minute
        ).padStart(
            2,
            "0"
        )} ` +
        `${suffix}`
    );

}


/* ==========================================================
   FORMAT TIME FOR DISPLAY
========================================================== */

function formatTimeForDisplay(
    time
) {

    return formatTime(
        time
    );

}


/* ==========================================================
   CURRENT TIME LINE
========================================================== */

function createCurrentTimeLine(
    eventsColumn
) {

    if (!eventsColumn) {

        return;

    }


    const now =
        new Date();


    const minutes =
        now.getHours() * 60 +
        now.getMinutes();


    const line =
        document.createElement(
            "div"
        );


    line.className =
        "day-current-time";


    line.style.top =
        `${minutes *
            DAY_VIEW_PIXELS_PER_MINUTE}px`;


    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "day-current-time-dot";


    line.appendChild(
        dot
    );


    eventsColumn.appendChild(
        line
    );

}


/* ==========================================================
   COMPATIBILITY ALIAS
========================================================== */

function addCurrentTimeLine(
    eventsColumn
) {

    createCurrentTimeLine(
        eventsColumn
    );

}


/* ==========================================================
   SCROLL TO CURRENT TIME
========================================================== */

function scrollDayViewToCurrentTime() {

    const calendarDays =
        document.getElementById(
            "calendar-days"
        );


    if (!calendarDays) {

        return;

    }


    const now =
        new Date();


    const minutes =
        now.getHours() * 60 +
        now.getMinutes();


    const target =
        minutes *
            DAY_VIEW_PIXELS_PER_MINUTE -
        calendarDays.clientHeight *
            0.3;


    calendarDays.scrollTo({
        top:
            Math.max(
                0,
                target
            ),
        behavior:
            "smooth"
    });

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   FORMAT HOUR LABEL
========================================================== */

function formatHourLabel(
    hour
) {

    if (
        hour === 0 ||
        hour === 24
    ) {

        return "12 AM";

    }


    if (
        hour < 12
    ) {

        return `${hour} AM`;

    }


    if (
        hour === 12
    ) {

        return "12 PM";

    }


    return `${hour - 12} PM`;

}


/* ==========================================================
   GET EVENT HOUR
========================================================== */

function getEventHour(
    startTime
) {

    if (!startTime) {

        return null;

    }


    const match =
        String(startTime).match(
            /^(\d{1,2}):/
        );


    if (!match) {

        return null;

    }


    const hour =
        Number(
            match[1]
        );


    if (
        Number.isNaN(hour) ||
        hour < 0 ||
        hour > 23
    ) {

        return null;

    }


    return hour;

}


/* ==========================================================
   EVENT MODAL INITIALIZATION
========================================================== */

function initializeEventModal() {

    const eventModal =
        document.getElementById(
            "event-modal"
        );

    const addEventButton =
        document.getElementById(
            "add-event-btn"
        );

    const closeEventButton =
        document.getElementById(
            "close-event-modal"
        );

    const cancelEventButton =
        document.getElementById(
            "cancel-event"
        );

    const eventForm =
        document.getElementById(
            "event-form"
        );

    const dateInput =
    document.getElementById(
        "event-date"
    );

const endDateInput =
    document.getElementById(
        "event-end-date"
    );
  
    const allDayInput =
    document.getElementById(
        "event-all-day"
    );

const eventTimeRow =
    document.getElementById(
        "event-time-row"
    );

    if (
        !eventModal ||
        !addEventButton ||
        !closeEventButton ||
        !cancelEventButton ||
        !eventForm
    ) {

        console.warn(
            "HomeUp: event modal elements not found."
        );

        return;

    }

    if (dateInput && endDateInput) {

    dateInput.addEventListener(
        "change",
        () => {

            if (
                !endDateInput.value ||
                endDateInput.value < dateInput.value
            ) {

                endDateInput.value =
                    dateInput.value;

            }

        }
    );

}

    function updateAllDayUI() {

    if (
        !allDayInput ||
        !eventTimeRow
    ) {
        return;
    }

    const startInput =
        document.getElementById(
            "event-start"
        );

    const endInput =
        document.getElementById(
            "event-end"
        );


    if (allDayInput.checked) {

        /*
           All-day events do not use
           start/end times.
        */

        eventTimeRow.classList.add(
            "all-day-hidden"
        );


        if (startInput) {

            startInput.required = false;
            startInput.disabled = true;

        }


        if (endInput) {

            endInput.required = false;
            endInput.disabled = true;

        }

    }

    else {

        /*
           Timed events use the
           normal time fields.
        */

        eventTimeRow.classList.remove(
            "all-day-hidden"
        );


        if (startInput) {

            startInput.disabled = false;
            startInput.required = true;

        }


        if (endInput) {

            endInput.disabled = false;

            /*
               End time remains optional.
            */

            endInput.required = false;

        }

    }

}

  if (allDayInput) {

    allDayInput.addEventListener(
        "change",
        updateAllDayUI
    );

}

  updateAllDayUI();

   /* ======================================================
       REPEAT BUTTON
    ====================================================== */

    const repeatRow =
        document.getElementById(
            "event-repeat-row"
        );

    const repeatPanel =
        document.getElementById(
            "repeat-panel"
        );

    const repeatBackButton =
        document.getElementById(
            "repeat-back-btn"
        );


    if (repeatRow && repeatPanel) {

        repeatRow.addEventListener(
            "click",
            () => {

                repeatPanel.classList.remove(
                    "hidden"
                );

                repeatPanel.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }
        );

    }


    if (repeatBackButton && repeatPanel) {

        repeatBackButton.addEventListener(
            "click",
            () => {

                repeatPanel.classList.add(
                    "hidden"
                );

                repeatPanel.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }

    addEventButton.addEventListener(
        "click",
        () => {

            openEventModal();

        }
    );


    closeEventButton.addEventListener(
        "click",
        closeEventModal
    );


    cancelEventButton.addEventListener(
        "click",
        closeEventModal
    );


    eventModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                eventModal
            ) {

                closeEventModal();

            }

        }
    );


    eventForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const titleInput =
                document.getElementById(
                    "event-title"
                );

            const dateInput =
                document.getElementById(
                    "event-date"
                );

            const endDateInput =
    document.getElementById(
        "event-end-date"
    );

            const startInput =
                document.getElementById(
                    "event-start"
                );

            const endInput =
                document.getElementById(
                    "event-end"
                );

            const descriptionInput =
                document.getElementById(
                    "event-description"
                );

            const allDayInput =
    document.getElementById(
        "event-all-day"
    );

            if (
                !titleInput ||
                !dateInput ||
                !startInput ||
                !endInput ||
                !descriptionInput
            ) {

                return;

            }


            const title =
                titleInput.value.trim();


            const date =
                dateInput.value;

            const endDate =
    endDateInput?.value ||
    date;

            const start =
                startInput.value;


            const end =
                endInput.value;


            const description =
                descriptionInput.value.trim();

            const allDay =
    allDayInput?.checked || false;

            /*
               CATEGORY
            */

            const categoryInput =
                document.getElementById(
                    "event-category"
                );


            const selectedCategory =
                categoryInput?.value ||
                DEFAULT_EVENT_CATEGORY;


            const category =
                EVENT_CATEGORIES[
                    selectedCategory
                ]
                    ? selectedCategory
                    : DEFAULT_EVENT_CATEGORY;


            /*
               COLOR
            */

            const colorInput =
                document.getElementById(
                    "event-color"
                );


            const selectedColor =
                colorInput?.value ||
                EVENT_CATEGORIES[
                    category
                ].color ||
                DEFAULT_EVENT_COLOR;


            if (
    !title ||
    !date ||
    (!allDay && !start)
) {

    return;

}


            const editingId =
                eventForm.dataset.editingId;


            /*
               EDIT EXISTING EVENT
            */

            if (editingId) {

                const existingEvent =
                    events.find(
                        item =>
                            item.id ===
                            editingId
                    );


                if (existingEvent) {

                    existingEvent.title =
                        title;

                    existingEvent.date =
    date;

existingEvent.endDate =
    endDate;

existingEvent.start =
    allDay
        ? ""
        : start;

existingEvent.end =
    allDay
        ? ""
        : end;

existingEvent.allDay =
    allDay;

existingEvent.description =
    description;

                    existingEvent.category =
                        category;

                    existingEvent.color =
                        selectedColor;

                    existingEvent.recurrence =
    selectedRepeat &&
    selectedRepeat !== "none"
        ? {

            frequency:
                selectedRepeat,

            interval:
                selectedRepeat === "daily"
                    ? repeatDailyInterval
                    : selectedRepeat === "weekly"
                        ? repeatWeeklyInterval
                        : selectedRepeat === "monthly"
                            ? repeatMonthlyInterval
                            : selectedRepeat === "yearly"
                                ? repeatYearlyInterval
                                : 1,

            daysOfWeek:
                selectedRepeat === "weekly"
                    ? [...repeatWeekdays]
                    : [],

            duration:
                selectedDuration,

            count:
                selectedDuration === "count"
                    ? Math.max(
                        1,
                        Number(
                            document.getElementById(
                                "repeat-count"
                            )?.value
                        ) || 1
                    )
                    : null,

            until:
                selectedDuration === "until"
                    ? (
                        document.getElementById(
                            "repeat-until"
                        )?.value ||
                        null
                    )
                    : null

        }
        : null;

                }


                delete eventForm.dataset.editingId;

            }


            /*
               CREATE NEW EVENT
            */

            else {

                const newEvent = {

                    id:
                        createEventId(),

                    title:
                        title,

                    date:
    date,

endDate:
    endDate,

start:
    allDay
        ? ""
        : start,

end:
    allDay
        ? ""
        : end,

allDay:
    allDay,

recurrence:
    selectedRepeat &&
    selectedRepeat !== "none"
        ? {

            frequency:
                selectedRepeat,

            interval:
                selectedRepeat === "daily"
                    ? repeatDailyInterval
                    : selectedRepeat === "weekly"
                        ? repeatWeeklyInterval
                        : selectedRepeat === "monthly"
                            ? repeatMonthlyInterval
                            : selectedRepeat === "yearly"
                                ? repeatYearlyInterval
                                : 1,

            daysOfWeek:
                selectedRepeat === "weekly"
                    ? [...repeatWeekdays]
                    : [],

            duration:
                typeof selectedDuration !== "undefined"
                    ? selectedDuration
                    : "forever",

            count:
                selectedDuration === "count"
                    ? Math.max(
                        1,
                        Number(
                            durationCountInput?.value
                        ) || 1
                    )
                    : null,

            until:
                selectedDuration === "until"
                    ? (
                        durationUntilInput?.value ||
                        null
                    )
                    : null

        }
        : null,

                    description:
                        description,

                    category:
                        category,

                    color:
                        selectedColor

                };


                events.push(
                    newEvent
                );

            }


            saveEvents();


            closeEventModal();


            /*
               MOVE TO EVENT DATE
            */

            const dateParts =
                date.split("-");


            if (
                dateParts.length ===
                3
            ) {

                currentDate =
                    new Date(
                        Number(
                            dateParts[0]
                        ),
                        Number(
                            dateParts[1]
                        ) - 1,
                        Number(
                            dateParts[2]
                        )
                    );

            }


            renderCalendar();

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                    "Escape" &&
                !eventModal.classList.contains(
                    "hidden"
                )
            ) {

                closeEventModal();

            }

        }
    );

}


/* ==========================================================
   INITIALIZE CATEGORY CONTROLS
========================================================== */

function initializeEventCategoryControls() {

    const form =
        document.getElementById(
            "event-form"
        );


    if (!form) {

        return;

    }


    let categoryInput =
        document.getElementById(
            "event-category"
        );


    let colorInput =
        document.getElementById(
            "event-color"
        );


    /*
       If the HTML does not contain
       these fields yet, create them.
    */

    if (!categoryInput) {

        categoryInput =
            document.createElement(
                "input"
            );


        categoryInput.type =
            "hidden";


        categoryInput.id =
            "event-category";


        categoryInput.name =
            "event-category";


        categoryInput.value =
            DEFAULT_EVENT_CATEGORY;


        form.appendChild(
            categoryInput
        );

    }


    if (!colorInput) {

        colorInput =
            document.createElement(
                "input"
            );


        colorInput.type =
            "hidden";


        colorInput.id =
            "event-color";


        colorInput.name =
            "event-color";


        colorInput.value =
            DEFAULT_EVENT_COLOR;


        form.appendChild(
            colorInput
        );

    }


    createCategoryDropdown(
        categoryInput
    );


    createColorPicker(
        colorInput
    );

}


/* ==========================================================
   CREATE CATEGORY DROPDOWN
========================================================== */

function createCategoryDropdown(
    hiddenInput
) {

    if (
        document.getElementById(
            "event-category-control"
        )
    ) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "event-category-control";


    wrapper.className =
        "event-category-control";


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        "Select Category";


    label.setAttribute(
        "for",
        "event-category-trigger"
    );


    wrapper.appendChild(
        label
    );


    const dropdown =
        document.createElement(
            "div"
        );


    dropdown.className =
        "event-category-dropdown";


    const trigger =
        document.createElement(
            "button"
        );


    trigger.type =
        "button";


    trigger.id =
        "event-category-trigger";


    trigger.className =
        "event-category-trigger";


    trigger.setAttribute(
        "aria-haspopup",
        "listbox"
    );


    trigger.setAttribute(
        "aria-expanded",
        "false"
    );


    dropdown.appendChild(
        trigger
    );


    const options =
        document.createElement(
            "div"
        );


    options.className =
        "event-category-options";


    options.setAttribute(
        "role",
        "listbox"
    );


    Object.entries(
        EVENT_CATEGORIES
    ).forEach(
        ([key, category]) => {

            const option =
                document.createElement(
                    "button"
                );


            option.type =
                "button";


            option.className =
                "event-category-option";


            option.dataset.category =
                key;


            option.setAttribute(
                "role",
                "option"
            );


            option.innerHTML = `
                <span
                    class="event-category-option-icon"
                    style="--category-color:${category.color}"
                >
                    ${category.icon}
                </span>

                <span
                    class="event-category-option-name"
                >
                    ${category.name}
                </span>
            `;


            option.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    hiddenInput.value =
                        key;


                    updateCategoryTrigger(
                        trigger,
                        key
                    );


                    options.classList.remove(
                        "open"
                    );


                    trigger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );


            options.appendChild(
                option
            );

        }
    );


    dropdown.appendChild(
        options
    );


    wrapper.appendChild(
        dropdown
    );


    /*
       Put the category control
       before the color control.
    */

    const descriptionInput =
        document.getElementById(
            "event-description"
        );


    if (
        descriptionInput &&
        descriptionInput.parentElement
    ) {

        descriptionInput.parentElement.after(
            wrapper
        );

    }

    else {

        hiddenInput.parentElement?.appendChild(
            wrapper
        );

    }


    updateCategoryTrigger(
        trigger,
        hiddenInput.value ||
            DEFAULT_EVENT_CATEGORY
    );


    trigger.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                options.classList.contains(
                    "open"
                );


            document
                .querySelectorAll(
                    ".event-category-options.open"
                )
                .forEach(
                    element => {

                        element.classList.remove(
                            "open"
                        );

                    }
                );


            document
                .querySelectorAll(
                    ".event-category-trigger[aria-expanded='true']"
                )
                .forEach(
                    element => {

                        element.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );


            if (!isOpen) {

                options.classList.add(
                    "open"
                );


                trigger.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !wrapper.contains(
                    event.target
                )
            ) {

                options.classList.remove(
                    "open"
                );


                trigger.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}


/* ==========================================================
   UPDATE CATEGORY TRIGGER
========================================================== */

function updateCategoryTrigger(
    trigger,
    categoryKey
) {

    const category =
        EVENT_CATEGORIES[
            categoryKey
        ] ||
        EVENT_CATEGORIES.other;


    trigger.innerHTML = `
        <span
            class="event-category-selected-icon"
            style="--category-color:${category.color}"
        >
            ${category.icon}
        </span>

        <span class="event-category-selected-name">
            ${category.name}
        </span>

        <span class="event-category-chevron">

            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="m6 9 6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>

        </span>
    `;

}


/* ==========================================================
   CREATE COLOR PICKER
========================================================== */

function createColorPicker(
    hiddenInput
) {

    if (
        document.getElementById(
            "event-color-control"
        )
    ) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "event-color-control";


    wrapper.className =
        "event-color-control";


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        "Event Color";


    label.setAttribute(
        "for",
        "event-color-picker"
    );


    wrapper.appendChild(
        label
    );


    const colorRow =
        document.createElement(
            "div"
        );


    colorRow.className =
        "event-color-row";


    const colorPicker =
        document.createElement(
            "input"
        );


    colorPicker.type =
        "color";


    colorPicker.id =
        "event-color-picker";


    colorPicker.className =
        "event-color-picker";


    colorPicker.value =
        isValidColor(
            hiddenInput.value
        )
            ? hiddenInput.value
            : DEFAULT_EVENT_COLOR;


    colorPicker.addEventListener(
        "input",
        () => {

            hiddenInput.value =
                colorPicker.value;

            updateColorPreview(
                preview,
                colorPicker.value
            );

        }
    );


    colorRow.appendChild(
        colorPicker
    );


    const preview =
        document.createElement(
            "span"
        );


    preview.className =
        "event-color-preview";


    updateColorPreview(
        preview,
        colorPicker.value
    );


    colorRow.appendChild(
        preview
    );


    const colorText =
        document.createElement(
            "span"
        );


    colorText.className =
        "event-color-value";


    colorText.textContent =
        colorPicker.value;


    colorPicker.addEventListener(
        "input",
        () => {

            colorText.textContent =
                colorPicker.value;

        }
    );


    colorRow.appendChild(
        colorText
    );


    wrapper.appendChild(
        colorRow
    );


    const categoryControl =
        document.getElementById(
            "event-category-control"
        );


    if (categoryControl) {

        categoryControl.after(
            wrapper
        );

    }

    else {

        hiddenInput.parentElement?.appendChild(
            wrapper
        );

    }

}


/* ==========================================================
   UPDATE COLOR PREVIEW
========================================================== */

function updateColorPreview(
    preview,
    color
) {

    if (!preview) {

        return;

    }


    preview.style.background =
        color;

}


/* ==========================================================
   VALIDATE COLOR
========================================================== */

function isValidColor(
    color
) {

    if (
        !color ||
        typeof color !==
            "string"
    ) {

        return false;

    }


    const test =
        document.createElement(
            "div"
        );


    test.style.color =
        color;


    return Boolean(
        test.style.color
    );

}


/* ==========================================================
   OPEN EVENT MODAL
========================================================== */

function openEventModal(
    date = null,
    eventToEdit = null
) {

    const modal =
        document.getElementById(
            "event-modal"
        );

    const form =
        document.getElementById(
            "event-form"
        );

    const titleInput =
        document.getElementById(
            "event-title"
        );

    const dateInput =
        document.getElementById(
            "event-date"
        );

    const endDateInput =
    document.getElementById(
        "event-end-date"
    );

    const startInput =
        document.getElementById(
            "event-start"
        );

    const endInput =
        document.getElementById(
            "event-end"
        );

    const descriptionInput =
        document.getElementById(
            "event-description"
        );

    const categoryInput =
        document.getElementById(
            "event-category"
        );

    const colorInput =
        document.getElementById(
            "event-color"
        );

    const categoryTrigger =
        document.getElementById(
            "event-category-trigger"
        );

    const colorPicker =
        document.getElementById(
            "event-color-picker"
        );

    const colorPreview =
        document.querySelector(
            ".event-color-preview"
        );

    const colorValue =
        document.querySelector(
            ".event-color-value"
        );

    const modalTitle =
        document.querySelector(
            ".event-modal-header h2"
        );


    if (
        !modal ||
        !form ||
        !titleInput ||
        !dateInput ||
        !startInput ||
        !endInput ||
        !descriptionInput
    ) {

        console.warn(
            "HomeUp: event modal fields not found."
        );

        return;

    }


    form.reset();


    /*
       EDIT
    */

    if (eventToEdit) {

        form.dataset.editingId =
            eventToEdit.id;


        if (modalTitle) {

            modalTitle.textContent =
                "Edit Event";

        }


        titleInput.value =
            eventToEdit.title ||
            "";


        dateInput.value =
            eventToEdit.date ||
            "";


        startInput.value =
            eventToEdit.start ||
            "";


        endInput.value =
            eventToEdit.end ||
            "";


        descriptionInput.value =
            eventToEdit.description ||
            "";


        const category =
            eventToEdit.category &&
            EVENT_CATEGORIES[
                eventToEdit.category
            ]
                ? eventToEdit.category
                : DEFAULT_EVENT_CATEGORY;


        const color =
            isValidColor(
                eventToEdit.color
            )
                ? eventToEdit.color
                : (
                    EVENT_CATEGORIES[
                        category
                    ]?.color ||
                    DEFAULT_EVENT_COLOR
                );


        if (categoryInput) {

            categoryInput.value =
                category;

        }


        if (colorInput) {

            colorInput.value =
                color;

        }


        if (categoryTrigger) {

            updateCategoryTrigger(
                categoryTrigger,
                category
            );

        }


        if (colorPicker) {

            colorPicker.value =
                color;

        }


        if (colorPreview) {

            updateColorPreview(
                colorPreview,
                color
            );

        }


        if (colorValue) {

            colorValue.textContent =
                color;

        }

    }


    /*
       ADD
    */

    else {

        delete form.dataset.editingId;


        if (modalTitle) {

            modalTitle.textContent =
                "Add Event";

        }


        
      
        const defaultStartDate =
    date ||
    formatDate(
        currentDate
    );

dateInput.value =
    defaultStartDate;

if (endDateInput) {

    endDateInput.value =
        defaultStartDate;

}

        const defaultCategory =
            DEFAULT_EVENT_CATEGORY;


        const defaultColor =
            EVENT_CATEGORIES[
                defaultCategory
            ].color;


        if (categoryInput) {

            categoryInput.value =
                defaultCategory;

        }


        if (colorInput) {

            colorInput.value =
                defaultColor;

        }


        if (categoryTrigger) {

            updateCategoryTrigger(
                categoryTrigger,
                defaultCategory
            );

        }


        if (colorPicker) {

            colorPicker.value =
                defaultColor;

        }


        if (colorPreview) {

            updateColorPreview(
                colorPreview,
                defaultColor
            );

        }


        if (colorValue) {

            colorValue.textContent =
                defaultColor;

        }

    }


    modal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            titleInput.focus();

        },
        50
    );

}


/* ==========================================================
   CLOSE EVENT MODAL
========================================================== */

function closeEventModal() {

    const modal =
        document.getElementById(
            "event-modal"
        );

    const form =
        document.getElementById(
            "event-form"
        );

    const modalTitle =
        document.querySelector(
            ".event-modal-header h2"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "hidden"
    );


    if (form) {

        form.reset();

        delete form.dataset.editingId;

    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Event";

    }

}


/* ==========================================================
   CREATE EVENT ID
========================================================== */

function createEventId() {

    if (
        typeof crypto !==
            "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


/* ==========================================================
   SAVE EVENTS
========================================================== */

function saveEvents() {

    localStorage.setItem(
        "homeup-events",
        JSON.stringify(
            events
        )
    );

}

/* ==========================================================
   AI CREATE EVENT
========================================================== */

function createEventFromAI(data) {

    if (!data) {
        return false;
    }

    const title =
        String(data.title || "").trim();

    const date =
        String(data.date || "").trim();

    const start =
        String(data.start || "").trim();

    const end =
        String(data.end || "").trim();

    const description =
        String(data.description || "").trim();

    if (!title || !date || !start) {

        console.error(
            "HomeUp AI: Missing event information.",
            data
        );

        return false;

    }

    const category =
        EVENT_CATEGORIES[data.category]
            ? data.category
            : DEFAULT_EVENT_CATEGORY;

    const color =
        data.color ||
        EVENT_CATEGORIES[category]?.color ||
        DEFAULT_EVENT_COLOR;

    const newEvent = {

        id:
            createEventId(),

        title:
            title,

        date:
            date,

        start:
            start,

        end:
            end,

        description:
            description,

        category:
            category,

        color:
            color

    };

    events.push(
        newEvent
    );

    saveEvents();

    /*
       Move calendar to the
       newly created event date.
    */

    const dateParts =
        date.split("-");

    if (
        dateParts.length === 3
    ) {

        currentDate =
            new Date(
                Number(dateParts[0]),
                Number(dateParts[1]) - 1,
                Number(dateParts[2])
            );

    }

    /*
       Refresh the calendar
    */

    renderCalendar();

    console.log(
        "HomeUp AI created calendar event:",
        newEvent
    );

    return true;
}

/* ==========================================================
   INJECT CATEGORY / COLOR STYLES
========================================================== */

/*
   These styles are injected by JavaScript so
   the new category UI does not depend on you
   manually finding CSS sections.

   Your existing calendar CSS remains untouched.
*/

function injectEventCategoryStyles() {

    if (
        document.getElementById(
            "homeup-event-category-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "homeup-event-category-styles";


    style.textContent = `

        /* ==================================================
           EVENT CATEGORY CONTROL
        ================================================== */

        .event-category-control,
        .event-color-control {
            width: 100%;
            margin-top: 14px;
        }


        .event-category-control > label,
        .event-color-control > label {
            display: block;
            margin-bottom: 7px;
            font-size: 13px;
            font-weight: 600;
        }


        .event-category-dropdown {
            position: relative;
            width: 100%;
        }


        .event-category-trigger {
            width: 100%;
            min-height: 44px;

            display: flex;
            align-items: center;
            gap: 10px;

            padding: 10px 12px;

            border: 1px solid
                rgba(100, 116, 139, 0.25);

            border-radius: 22px;

            background: var(--card-bg, #fafafa);

            color: inherit;

            cursor: pointer;

            text-align: left;

            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }


        .event-category-trigger:hover {
            border-color:
                rgba(59, 130, 246, 0.55);
        }


        .event-category-trigger:focus {
            outline: none;

            border-color:
                rgba(59, 130, 246, 0.8);

            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.12);
        }


        .event-category-selected-icon,
        .event-category-option-icon {
            width: 25px;
            height: 25px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            flex: 0 0 auto;

            color: var(--category-color);
        }


        .event-category-selected-icon svg,
        .event-category-option-icon svg {
            width: 20px;
            height: 20px;
        }


        .event-category-selected-name {
            flex: 1;
            font-size: 14px;
        }


        .event-category-chevron {
            width: 18px;
            height: 18px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            opacity: 0.65;
        }


        .event-category-chevron svg {
            width: 17px;
            height: 17px;
        }


        .event-category-options {
            position: absolute;

            left: 0;
            right: 0;

            top: calc(100% + 6px);

            z-index: 7000;

            display: none;

            padding: 6px;

            border: 1px solid
                rgba(100, 116, 139, 0.18);

            border-radius: 11px;

            background:
                var(--card-bg, #fff);

            box-shadow:
                0 12px 30px
                rgba(15, 23, 42, 0.14);

            max-height: 280px;

            overflow-y: auto;
        }


        .event-category-options.open {
            display: block;

            animation:
                homeupCategoryMenuIn
                0.16s ease;
        }


        .event-category-option {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 10px;

            padding: 9px 10px;

            border: none;

            border-radius: 8px;

            background: transparent;

            color: inherit;

            cursor: pointer;

            text-align: left;

            transition:
                background 0.15s ease;
        }


        .event-category-option:hover {
            background:
                rgba(100, 116, 139, 0.08);
        }


        .event-category-option-name {
            font-size: 14px;
        }


        /* ==================================================
           COLOR CONTROL
        ================================================== */

        .event-color-row {
            display: flex;

            align-items: center;

            gap: 10px;
        }


        .event-color-picker {
            width: 42px;
            height: 42px;

            padding: 3px;

            border: 1px solid
                rgba(100, 116, 139, 0.25);

            border-radius: 9px;

            background: transparent;

            cursor: pointer;
        }


        .event-color-preview {
            width: 22px;
            height: 22px;

            display: inline-block;

            border-radius: 50%;

            border: 2px solid
                rgba(255, 255, 255, 0.9);

            box-shadow:
                0 0 0 1px
                rgba(100, 116, 139, 0.25);
        }


        .event-color-value {
            font-size: 13px;

            opacity: 0.7;

            text-transform: uppercase;
        }


        /* ==================================================
           CALENDAR EVENTS
        ================================================== */

        .calendar-event {
    --event-color: #64748b;
    --event-text-color: #000;

    border-left:
        3px solid
        var(--event-color);

    color: var(--event-text-color);
}


        .calendar-event-icon {
    width: 15px;
    height: 15px;

    display: inline-flex;

    align-items: center;
    justify-content: center;

    flex: 0 0 auto;

    color: inherit;
}

.calendar-event-icon svg {
    width: 14px;
    height: 14px;
}

.calendar-event-time {
    color: inherit;
    font-weight: 600;
}


        /* ==================================================
           DAY VIEW EVENTS
        ================================================== */

        .day-view-event {
    --event-color: #64748b;
    --event-text-color: #000000;

    border-left:
        4px solid
        var(--event-color);

    color: var(--event-text-color);
}


        .day-event-header {
            display: flex;

            align-items: center;

            gap: 6px;

            min-width: 0;
        }


        .day-event-icon {
    width: 17px;
    height: 17px;

    display: inline-flex;

    align-items: center;
    justify-content: center;

    flex: 0 0 auto;

    color: inherit;
}

.day-event-icon svg {
    width: 16px;
    height: 16px;
}

.day-event-time {
    color: inherit;
    font-weight: 600;
}


        /* ==================================================
           EVENT ACTION MENU
        ================================================== */

        #event-actions-menu {
            min-width: 150px;

            padding: 6px;

            border-radius: 10px;

            background:
                var(--card-bg, #fff);

            border: 1px solid
                rgba(100, 116, 139, 0.18);

            box-shadow:
                0 14px 35px
                rgba(15, 23, 42, 0.18);

            opacity: 0;

            transform:
                translateY(-4px)
                scale(0.98);

            transition:
                opacity 0.18s ease,
                transform 0.18s ease;
        }


        #event-actions-menu.show {
            opacity: 1;

            transform:
                translateY(0)
                scale(1);
        }


        #event-actions-menu button {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 10px;

            padding: 9px 10px;

            border: none;

            border-radius: 7px;

            background: transparent;

            color: inherit;

            cursor: pointer;

            text-align: left;

            font-size: 14px;
        }


        #event-actions-menu button:hover {
            background:
                rgba(100, 116, 139, 0.08);
        }


        .event-action-icon {
            width: 18px;
            height: 18px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            flex: 0 0 auto;
        }


        .event-action-icon svg {
            width: 17px;
            height: 17px;
        }


        #event-actions-menu
        button[data-action="delete"] {
            color: #ef4444;
        }


        @keyframes homeupCategoryMenuIn {

            from {
                opacity: 0;

                transform:
                    translateY(-4px);
            }

            to {
                opacity: 1;

                transform:
                    translateY(0);
            }

        }

    `;


    document.head.appendChild(
        style
    );

}

/* ==========================================================
   REPEAT OPTIONS
========================================================== */

function initializeRepeatOptions() {

    const repeatPanel =
        document.getElementById("repeat-panel");

    if (!repeatPanel) {

        console.warn(
            "HomeUp: repeat panel not found."
        );

        return;
    }


    /* ======================================================
       ELEMENTS
    ====================================================== */

    const repeatRow =
        document.getElementById(
            "event-repeat-row"
        );

    const repeatRowValue =
        repeatRow
            ? repeatRow.querySelector(
                ".repeat-row-value"
            )
            : null;

    const repeatBackButton =
        document.getElementById(
            "repeat-back-btn"
        );

    const repeatOptions =
        repeatPanel.querySelectorAll(
            ".repeat-option"
        );

    const weekdayContainer =
        document.getElementById(
            "repeat-weekdays"
        );

    const weekdayButtons =
        repeatPanel.querySelectorAll(
            ".repeat-weekdays button"
        );

    const durationPanel =
        document.getElementById(
            "repeat-duration"
        );

    const durationOptions =
        repeatPanel.querySelectorAll(
            ".duration-option"
        );

    const durationCountInput =
        document.getElementById(
            "repeat-count"
        );

    const durationUntilInput =
        document.getElementById(
            "repeat-until"
        );


/* ======================================================
   DEFAULT STATE
====================================================== */

/*
   Make sure global repeat variables exist.
   These are used by the calendar event system.
*/

if (
    typeof selectedRepeat ===
    "undefined"
) {
    selectedRepeat = "none";
}

if (
    typeof repeatWeekdays ===
    "undefined"
) {
    repeatWeekdays = [];
}

if (
    typeof repeatDailyInterval ===
    "undefined"
) {
    repeatDailyInterval = 1;
}

if (
    typeof repeatWeeklyInterval ===
    "undefined"
) {
    repeatWeeklyInterval = 1;
}

if (
    typeof repeatMonthlyInterval ===
    "undefined"
) {
    repeatMonthlyInterval = 1;
}

if (
    typeof repeatYearlyInterval ===
    "undefined"
) {
    repeatYearlyInterval = 1;
}


    /* ======================================================
       UPDATE SUMMARY
    ====================================================== */

    function updateRepeatSummary() {

    if (!repeatRowValue) {
        return;
    }

    /* ==================================================
       DON'T REPEAT
    ================================================== */

    if (
        !selectedRepeat ||
        selectedRepeat === "none"
    ) {

        repeatRowValue.textContent =
            "Does not repeat";

        return;
    }


    let summary = "";


    /* ==================================================
       DAILY
    ================================================== */

    if (
        selectedRepeat === "daily"
    ) {

        const interval =
            Number(repeatDailyInterval) || 1;

        summary =
            interval === 1
                ? "Every day"
                : `Every ${interval} days`;
    }


    /* ==================================================
       WEEKLY
    ================================================== */

    else if (
        selectedRepeat === "weekly"
    ) {

        const interval =
            Number(repeatWeeklyInterval) || 1;

        const days =
            [...repeatWeekdays]
                .sort((a, b) => a - b);


        /*
           ALL 7 DAYS
           Sunday = 0
           Saturday = 6
        */

        const allDays =
            [0, 1, 2, 3, 4, 5, 6];

        const everyDay =
            days.length === 7 &&
            allDays.every(
                day => days.includes(day)
            );


        /*
           MONDAY → FRIDAY
        */

        const weekdaysOnly =
            [1, 2, 3, 4, 5].every(
                day => days.includes(day)
            ) &&
            days.length === 5;


        /*
           SATURDAY + SUNDAY
        */

        const weekendOnly =
            days.length === 2 &&
            days.includes(0) &&
            days.includes(6);


        if (
            interval === 1 &&
            everyDay
        ) {

            summary =
                "Every day";

        }

        else if (
            interval === 1 &&
            weekdaysOnly
        ) {

            summary =
                "Every weekday";

        }

        else if (
            interval === 1 &&
            weekendOnly
        ) {

            summary =
                "Every weekend";

        }

        else {

            summary =
                interval === 1
                    ? "Every week"
                    : `Every ${interval} weeks`;


            if (days.length > 0) {

                const dayNames = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ];

                summary +=
                    ` on ${days
                        .map(day => dayNames[day])
                        .join(", ")}`;
            }
        }
    }


    /* ==================================================
       MONTHLY
    ================================================== */

    else if (
        selectedRepeat === "monthly"
    ) {

        const interval =
            Number(repeatMonthlyInterval) || 1;

        summary =
            interval === 1
                ? "Every month"
                : `Every ${interval} months`;
    }


    /* ==================================================
       YEARLY
    ================================================== */

    else if (
        selectedRepeat === "yearly"
    ) {

        const interval =
            Number(repeatYearlyInterval) || 1;

        summary =
            interval === 1
                ? "Every year"
                : `Every ${interval} years`;
    }


    /* ==================================================
       DURATION
    ================================================== */

    if (
        selectedDuration === "count"
    ) {

        const count =
            Math.max(
                1,
                Number(
                    durationCountInput
                        ? durationCountInput.value
                        : 1
                ) || 1
            );

        summary +=
            `, ${count} times`;
    }


    else if (
        selectedDuration === "until"
    ) {

        if (
            durationUntilInput &&
            durationUntilInput.value
        ) {

            const date =
                new Date(
                    durationUntilInput.value +
                    "T00:00:00"
                );

            const formatted =
                date.toLocaleDateString(
                    undefined,
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );

            summary +=
                `, until ${formatted}`;
        }
    }


    else if (
        selectedDuration === "forever"
    ) {

        summary +=
            ", forever";
    }


    repeatRowValue.textContent =
        summary;
}

    /* ======================================================
       RESET PANEL
    ====================================================== */

    function resetRepeatPanel() {

        /*
           Reset repeat type.
        */

        selectedRepeat = "none";


        /*
           Reset duration.
        */

        selectedDuration = "forever";


        /*
           Hide weekdays.
        */

        if (weekdayContainer) {

            weekdayContainer.classList.add(
                "hidden"
            );
          
        }


        /*
           Hide duration.
        */

        if (durationPanel) {

            durationPanel.classList.add(
                "hidden"
            );
        }


        /*
           Remove selected repeat options.
        */

        repeatOptions.forEach(option => {

            option.classList.remove(
                "selected"
            );

        });


        /*
           Select DON'T REPEAT.
        */

        const noneOption =
            repeatPanel.querySelector(
                '.repeat-option[data-repeat="none"]'
            );

        if (noneOption) {

            noneOption.classList.add(
                "selected"
            );
        }


        /*
           Reset weekdays.
        */

        repeatWeekdays = [];


        weekdayButtons.forEach(button => {

            button.classList.remove(
                "selected"
            );

        });


        /*
           Reset duration buttons.
        */

        durationOptions.forEach(option => {

            option.classList.remove(
                "selected"
            );

        });


        /*
           Select FOREVER by default.
        */

        const foreverOption =
            repeatPanel.querySelector(
                '[data-duration="forever"]'
            );

        if (foreverOption) {

            foreverOption.classList.add(
                "selected"
            );
        }


        /*
           Hide count input.
        */

        if (durationCountInput) {

            durationCountInput.classList.add(
                "hidden"
            );

            durationCountInput.value = 1;
        }


        /*
           Hide until input.
        */

        if (durationUntilInput) {

            durationUntilInput.classList.add(
                "hidden"
            );

            durationUntilInput.value = "";
        }


        /*
           Reset summary.
        */

        updateRepeatSummary();
    }


    /* ======================================================
       OPEN REPEAT PANEL
    ====================================================== */

    if (repeatRow) {

    repeatRow.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            resetRepeatPanel();

            openRepeatPanel();

        }
    );

}


    /* ======================================================
       CLOSE REPEAT PANEL
    ====================================================== */

    if (repeatBackButton) {

    repeatBackButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeRepeatPanel();

        }
    );

}

/* ======================================================
   CLICK OUTSIDE REPEAT FORM TO CLOSE
====================================================== */

repeatPanel.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            repeatPanel
        ) {

            closeRepeatPanel();

        }

    }
);

    /* ======================================================
       REPEAT OPTIONS
    ====================================================== */

    repeatOptions.forEach(option => {

        option.addEventListener(
            "click",
            function(event) {

                /*
                   Ignore direct input clicks.
                */

                if (
                    event.target.tagName ===
                    "INPUT"
                ) {

                    return;
                }


                const selected =
                    this.dataset.repeat ||
                    "none";


                selectedRepeat =
                    selected;


                /*
                   Remove selected state.
                */

                repeatOptions.forEach(item => {

                    item.classList.remove(
                        "selected"
                    );

                });


                /*
                   Select current option.
                */

                this.classList.add(
                    "selected"
                );


                /* ==========================================
                   WEEKDAYS
                ========================================== */

                if (
                    selectedRepeat ===
                    "weekly"
                ) {

                    if (weekdayContainer) {

                        weekdayContainer.classList.remove(
                            "hidden"
                        );

                        weekdayContainer.style.removeProperty(
                            "display"
                        );

                    }

                } else {

                    if (weekdayContainer) {

                        weekdayContainer.classList.add(
                            "hidden"
                        );

                        weekdayContainer.style.setProperty(
                            "display",
                            "none",
                            "important"
                        );

                    }
                }


                /* ==========================================
                   DURATION
                ========================================== */

                if (
                    selectedRepeat ===
                    "none"
                ) {

                    if (durationPanel) {

                        durationPanel.classList.add(
                            "hidden"
                        );

                    }

                } else {

                    if (durationPanel) {

                        durationPanel.classList.remove(
                            "hidden"
                        );

                    }
                }


                /*
                   Update summary immediately.
                */

                updateRepeatSummary();

            }
        );

    });


    /* ======================================================
       WEEKDAY BUTTONS
    ====================================================== */

    weekdayButtons.forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();


                const day =
                    Number(
                        this.dataset.day
                    );


                if (
                    repeatWeekdays.includes(day)
                ) {

                    repeatWeekdays =
                        repeatWeekdays.filter(
                            item =>
                                item !== day
                        );

                    this.classList.remove(
                        "selected"
                    );

                } else {

                    repeatWeekdays.push(day);

                    this.classList.add(
                        "selected"
                    );

                }


                /*
                   Update summary after
                   selecting a weekday.
                */

                updateRepeatSummary();

            }
        );

    });


    /* ======================================================
       DAILY INTERVAL
    ====================================================== */

    const dailyInput =
        document.getElementById(
            "repeat-daily-interval"
        );

    if (dailyInput) {

        dailyInput.addEventListener(
            "change",
            () => {

                repeatDailyInterval =
                    Math.max(
                        1,
                        Number(
                            dailyInput.value
                        ) || 1
                    );

                dailyInput.value =
                    repeatDailyInterval;


                updateRepeatSummary();

            }
        );

    }


    /* ======================================================
       WEEKLY INTERVAL
    ====================================================== */

    const weeklyInput =
        document.getElementById(
            "repeat-weekly-interval"
        );

    if (weeklyInput) {

        weeklyInput.addEventListener(
            "change",
            () => {

                repeatWeeklyInterval =
                    Math.max(
                        1,
                        Number(
                            weeklyInput.value
                        ) || 1
                    );

                weeklyInput.value =
                    repeatWeeklyInterval;


                updateRepeatSummary();

            }
        );

    }


    /* ======================================================
       MONTHLY INTERVAL
    ====================================================== */

    const monthlyInput =
        document.getElementById(
            "repeat-monthly-interval"
        );

    if (monthlyInput) {

        monthlyInput.addEventListener(
            "change",
            () => {

                repeatMonthlyInterval =
                    Math.max(
                        1,
                        Number(
                            monthlyInput.value
                        ) || 1
                    );

                monthlyInput.value =
                    repeatMonthlyInterval;


                updateRepeatSummary();

            }
        );

    }


    /* ======================================================
       YEARLY INTERVAL
    ====================================================== */

    const yearlyInput =
        document.getElementById(
            "repeat-yearly-interval"
        );

    if (yearlyInput) {

        yearlyInput.addEventListener(
            "change",
            () => {

                repeatYearlyInterval =
                    Math.max(
                        1,
                        Number(
                            yearlyInput.value
                        ) || 1
                    );

                yearlyInput.value =
                    repeatYearlyInterval;


                updateRepeatSummary();

            }
        );

    }


    /* ======================================================
       DURATION OPTIONS
    ====================================================== */

    durationOptions.forEach(option => {

        option.addEventListener(
            "click",
            function(event) {

                /*
                   Don't trigger the duration
                   option when clicking an input.
                */

                if (
                    event.target.tagName ===
                    "INPUT"
                ) {

                    return;
                }


                const duration =
                    this.dataset.duration ||
                    "forever";


                selectedDuration =
                    duration;


                /*
                   Remove selected state
                   from all duration options.
                */

                durationOptions.forEach(item => {

                    item.classList.remove(
                        "selected"
                    );

                });


                /*
                   Select current duration.
                */

                this.classList.add(
                    "selected"
                );


                /* ==========================================
                   COUNT
                ========================================== */

                if (
                    selectedDuration ===
                    "count"
                ) {

                    if (durationCountInput) {

                        durationCountInput.classList.remove(
                            "hidden"
                        );

                    }

                    if (durationUntilInput) {

                        durationUntilInput.classList.add(
                            "hidden"
                        );

                    }
                }


                /* ==========================================
                   UNTIL
                ========================================== */

                else if (
                    selectedDuration ===
                    "until"
                ) {

                    if (durationCountInput) {

                        durationCountInput.classList.add(
                            "hidden"
                        );

                    }

                    if (durationUntilInput) {

                        durationUntilInput.classList.remove(
                            "hidden"
                        );

                    }
                }


                /* ==========================================
                   FOREVER
                ========================================== */

                else {

                    if (durationCountInput) {

                        durationCountInput.classList.add(
                            "hidden"
                        );

                    }

                    if (durationUntilInput) {

                        durationUntilInput.classList.add(
                            "hidden"
                        );

                    }
                }


                /*
                   Update summary.
                */

                updateRepeatSummary();

            }
        );

    });


    /* ======================================================
       COUNT INPUT
    ====================================================== */

    if (durationCountInput) {

        durationCountInput.addEventListener(
            "input",
            function() {

                const value =
                    Math.max(
                        1,
                        Number(
                            this.value
                        ) || 1
                    );


                this.value =
                    value;


                updateRepeatSummary();

            }
        );

    }


    /* ======================================================
       UNTIL INPUT
    ====================================================== */

    if (durationUntilInput) {

        durationUntilInput.addEventListener(
            "change",
            function() {

                updateRepeatSummary();

            }
        );

    }


    /* ======================================================
       INITIAL STATE
    ====================================================== */

    resetRepeatPanel();

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeRepeatOptions();

    }
);


console.log(
    "REPEAT TEST: initializeRepeatOptions ran"
);


const repeatPanelTest =
    document.getElementById(
        "repeat-panel"
    );


console.log(
    "Repeat panel:",
    repeatPanelTest
);


console.log(
    "Repeat options:",
    repeatPanelTest
        ? repeatPanelTest.querySelectorAll(
            ".repeat-option"
        ).length
        : 0
);



/* ==========================================================
   ANIMATION FOR REPEAT PANEL ENTRANCE
========================================================== */

function openRepeatPanel() {

    const panel =
        document.getElementById(
            "repeat-panel"
        );

    if (!panel) {
        return;
    }

    /*
       Cancel any previous closing animation.
    */

    panel.classList.remove(
        "closing"
    );


    /*
       Make panel visible.
    */

    panel.classList.remove(
        "hidden"
    );


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
       Force browser to register
       the initial state.
    */

    void panel.offsetWidth;


    /*
       Start opening animation.
    */

    panel.classList.add(
        "opening"
    );


    /*
       IMPORTANT:
       Do NOT remove "opening".

       It is what keeps the panel
       visible after the animation.
    */

}

/* ==========================================================
   ANIMATION FOR REPEAT PANEL EXIT
========================================================== */

function closeRepeatPanel() {

    const panel =
        document.getElementById(
            "repeat-panel"
        );

    if (!panel) {
        return;
    }


    /*
       Stop opening animation.
    */

    panel.classList.remove(
        "opening"
    );


    /*
       Start smooth closing animation.
    */

    panel.classList.add(
        "closing"
    );

    panel.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
       Wait until the animation finishes
       before hiding the panel.
    */

    setTimeout(
        () => {

            panel.classList.add(
                "hidden"
            );

            panel.classList.remove(
                "closing"
            );

        },
        250
    );
}

function injectDayViewAllDayStyles() {

    if (
        document.getElementById(
            "homeup-day-all-day-styles"
        )
    ) {

        return;

    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "homeup-day-all-day-styles";

    style.textContent = `

        .day-all-day-container {
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }

        .day-all-day-label {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 6px;
            opacity: 0.7;
        }

        .day-all-day-event {
            width: 100%;
            box-sizing: border-box;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }

        .day-all-day-event:hover {
            opacity: 0.85;
        }

    `;

    document.head.appendChild(
        style
    );

}

/* ==========================================================
   END OF HOMEUP CALENDAR.JS
========================================================== */