document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 Loading Navbar...");

    const isGitHubPages = window.location.hostname.includes("github.io");
    const repoName = "glycemic-index"; // Your repository name

    let basePath = "./"; // Default for local development

    if (isGitHubPages) {
        // Remove duplicate occurrences of `glycemic-index/` if present
        let path = window.location.pathname;
        if (path.startsWith(`/${repoName}/${repoName}/`)) {
            basePath = `/${repoName}/`; // Fix duplicated repo name issue
        } else if (path.startsWith(`/${repoName}/`)) {
            basePath = `/${repoName}/`; // Normal case
        } else {
            basePath = "/"; // Edge case where the path is unexpected
        }
    }

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

    console.log("✅ Navbar Loaded Successfully!");
});
