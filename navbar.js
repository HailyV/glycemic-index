document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Loading Navbar...");

    // **Detect the current location depth**
    const depth = window.location.pathname.split("/").length - 1;
    const basePath = depth > 1 ? "../" : "./"; // Auto-adjust paths

    // Define the pages and their correct paths
    const pages = [
        { name: "Home", url: basePath + "index.html" },  
        { name: "Glucose", url: basePath + "glucose-vis/index.html" },
        { name: "Diabetes Map", url: basePath + "placeholder/index.html" }
    ];

    // Get the navbar element
    const navbar = document.getElementById("navbar");

    if (!navbar) {
        console.error("❌ Navbar element not found! Make sure <nav id='navbar'></nav> exists in index.html.");
        return;
    }

    // **Generate navigation links dynamically**
    navbar.innerHTML = ""; // Clear previous content
    pages.forEach(page => {
        let link = document.createElement("a");
        link.href = page.url;
        link.textContent = page.name;
        link.style.marginRight = "15px"; // Add spacing
        navbar.appendChild(link);
    });

    console.log("✅ Navbar Loaded Successfully!");
});
