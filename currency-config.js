// currency-config.js
const CurrencyConfig = {
    // Available currencies with their symbols, names, and conversion rates (relative to USD as base)
    currencies: {
        USD: {
            symbol: "$",
            name: "US Dollar",
            rate: 1.0,
            position: "before" // "before" or "after" the amount
        },
        EUR: {
            symbol: "€",
            name: "Euro",
            rate: 0.85,
            position: "before"
        },
        GBP: {
            symbol: "£",
            name: "British Pound",
            rate: 0.73,
            position: "before"
        },
        ZAR: {
            symbol: "R",
            name: "South African Rand",
            rate: 14.5,
            position: "before"
        },
        JPY: {
            symbol: "¥",
            name: "Japanese Yen",
            rate: 110.0,
            position: "before"
        }
    },

    // Default currency if none is selected
    defaultCurrency: "USD",

    // Storage key for user preference
    storageKey: "userCurrencyPreference",

    // Function to get user's selected currency
    getUserCurrency: function() {
        // Check if user is logged in (you would have your own auth system)
        const isLoggedIn = this.checkIfUserIsLoggedIn();
        
        // First check localStorage
        const storedCurrency = localStorage.getItem(this.storageKey);
        
        // If not in localStorage but user is logged in, check sessionStorage or server
        if (!storedCurrency && isLoggedIn) {
            // Here you would typically fetch from your server/database
            // For now, we'll use sessionStorage as example
            const sessionCurrency = sessionStorage.getItem(this.storageKey);
            return sessionCurrency || this.defaultCurrency;
        }
        
        return storedCurrency || this.defaultCurrency;
    },

    // Function to set user's currency preference
    setUserCurrency: function(currencyCode) {
        if (!this.currencies[currencyCode]) {
            console.error("Invalid currency code:", currencyCode);
            return false;
        }

        localStorage.setItem(this.storageKey, currencyCode);
        
        // If user is logged in, also save to server/database
        if (this.checkIfUserIsLoggedIn()) {
            // Save to sessionStorage temporarily
            sessionStorage.setItem(this.storageKey, currencyCode);
            
            // Send to server (you would implement this based on your backend)
            this.saveToServer(currencyCode);
        }
        
        // Dispatch event for other parts of the app to react
        window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { currency: currencyCode }
        }));
        
        return true;
    },

    // Convert amount from base currency (USD) to selected currency
    convertAmount: function(amountInBase) {
        const userCurrency = this.getUserCurrency();
        const currencyData = this.currencies[userCurrency];
        const convertedAmount = amountInBase * currencyData.rate;
        
        return {
            amount: convertedAmount,
            formatted: this.formatCurrency(convertedAmount, userCurrency),
            symbol: currencyData.symbol,
            code: userCurrency
        };
    },

    // Format currency with proper symbol placement
    formatCurrency: function(amount, currencyCode) {
        const currency = this.currencies[currencyCode] || this.currencies[this.defaultCurrency];
        const formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        if (currency.position === "before") {
            return `${currency.symbol}${formattedAmount}`;
        } else {
            return `${formattedAmount}${currency.symbol}`;
        }
    },

    // Check if user is logged in (you need to customize this based on your auth system)
    checkIfUserIsLoggedIn: function() {
        // Example: check for auth token or user session
        return !!localStorage.getItem('authToken') || 
               !!sessionStorage.getItem('userLoggedIn') ||
               !!document.cookie.includes('user_session');
    },

    // Save to server (you need to implement this based on your backend)
    saveToServer: function(currencyCode) {
        // Example using fetch API
        /*
        fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify({ currency: currencyCode })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Currency preference saved to server:', data);
        })
        .catch(error => {
            console.error('Error saving currency preference:', error);
        });
        */
    },

    // Initialize currency system
    init: function() {
        // Check if we should show popup (first time user)
        this.checkAndShowPopup();
        
        // Process existing price elements on page load
        this.processPageElements();
        
        // Listen for dynamically added content
        this.setupMutationObserver();
    },

    // Check if should show currency selection popup
    checkAndShowPopup: function() {
        const isFirstTime = !localStorage.getItem('currencyPopupShown');
        const isLoggedIn = this.checkIfUserIsLoggedIn();
        const hasCurrency = localStorage.getItem(this.storageKey);
        
        // Show popup if first visit AND no currency set AND user is logged in
        if (isFirstTime && !hasCurrency && isLoggedIn) {
            setTimeout(() => {
                this.showCurrencyPopup();
                localStorage.setItem('currencyPopupShown', 'true');
            }, 1000); // Show after 1 second
        }
    },

    // Currency selection popup
    showCurrencyPopup: function() {
        const popupHTML = `
            <div id="currencyPopup" class="currency-popup-overlay">
                <div class="currency-popup">
                    <h3>Select Your Preferred Currency</h3>
                    <p>Choose the currency you'd like to see prices in:</p>
                    <div class="currency-options">
                        ${Object.entries(this.currencies).map(([code, data]) => `
                            <button class="currency-option" data-currency="${code}">
                                ${data.symbol} ${data.name} (${code})
                            </button>
                        `).join('')}
                    </div>
                    <p class="popup-note">You can change this anytime in settings.</p>
                </div>
            </div>
        `;
        
        const popupContainer = document.createElement('div');
        popupContainer.innerHTML = popupHTML;
        document.body.appendChild(popupContainer.firstElementChild);
        
        // Add event listeners to buttons
        document.querySelectorAll('.currency-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const currencyCode = e.target.dataset.currency;
                this.setUserCurrency(currencyCode);
                this.hideCurrencyPopup();
                location.reload(); // Reload to apply changes to all elements
            });
        });
        
        // Add styles if not already present
        this.addPopupStyles();
    },

    hideCurrencyPopup: function() {
        const popup = document.getElementById('currencyPopup');
        if (popup) {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 300);
        }
    },

    // Add CSS for popup
    addPopupStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            .currency-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.3s;
            }
            
            .currency-popup {
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            }
            
            .currency-popup h3 {
                margin-top: 0;
                color: #333;
            }
            
            .currency-options {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin: 20px 0;
            }
            
            .currency-option {
                padding: 12px;
                border: 2px solid #e0e0e0;
                background: #f9f9f9;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            
            .currency-option:hover {
                border-color: #007bff;
                background: #e7f3ff;
            }
            
            .popup-note {
                font-size: 12px;
                color: #666;
                margin-top: 20px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },

    // Process all price elements on the page
    processPageElements: function() {
        // Find all elements with data-price attribute
        document.querySelectorAll('[data-price]').forEach(element => {
            this.updatePriceElement(element);
        });
        
        // Also look for common price class names
        document.querySelectorAll('.price, .amount, .cost').forEach(element => {
            if (!element.hasAttribute('data-price')) {
                // Try to extract price from text
                const price = this.extractPriceFromText(element.textContent);
                if (price) {
                    element.setAttribute('data-price', price);
                    element.setAttribute('data-original-text', element.textContent);
                    this.updatePriceElement(element);
                }
            }
        });
    },

    // Update a single price element
    updatePriceElement: function(element) {
        const basePrice = parseFloat(element.getAttribute('data-price'));
        if (isNaN(basePrice)) return;
        
        const converted = this.convertAmount(basePrice);
        
        // Preserve any additional text or HTML structure
        const originalHTML = element.getAttribute('data-original-html') || element.innerHTML;
        const updatedHTML = originalHTML.replace(
            /\$\d+(\.\d{2})?/g, // Matches $ prices
            converted.formatted
        ).replace(
            /(\d+(\.\d{2})?)\s*(dollars|USD)/gi, // Matches textual prices
            converted.formatted + ' ' + this.currencies[converted.code].name
        );
        
        element.innerHTML = updatedHTML;
        element.setAttribute('data-currency', converted.code);
    },

    // Extract price from text content
    extractPriceFromText: function(text) {
        const priceMatch = text.match(/\$(\d+(\.\d{2})?)/);
        if (priceMatch) return priceMatch[1];
        
        const numberMatch = text.match(/(\d+(\.\d{2})?)\s*(dollars|USD)/i);
        if (numberMatch) return numberMatch[1];
        
        return null;
    },

    // Setup mutation observer for dynamically added content
    setupMutationObserver: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.hasAttribute('data-price')) {
                            this.updatePriceElement(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('[data-price]').forEach(element => {
                                this.updatePriceElement(element);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

// Initialize on window load
window.addEventListener('DOMContentLoaded', () => {
    CurrencyConfig.init();
});

// Make it globally available
window.CurrencyConfig = CurrencyConfig;
