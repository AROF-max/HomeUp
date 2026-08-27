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

document.querySelectorAll(".nav-btn").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
    // You can also add other effects here if needed
  }
});
const progress = document.getElementById("progress");

window.addEventListener("scroll", () => {

    const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const scrolled =
        (window.scrollY / height) * 100;


    progress.style.width = scrolled + "%";

});

