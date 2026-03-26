# DealFinder

A full-stack web application that allows users to search for a product and compare prices across multiple e-commerce platforms like Amazon and Flipkart. It highlights the cheapest option to help users make informed purchasing decisions.

## 🚀 Features

- **Multi-Platform Search**: Scrapes product data from Amazon and Flipkart simultaneously.
- **Smart Fallback**: If scraping is blocked by the platforms (which is common without residential proxies), the app automatically falls back to generating realistic mock data so the UI remains functional.
- **Price Sorting**: Automatically sorts results from lowest to highest price.
- **Best Deal Highlight**: Visually highlights the cheapest product among the results.
- **Responsive Design**: Modern, clean UI built with Tailwind CSS that works seamlessly on desktop and mobile devices.
- **Loading States & Error Handling**: Provides visual feedback during searches and handles errors gracefully.

## 🧱 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React (Icons), Vite
- **Backend**: Node.js, Express.js
- **Scraping**: Axios, Cheerio
- **Language**: TypeScript

## 📁 Project Structure

```text
price-comparison-bot/
âââ server.ts                 # Express server entry point
âââ server/                   # Backend code
â   âââ routes/               # API routes (e.g., search.ts)
â   âââ controllers/          # Request handlers (e.g., searchController.ts)
â   âââ scrapers/             # Web scraping logic (Amazon, Flipkart)
âââ src/                      # Frontend code
â   âââ components/           # React components (SearchBar, ProductCard, Spinner)
â   âââ App.tsx               # Main application component
â   âââ main.tsx              # React entry point
âââ package.json              # Project dependencies and scripts
```

## 🛠ï¸ Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   This will start both the Express backend and the Vite frontend concurrently.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start the production server**:
   ```bash
   npm start
   ```

## 📝 Notes on Web Scraping

E-commerce websites like Amazon and Flipkart employ strict anti-scraping measures. While this project includes functional scrapers using `axios` and `cheerio` with appropriate headers (like `User-Agent`), these requests may still be blocked (e.g., returning CAPTCHAs or 503 errors) depending on the hosting environment's IP address.

To ensure the application remains usable for demonstration purposes, a fallback mechanism is implemented. If the scraper encounters an error or returns no results, it will automatically generate and return mock product data.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
