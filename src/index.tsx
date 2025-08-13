// 1. 📱 User opens your website, 2. 🌐 Browser loads index.tsx, 3. 🎯 Code finds the "root" element in HTML
// 4. 🚀 React creates the app and renders App.tsx, 5. 🏠 App.tsx loads and shows your first page

// It’s the starting point of the React Proj.
// This is where your whole app gets connected to the real web page (the HTML file) and where everything starts running.




//----------------------- THEORY - CONCEPT -------------------------------------------------------------



// HTML is the skeleton of the web page. index.html comes automaically by developers, somewhere for the REACT app to go in.

/* DOM is the browser’s in-memory representation of the HTML structure as a TREE of nodes.
It’s how the browser understands and manipulates the page — page structure but in an accessible form for JavaScript.
............WHICH IS WHY.......
REACT manipulates the DOM instead of manipulating the HTML code. */
/* React has its own virtual copy of the DOM, makes changes on it, compares with the real DOM, and updates it accordingly — “Virtual DOM diffing” process.
           [To be more accurate, it manipulates/has a virtual copy of ONE part of the DOM, a container, more on that next] */

// React “lives” inside one part of the real DOM. So React only controls and updates that part of the DOM, not the whole page.
// (<div id="root">) -> target container element 

// Index is what defines which part of the DOM this React app will "live" in.
// index.tsx file finds that part (container element) in the HTML and tells React, “Render the entire app here.”




// ---------------------------------------- SUMMARY -------------------------------------------------------------



// The HTML file is loaded once by the browser and usually has very little content (just the empty root div and links to scripts and styles).
// React builds and manages the UI inside that root div, by manipulating the DOM nodes inside it.
// Other parts of the webpage (outside React’s root div) remain untouched by React.

// React controls a specific container inside your HTML page (usually the <div id="root">), uses its virtual DOM to update the real DOM there, and index.tsx tells React exactly where that container is.


/*Entire Browser DOM (real page)
└── <html>
└── <body>
    ├── <header> ... </header>           <-- React does NOT control this
    ├── <div id="root">                  <-- React CONTROLS this entire subtree
    │    ├── <App>
    │    │    ├── <HeaderComponent />
    │    │    ├── <ContentComponent />
    │    │    └── <FooterComponent />
    │    └── ... other React elements
    └── <footer> ... </footer>           <-- React does NOT control this
*/


// Import React and StrictMode (helps catch potential problems during development)
import React, { StrictMode } from "react";

// “Hey React, put your app here in the <div id="root">.” Connects react to DOM.
import { createRoot } from "react-dom/client";

// Import global CSS styles for the app
import "./styles.css";

// Import the REACT app file to insert into the DOM
import App from "./App";

// Find the HTML element with id "root" where React will render the app
const rootElement = document.getElementById("root");

// If the root element is not found, throw an error to stop the app from running
if (!rootElement) throw new Error("Failed to find the root element");

// Create a React root linked to the rootElement in the DOM
const root = createRoot(rootElement);

// Render the React app inside the rootElement, wrapped in StrictMode for extra checks
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
