# PowerShell script to move frontend files to frontend folder

# Files and folders to move
$itemsToMove = @(
    "src",
    "public",
    "index.html",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tailwind.config.ts",
    "postcss.config.js",
    "eslint.config.js",
    "vitest.config.ts",
    "components.json",
    ".env.example"
)

# Create frontend directory if it doesn't exist
if (-not (Test-Path "frontend")) {
    New-Item -ItemType Directory -Path "frontend" | Out-Null
}

# Move each item
foreach ($item in $itemsToMove) {
    if (Test-Path $item) {
        Write-Host "Moving $item to frontend/..."
        Move-Item -Path $item -Destination "frontend/" -Force
    }
}

Write-Host "Frontend files moved successfully!"

