/* ==========================================================
   MOBILE MENU
========================================================== */

function initializeMobileMenu() {

    const menuTrigger =
        document.getElementById(
            "menu-trigger"
        );

    const dropdownMenu =
        document.getElementById(
            "dropdown-menu"
        );


    if (
        !menuTrigger ||
        !dropdownMenu
    ) {

        console.error(
            "HomeUp: Mobile menu elements not found."
        );

        return;

    }


    /*
       OPEN / CLOSE MENU
    */

    menuTrigger.addEventListener(
        "click",
        function () {

            const isOpen =
                !dropdownMenu.classList.contains(
                    "hidden"
                );


            if (isOpen) {

                dropdownMenu.classList.add(
                    "hidden"
                );

                menuTrigger.setAttribute(
                    "aria-expanded",
                    "false"
                );

            } else {

                dropdownMenu.classList.remove(
                    "hidden"
                );

                menuTrigger.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        }
    );


    /*
       CLOSE MENU WHEN A MENU ITEM
       IS CLICKED
    */

    const menuItems =
        dropdownMenu.querySelectorAll(
            ".dropdown-item"
        );


    menuItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    dropdownMenu.classList.add(
                        "hidden"
                    );

                    menuTrigger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );


    /*
       CLOSE MENU WHEN CLICKING
       OUTSIDE THE MENU
    */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !dropdownMenu.contains(
                    event.target
                ) &&
                !menuTrigger.contains(
                    event.target
                )
            ) {

                dropdownMenu.classList.add(
                    "hidden"
                );

                menuTrigger.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}


/* ==========================================================
   INITIALIZE MOBILE MENU
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMobileMenu();

    }
);