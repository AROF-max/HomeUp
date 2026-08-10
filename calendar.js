"use strict";

/* ==========================================================
   HOMEUP NAVIGATION
   LARGE NAVBAR + MOBILE DROPDOWN
   ========================================================== */


/* ==========================================================
   INITIALIZE
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeNavigation
);


function initializeNavigation() {

    initializeSidebar();

    initializeDropdown();

}


/* ==========================================================
   LARGE-SCREEN NAVBAR
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
   MOBILE DROPDOWN MENU
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
       If the HTML already has
       onclick="toggleMenu()",
       don't add another click listener.
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


    /*
       Close menu when clicking outside.
    */

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


    /*
       Highlight current page.
    */

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


            /*
               Close dropdown after
               selecting a page.
            */

            link.addEventListener(
                "click",
                () => {

                    closeDropdown();

                }
            );

        });

}


/* ==========================================================
   TOGGLE MOBILE MENU
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
   Make toggleMenu available to HTML
   if the button uses onclick="toggleMenu()".
*/

window.toggleMenu =
    toggleMenu;