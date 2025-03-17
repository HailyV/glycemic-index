document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Loading Navbar...");

    const isGitHubPages = window.location.hostname.includes("github.io");
    const repoName = "glycemic-index"; // Adjust if your repo name is different

    const basePath = isGitHubPages
        ? (window.location.pathname.startsWith(`/${repoName}/`) ? `/${repoName}/` : "/")
        : "./";

    console.log("Current Path:", window.location.pathname);
    console.log("Base Path:", basePath);

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

});
