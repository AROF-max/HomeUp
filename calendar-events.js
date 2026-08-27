"use strict";

/* ==========================================================
   HOMEUP SHARED CALENDAR EVENTS
   Used by AI Chatbot + Calendar
========================================================== */


/* ==========================================================
   STORAGE
========================================================== */

const HOMEUP_EVENTS_KEY =
    "homeup-events";


/* ==========================================================
   HOMEUP CATEGORY COLORS
========================================================== */

const HOMEUP_CATEGORY_COLORS = {

    family:
        "#22c55e",

    work:
        "#3b82f6",

    health:
        "#ef4444",

    school:
        "#8b5cf6",

    sports:
        "#f97316",

    travel:
        "#06b6d4",

    finance:
        "#f59e0b",

    other:
        "#64748b"

};


/* ==========================================================
   CREATE EVENT ID
========================================================== */

function createSharedEventId() {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* ==========================================================
   READ EVENTS
========================================================== */

function getHomeUpEvents() {

    try {

        const storedEvents =
            JSON.parse(
                localStorage.getItem(
                    HOMEUP_EVENTS_KEY
                ) || "[]"
            );


        if (
            Array.isArray(
                storedEvents
            )
        ) {

            return storedEvents;

        }

    }
    catch (
        error
    ) {

        console.error(
            "HomeUp: Could not read calendar events.",
            error
        );

    }


    return [];

}


/* ==========================================================
   SAVE EVENTS
========================================================== */

function saveHomeUpEvents(
    events
) {

    try {

        localStorage.setItem(
            HOMEUP_EVENTS_KEY,
            JSON.stringify(
                events
            )
        );


        return true;

    }
    catch (
        error
    ) {

        console.error(
            "HomeUp: Could not save calendar events.",
            error
        );


        return false;

    }

}


/* ==========================================================
   NORMALIZE AI DATE
========================================================== */

function normalizeAIEventDate(
    date
) {

    date =
        String(
            date || ""
        ).trim();


    /*
       TODAY
    */

    if (
        date.toLowerCase() ===
        "today"
    ) {

        const today =
            new Date();


        return (
            today.getFullYear() +
            "-" +
            String(
                today.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                today.getDate()
            ).padStart(2, "0")
        );

    }


    /*
       TOMORROW
    */

    if (
        date.toLowerCase() ===
        "tomorrow"
    ) {

        const tomorrow =
            new Date();


        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        return (
            tomorrow.getFullYear() +
            "-" +
            String(
                tomorrow.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                tomorrow.getDate()
            ).padStart(2, "0")
        );

    }


    return date;

}


/* ==========================================================
   DETERMINE EVENT CATEGORY
========================================================== */

function determineEventCategory(
    data
) {

    const requestedCategory =
        String(
            data &&
            data.category ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
       ======================================================
       USE AI-PROVIDED CATEGORY FIRST
       
       IMPORTANT:
       "other" is NOT treated as final because
       the title/description may reveal a better
       category.
       ======================================================
    */

    if (
        requestedCategory &&
        requestedCategory !== "other" &&
        Object.prototype.hasOwnProperty.call(
            HOMEUP_CATEGORY_COLORS,
            requestedCategory
        )
    ) {

        return requestedCategory;

    }


    /*
       ======================================================
       BUILD SEARCH TEXT
       ======================================================
    */

    const title =
        String(
            data &&
            data.title ||
            ""
        )
        .trim()
        .toLowerCase();


    const description =
        String(
            data &&
            data.description ||
            ""
        )
        .trim()
        .toLowerCase();


    const categoryText =
        (
            title +
            " " +
            description
        )
        .trim();


    /*
       ======================================================
       SCHOOL
       ======================================================
    */

    if (
        /school|homework|class|teacher|exam|lesson|university|college|student|study|studying|lecture|assignment|school meeting|school event|schoolwork|project/.test(
            categoryText
        )
    ) {

        return "school";

    }
  
  /* ======================================================
   SPORTS
   ====================================================== */

if (
    /sport|sports|football|soccer|basketball|tennis|cricket|golf|volleyball|baseball|rugby|hockey|swimming|swim|running|run|gym|workout|training|practice|match|game|tournament|fitness|athletics|athletic/.test(
        categoryText
    )
) {

    return "sports";

}

    /*
       ======================================================
       HEALTH
       ======================================================
    */

    if (
        /dentist|dentistry|doctor|doctor's|hospital|clinic|medical|medicine|health|healthcare|checkup|check-up|appointment|therapy|therapist|prescription|pharmacy|physio|physiotherapy|blood test|vaccination|vaccine/.test(
            categoryText
        )
    ) {

        return "health";

    }


    /*
       ======================================================
       TRAVEL
       ======================================================
    */

    if (
        /flight|airport|travel|trip|hotel|vacation|holiday|passport|visa|boarding|airline|departure|arrival/.test(
            categoryText
        )
    ) {

        return "travel";

    }


    /*
       ======================================================
       FINANCE
       ======================================================
    */

    if (
        /salary|bank|payment|bill|invoice|money|finance|rent|tax|taxes|banking|transfer|credit card|mortgage|insurance payment/.test(
            categoryText
        )
    ) {

        return "finance";

    }


    /*
       ======================================================
       WORK
       ======================================================
    */

    if (
        /meeting|office|work|business|client|deadline|presentation|conference|coworker|colleague|workshop|interview|job/.test(
            categoryText
        )
    ) {

        return "work";

    }


    /*
       ======================================================
       FAMILY
       ======================================================
    */

    if (
        /family|parents|parent|children|child|kids|kid|mom|mum|mother|dad|father|brother|sister|son|daughter|grandparent|grandma|grandmother|grandpa|grandfather/.test(
            categoryText
        )
    ) {

        return "family";

    }


    /*
       ======================================================
       DEFAULT
       ======================================================
    */

    return "other";

}

/* ==========================================================
   CREATE EVENT FROM AI
========================================================== */

function createEventFromAI(
    data
) {

    if (!data) {

        return false;

    }


    const title =
        String(
            data.title || ""
        ).trim();


    let date =
        String(
            data.date || ""
        ).trim();


    const start =
        String(
            data.start ||
            data.time ||
            ""
        ).trim();


    const end =
        String(
            data.end || ""
        ).trim();


    const description =
        String(
            data.description || ""
        ).trim();


    date =
        normalizeAIEventDate(
            date
        );


    /* ======================================================
       RECURRENCE
    ====================================================== */

    let recurrence = null;


    if (
        data.recurrence &&
        typeof data.recurrence === "object"
    ) {

        const frequency =
            String(
                data.recurrence.frequency || ""
            )
            .trim()
            .toLowerCase();


        const interval =
            Number(
                data.recurrence.interval || 1
            );


        const daysOfWeek =
            Array.isArray(
                data.recurrence.daysOfWeek
            )
                ? data.recurrence.daysOfWeek
                    .map(
                        day =>
                            String(day)
                                .trim()
                                .toLowerCase()
                    )
                : [];


        const validFrequencies = [
            "daily",
            "weekly",
            "monthly",
            "yearly"
        ];


        if (
            validFrequencies.includes(
                frequency
            )
        ) {

            recurrence = {

                frequency:
                    frequency,

                interval:
                    interval > 0
                        ? interval
                        : 1,

                daysOfWeek:
                    daysOfWeek

            };

        }

    }


    if (
        !title ||
        !date ||
        !start
    ) {

        console.error(
            "HomeUp AI: Missing event information.",
            data
        );

        return false;

    }


    const category =
        determineEventCategory(
            data
        );


    const color =
        data.color ||
        HOMEUP_CATEGORY_COLORS[
            category
        ] ||
        HOMEUP_CATEGORY_COLORS.other;


    const newEvent = {

        id:
            createSharedEventId(),

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
            color,

        recurrence:
            recurrence

    };


    const events =
        getHomeUpEvents();


    /* ======================================================
       CHECK FOR CALENDAR CONFLICTS
    ====================================================== */

    const conflicts =
        findHomeUpEventConflicts(
            newEvent
        );


    if (
        conflicts.length > 0
    ) {

        console.warn(
            "HomeUp AI: Event conflict detected.",
            {
                proposedEvent:
                    newEvent,

                conflicts:
                    conflicts
            }
        );


        window.dispatchEvent(
            new CustomEvent(
                "homeup-event-conflict",
                {
                    detail: {

                        proposedEvent:
                            newEvent,

                        conflicts:
                            conflicts

                    }
                }
            )
        );


        return {

            success:
                false,

            conflict:
                true,

            proposedEvent:
                newEvent,

            conflicts:
                conflicts

        };

    }


    events.push(
        newEvent
    );


    if (
        !saveHomeUpEvents(
            events
        )
    ) {

        return false;

    }


    /*
       Notify calendar.
    */

    window.dispatchEvent(
        new CustomEvent(
            "homeup-event-created",
            {
                detail:
                    newEvent
            }
        )
    );


    console.log(
        "HomeUp AI created calendar event:",
        newEvent
    );


    return true;

}


/* ==========================================================
   FIND EVENT BY ID
========================================================== */

function findHomeUpEventById(
    eventId
) {

    if (!eventId) {

        return null;

    }


    const events =
        getHomeUpEvents();


    return (
        events.find(
            event =>
                String(
                    event.id
                ) ===
                String(
                    eventId
                )
        ) ||
        null
    );

}


/* ==========================================================
   EVENT CONFLICT DETECTION
========================================================== */


/*
   Convert HH:MM into minutes after midnight.

   Examples:

   "09:00" -> 540
   "18:30" -> 1110
*/

function getHomeUpTimeMinutes(
    time
) {

    if (!time) {

        return null;

    }


    const value =
        String(
            time
        )
        .trim();


    const match =
        value.match(
            /^(\d{1,2}):(\d{2})$/
        );


    if (!match) {

        return null;

    }


    const hours =
        Number(
            match[1]
        );


    const minutes =
        Number(
            match[2]
        );


    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {

        return null;

    }


    return (
        hours * 60 +
        minutes
    );

}


/* ==========================================================
   GET EVENT END TIME
========================================================== */


/*
   If an event has no end time,
   assume it lasts one hour.

   This prevents an event without
   an explicit end time from
   bypassing conflict detection.
*/

function getHomeUpEventEndMinutes(
    event
) {

    const startMinutes =
        getHomeUpTimeMinutes(
            event.start
        );


    if (
        startMinutes ===
        null
    ) {

        return null;

    }


    const endMinutes =
        getHomeUpTimeMinutes(
            event.end
        );


    if (
        endMinutes !==
        null &&
        endMinutes >
            startMinutes
    ) {

        return endMinutes;

    }


    return Math.min(
        startMinutes + 60,
        24 * 60
    );

}


/* ==========================================================
   GET WEEKDAY NUMBER
========================================================== */

function getHomeUpWeekdayNumber(
    value
) {

    if (
        typeof value ===
        "number"
    ) {

        if (
            value >= 0 &&
            value <= 6
        ) {

            return value;

        }

    }


    const text =
        String(
            value || ""
        )
        .trim()
        .toLowerCase();


    const weekdays = {

        sunday:
            0,

        sun:
            0,

        monday:
            1,

        mon:
            1,

        tuesday:
            2,

        tue:
            2,

        tues:
            2,

        wednesday:
            3,

        wed:
            3,

        thursday:
            4,

        thu:
            4,

        thurs:
            4,

        friday:
            5,

        fri:
            5,

        saturday:
            6,

        sat:
            6

    };


    if (
        Object.prototype.hasOwnProperty.call(
            weekdays,
            text
        )
    ) {

        return weekdays[
            text
        ];

    }


    return null;

}


/* ==========================================================
   CHECK IF EVENT OCCURS ON A DATE
========================================================== */


/*
   This function understands both:

   normal events

   AND

   recurring events.

   Supported recurrence frequencies:

   - daily
   - weekly
   - monthly
   - yearly
*/

function doesHomeUpEventOccurOnDate(
    event,
    targetDate
) {

    if (
        !event ||
        !event.date ||
        !targetDate
    ) {

        return false;

    }


    const eventDate =
        String(
            event.date
        ).trim();


    const requestedDate =
        String(
            targetDate
        ).trim();


    /*
       Normal event.
    */

    if (
        !event.recurrence
    ) {

        return (
            eventDate ===
            requestedDate
        );

    }


    const recurrence =
        event.recurrence;


    const frequency =
        String(
            recurrence.frequency ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
       Do not allow a recurring
       event to occur before its
       original starting date.
    */

    if (
        requestedDate <
        eventDate
    ) {

        return false;

    }


    /*
       Parse dates using local
       calendar components.

       This avoids timezone
       problems caused by
       new Date("YYYY-MM-DD").
    */

    const eventParts =
        eventDate.split(
            "-"
        );


    const targetParts =
        requestedDate.split(
            "-"
        );


    if (
        eventParts.length !== 3 ||
        targetParts.length !== 3
    ) {

        return false;

    }


    const eventYear =
        Number(
            eventParts[0]
        );


    const eventMonth =
        Number(
            eventParts[1]
        );


    const eventDay =
        Number(
            eventParts[2]
        );


    const targetYear =
        Number(
            targetParts[0]
        );


    const targetMonth =
        Number(
            targetParts[1]
        );


    const targetDay =
        Number(
            targetParts[2]
        );


    const startDate =
        new Date(
            eventYear,
            eventMonth - 1,
            eventDay
        );


    const targetDateObject =
        new Date(
            targetYear,
            targetMonth - 1,
            targetDay
        );


    /*
       DAILY
    */

    if (
        frequency ===
        "daily"
    ) {

        const interval =
            Math.max(
                1,
                Number(
                    recurrence.interval ||
                    1
                )
            );


        const difference =
            Math.floor(
                (
                    targetDateObject -
                    startDate
                ) /
                (
                    24 *
                    60 *
                    60 *
                    1000
                )
            );


        return (
            difference >= 0 &&
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

        /*
           If daysOfWeek is provided,
           use it.

           This is the most reliable
           method for recurring weekly
           events.
        */

        if (
            Array.isArray(
                recurrence.daysOfWeek
            ) &&
            recurrence.daysOfWeek.length
        ) {

            const targetWeekday =
                targetDateObject.getDay();


            const matchingDay =
                recurrence.daysOfWeek.some(
                    day => {

                        return (
                            getHomeUpWeekdayNumber(
                                day
                            ) ===
                            targetWeekday
                        );

                    }
                );


            if (
                !matchingDay
            ) {

                return false;

            }


            const interval =
                Math.max(
                    1,
                    Number(
                        recurrence.interval ||
                        1
                    )
                );


            const difference =
                Math.floor(
                    (
                        targetDateObject -
                        startDate
                    ) /
                    (
                        24 *
                        60 *
                        60 *
                        1000
                    )
                );


            const weeksSinceStart =
                Math.floor(
                    difference /
                    7
                );


            return (
                weeksSinceStart %
                    interval ===
                0
            );

        }


        /*
           If daysOfWeek isn't
           provided, use the weekday
           of the original event date.
        */

        if (
            targetDateObject.getDay() !==
            startDate.getDay()
        ) {

            return false;

        }


        const interval =
            Math.max(
                1,
                Number(
                    recurrence.interval ||
                    1
                )
            );


        const difference =
            Math.floor(
                (
                    targetDateObject -
                    startDate
                ) /
                (
                    24 *
                    60 *
                    60 *
                    1000
                )
            );


        const weeksSinceStart =
            Math.floor(
                difference /
                7
            );


        return (
            weeksSinceStart %
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

        const interval =
            Math.max(
                1,
                Number(
                    recurrence.interval ||
                    1
                )
            );


        /*
           Monthly events occur on
           the same day of the month.
        */

        if (
            targetDateObject.getDate() !==
            startDate.getDate()
        ) {

            return false;

        }


        const monthsDifference =
            (
                targetDateObject.getFullYear() -
                startDate.getFullYear()
            ) *
            12 +
            (
                targetDateObject.getMonth() -
                startDate.getMonth()
            );


        return (
            monthsDifference >= 0 &&
            monthsDifference %
                interval ===
            0
        );

    }


    /*
       YEARLY
    */

    if (
        frequency ===
        "yearly"
    ) {

        const interval =
            Math.max(
                1,
                Number(
                    recurrence.interval ||
                    1
                )
            );


        if (
            targetDateObject.getMonth() !==
            startDate.getMonth()
        ) {

            return false;

        }


        if (
            targetDateObject.getDate() !==
            startDate.getDate()
        ) {

            return false;

        }


        const yearsDifference =
            targetDateObject.getFullYear() -
            startDate.getFullYear();


        return (
            yearsDifference >= 0 &&
            yearsDifference %
                interval ===
            0
        );

    }


    /*
       Unknown recurrence type.

       Fail safely instead of
       falsely reporting a conflict.
    */

    return false;

}


/* ==========================================================
   FIND EVENT CONFLICTS
========================================================== */

function findHomeUpEventConflicts(
    proposedEvent
) {

    if (
        !proposedEvent
    ) {

        return [];

    }


    const proposedDate =
        String(
            proposedEvent.date ||
            ""
        ).trim();


    const proposedStart =
        getHomeUpTimeMinutes(
            proposedEvent.start ||
            proposedEvent.time
        );


    if (
        !proposedDate ||
        proposedStart ===
            null
    ) {

        return [];

    }


    let proposedEnd =
        getHomeUpTimeMinutes(
            proposedEvent.end
        );


    /*
       Default to one hour
       if no end time exists.
    */

    if (
        proposedEnd ===
            null ||
        proposedEnd <=
            proposedStart
    ) {

        proposedEnd =
            Math.min(
                proposedStart +
                    60,
                24 * 60
            );

    }


    const events =
        getHomeUpEvents();


    const proposedId =
        String(
            proposedEvent.id ||
            ""
        ).trim();


    const conflicts =
        [];


    events.forEach(
        existingEvent => {

            /*
               Don't compare an event
               with itself.

               Important when editing.
            */

            if (
                proposedId &&
                String(
                    existingEvent.id
                ) ===
                proposedId
            ) {

                return;

            }


            /*
               An event only matters if
               it actually occurs on the
               proposed date.

               This includes recurring
               events.
            */

            if (
                !doesHomeUpEventOccurOnDate(
                    existingEvent,
                    proposedDate
                )
            ) {

                return;

            }


            const existingStart =
                getHomeUpTimeMinutes(
                    existingEvent.start
                );


            if (
                existingStart ===
                    null
            ) {

                return;

            }


            const existingEnd =
                getHomeUpEventEndMinutes(
                    existingEvent
                );


            if (
                existingEnd ===
                    null
            ) {

                return;

            }


            const overlaps =
                proposedStart <
                    existingEnd &&
                proposedEnd >
                    existingStart;


            if (
                overlaps
            ) {

                conflicts.push(
                    existingEvent
                );

            }

        }
    );


    return conflicts;

}


/* ==========================================================
   MAKE CONFLICT CHECKER AVAILABLE
========================================================== */

window.getHomeUpTimeMinutes =
    getHomeUpTimeMinutes;


window.doesHomeUpEventOccurOnDate =
    doesHomeUpEventOccurOnDate;


window.findHomeUpEventConflicts =
    findHomeUpEventConflicts;


/* ==========================================================
   EDIT EVENT FROM AI
========================================================== */

function editEventFromAI(
    data
) {

    if (!data) {

        console.error(
            "HomeUp AI: No edit data received."
        );

        return false;

    }


    const eventId =
        String(
            data.id ||
            data.eventId ||
            ""
        ).trim();


    if (!eventId) {

        console.error(
            "HomeUp AI: Edit request is missing event ID.",
            data
        );

        return false;

    }


    const events =
        getHomeUpEvents();


    const eventIndex =
        events.findIndex(
            event =>
                String(
                    event.id
                ) ===
                eventId
        );


    if (
        eventIndex ===
        -1
    ) {

        console.error(
            "HomeUp AI: Event to edit was not found.",
            eventId
        );

        return false;

    }


    const event =
        events[eventIndex];


    /*
       Only update fields that were
       actually supplied.
    */

    if (
        data.title !==
        undefined
    ) {

        const newTitle =
            String(
                data.title
            ).trim();


        if (newTitle) {

            event.title =
                newTitle;

        }

    }


    if (
        data.date !==
        undefined
    ) {

        const newDate =
            normalizeAIEventDate(
                data.date
            );


        if (newDate) {

            event.date =
                newDate;

        }

    }


    if (
        data.start !==
        undefined ||
        data.time !==
        undefined
    ) {

        const newStart =
            String(
                data.start ||
                data.time ||
                ""
            ).trim();


        if (newStart) {

            event.start =
                newStart;

        }

    }


    if (
        data.end !==
        undefined
    ) {

        event.end =
            String(
                data.end ||
                ""
            ).trim();

    }


    if (
        data.description !==
        undefined
    ) {

        event.description =
            String(
                data.description ||
                ""
            ).trim();

    }


    /*
       Recalculate category if the
       title/description changed.
    */

    if (
        data.category !==
        undefined ||
        data.title !==
        undefined ||
        data.description !==
        undefined
    ) {

        const category =
            determineEventCategory(
                {

                    title:
                        event.title,

                    description:
                        event.description,

                    category:
                        data.category

                }
            );


        event.category =
            category;


        event.color =
            data.color ||
            HOMEUP_CATEGORY_COLORS[
                category
            ] ||
            HOMEUP_CATEGORY_COLORS.other;

    }


    if (
        data.color !==
        undefined
    ) {

        event.color =
            data.color ||
            event.color;

    }


    /*
       Update recurrence if supplied.
    */

    if (
        data.recurrence !==
        undefined
    ) {

        if (
            data.recurrence &&
            typeof data.recurrence === "object"
        ) {

            const frequency =
                String(
                    data.recurrence.frequency || ""
                )
                .trim()
                .toLowerCase();


            const interval =
                Number(
                    data.recurrence.interval || 1
                );


            const daysOfWeek =
                Array.isArray(
                    data.recurrence.daysOfWeek
                )
                    ? data.recurrence.daysOfWeek
                        .map(
                            day =>
                                String(day)
                                    .trim()
                                    .toLowerCase()
                        )
                    : [];


            const validFrequencies = [
                "daily",
                "weekly",
                "monthly",
                "yearly"
            ];


            if (
                validFrequencies.includes(
                    frequency
                )
            ) {

                event.recurrence = {

                    frequency:
                        frequency,

                    interval:
                        interval > 0
                            ? interval
                            : 1,

                    daysOfWeek:
                        daysOfWeek

                };

            }

        }

        else {

            /*
               null means make the event
               non-recurring.
            */

            event.recurrence =
                null;

        }

    }


    /*
       Save.
    */

    if (
        !saveHomeUpEvents(
            events
        )
    ) {

        return false;

    }


    /*
       Tell the calendar that
       an event changed.
    */

    window.dispatchEvent(
        new CustomEvent(
            "homeup-event-updated",
            {
                detail:
                    event
            }
        )
    );


    console.log(
        "HomeUp AI updated calendar event:",
        event
    );


    return true;

}


/* ==========================================================
   DELETE EVENT FROM AI
========================================================== */

function deleteEventFromAI(
    data
) {

    if (!data) {

        console.error(
            "HomeUp AI: No delete data received."
        );

        return false;

    }


    const eventId =
        String(
            data.id ||
            data.eventId ||
            ""
        ).trim();


    if (!eventId) {

        console.error(
            "HomeUp AI: Delete request is missing event ID.",
            data
        );

        return false;

    }


    const events =
        getHomeUpEvents();


    const eventIndex =
        events.findIndex(
            event =>
                String(
                    event.id
                ) ===
                eventId
        );


    if (
        eventIndex ===
        -1
    ) {

        console.error(
            "HomeUp AI: Event to delete was not found.",
            eventId
        );

        return false;

    }


    const deletedEvent =
        events[eventIndex];


    /*
       Remove event.
    */

    events.splice(
        eventIndex,
        1
    );


    /*
       Save updated list.
    */

    if (
        !saveHomeUpEvents(
            events
        )
    ) {

        return false;

    }


    /*
       Tell the calendar that
       an event was deleted.
    */

    window.dispatchEvent(
        new CustomEvent(
            "homeup-event-deleted",
            {
                detail:
                    deletedEvent
            }
        )
    );


    console.log(
        "HomeUp AI deleted calendar event:",
        deletedEvent
    );


    return true;

}


/* ==========================================================
   MAKE FUNCTIONS AVAILABLE TO CHATBOT
========================================================== */

window.createEventFromAI =
    createEventFromAI;


window.editEventFromAI =
    editEventFromAI;


window.deleteEventFromAI =
    deleteEventFromAI;


window.getHomeUpEvents =
    getHomeUpEvents;


window.findHomeUpEventById =
    findHomeUpEventById;