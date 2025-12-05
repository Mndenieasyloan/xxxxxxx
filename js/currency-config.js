// Currency Configuration File
const CurrencyConfig = {
    // Available currencies with their symbols
    currencies: {
        'USD': { symbol: '$', name: 'US Dollar' },
        'EUR': { symbol: '€', name: 'Euro' },
        'GBP': { symbol: '£', name: 'British Pound' },
        'ZAR': { symbol: 'R', name: 'South African Rand' },
        'INR': { symbol: '₹', name: 'Indian Rupee' },
        'JPY': { symbol: '¥', name: 'Japanese Yen' },
        'AUD': { symbol: 'A$', name: 'Australian Dollar' },
        'CAD': { symbol: 'C$', name: 'Canadian Dollar' }
    },

    // Default currency (fallback)
    defaultCurrency: 'USD',

    // Storage key for user preference
    storageKey: 'v0trade_user_currency',

    // Initialize currency system
    init: function() {
        this.loadUserPreference();
        
        // Check if this is first visit (no currency set)
        if (!this.getStoredCurrency()) {
            // Wait for page to load, then show popup
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => {
                        this.showCurrencyPopup();
                    }, 1000); // Show after 1 second delay
                });
            } else {
                setTimeout(() => {
                    this.showCurrencyPopup();
                }, 1000);
            }
        } else {
            this.applyCurrencyToPage();
        }
        
        // Initialize currency switcher if exists
        this.initCurrencySwitcher();
    },

    // Get user's stored currency preference
    getStoredCurrency: function() {
        return localStorage.getItem(this.storageKey);
    },

    // Save user's currency preference
    saveCurrency: function(currencyCode) {
        if (this.currencies[currencyCode]) {
            localStorage.setItem(this.storageKey, currencyCode);
            this.applyCurrencyToPage();
            this.updateCurrencySwitcher();
            return true;
        }
        return false;
    },

    // Load and apply user preference
    loadUserPreference: function() {
        const storedCurrency = this.getStoredCurrency();
        if (!storedCurrency || !this.currencies[storedCurrency]) {
            localStorage.setItem(this.storageKey, this.defaultCurrency);
        }
    },

    // Get current currency symbol
    getCurrentSymbol: function() {
        const currencyCode = this.getStoredCurrency() || this.defaultCurrency;
        return this.currencies[currencyCode]?.symbol || '$';
    },

    // Get current currency code
    getCurrentCurrency: function() {
        return this.getStoredCurrency() || this.defaultCurrency;
    },

    // Apply currency to the entire page
    applyCurrencyToPage: function() {
        const symbol = this.getCurrentSymbol();
        const currencyCode = this.getCurrentCurrency();
        
        // Find all elements with currency symbols
        document.querySelectorAll('[data-currency-symbol]').forEach(element => {
            const currentText = element.textContent || element.innerHTML;
            
            // Replace any existing currency symbol with the new one
            // This regex matches common currency symbols at the beginning
            const newText = currentText.replace(/^[^\d\s]*/, symbol);
            
            if (element.tagName === 'INPUT') {
                element.value = newText;
            } else {
                element.textContent = newText;
            }
        });
        
        // Update elements that display currency code
        document.querySelectorAll('[data-currency-code]').forEach(element => {
            element.textContent = currencyCode;
        });
        
        // Dispatch event for any other scripts to listen to
        document.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { symbol, code: currencyCode }
        }));
    },

    // Initialize currency switcher dropdown
    initCurrencySwitcher: function() {
        const switcher = document.querySelector('.currency-switcher');
        if (!switcher) return;

        const selector = switcher.querySelector('.currency-selector');
        const dropdown = switcher.querySelector('.currency-dropdown');

        // Set current currency in selector
        if (selector) {
            selector.querySelector('.current-symbol').textContent = this.getCurrentSymbol();
            selector.querySelector('.current-code').textContent = this.getCurrentCurrency();
        }

        // Populate dropdown
        if (dropdown) {
            dropdown.innerHTML = '';
            Object.entries(this.currencies).forEach(([code, data]) => {
                const option = document.createElement('div');
                option.className = 'currency-option-dropdown';
                if (code === this.getCurrentCurrency()) {
                    option.classList.add('active');
                }
                option.innerHTML = `
                    <span class="symbol">${data.symbol}</span>
                    <span class="code">${code}</span>
                    <span class="name">${data.name}</span>
                `;
                option.addEventListener('click', () => {
                    this.saveCurrency(code);
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(option);
            });
        }

        // Toggle dropdown
        if (selector) {
            selector.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    },

    // Update currency switcher display
    updateCurrencySwitcher: function() {
        const selector = document.querySelector('.currency-selector');
        if (selector) {
            selector.querySelector('.current-symbol').textContent = this.getCurrentSymbol();
            selector.querySelector('.current-code').textContent = this.getCurrentCurrency();
        }
        
        // Update active state in dropdown
        document.querySelectorAll('.currency-option-dropdown').forEach(option => {
            option.classList.remove('active');
            if (option.querySelector('.code').textContent === this.getCurrentCurrency()) {
                option.classList.add('active');
            }
        });
    },

    // Show currency selection popup
    showCurrencyPopup: function() {
        // Check if popup already exists
        if (document.getElementById('currency-popup')) return;
        
        // Don't show if user has already made a choice in this session
        if (sessionStorage.getItem('currency_popup_shown')) return;

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.id = 'currency-popup';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            padding: 40px 30px 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(168, 85, 247, 0.2);
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(168, 85, 247, 0.1);
            position: relative;
        `;

        // Popup HTML
        popupContent.innerHTML = `
            <button onclick="CurrencyConfig.hidePopup()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 20px;">×</button>
            
            <div style="margin-bottom: 25px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                    <span style="font-size: 28px;">💰</span>
                </div>
                <h2 style="margin: 0 0 10px; color: white; font-size: 28px; font-weight: bold;">Choose Your Currency</h2>
                <p style="color: #94a3b8; margin: 0; font-size: 16px;">Select your preferred currency symbol for display</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 25px 0;">
                ${Object.entries(this.currencies).map(([code, data]) => `
                    <button class="currency-option-popup" 
                            data-currency="${code}"
                            style="padding: 16px; border: 2px solid rgba(168, 85, 247, 0.2); border-radius: 12px; 
                                   background: rgba(30, 41, 59, 0.5); color: white; cursor: pointer; 
                                   transition: all 0.3s; text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 5px;">${data.symbol}</div>
                        <div style="font-weight: 600; font-size: 14px;">${code}</div>
                        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${data.name}</div>
                    </button>
                `).join('')}
            </div>
            
            <p style="font-size: 13px; color: #64748b; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(168, 85, 247, 0.1);">
                You can change this anytime from the currency selector.
            </p>
        `;

        // Add event listeners to currency options
        popupContent.querySelectorAll('.currency-option-popup').forEach(button => {
            button.addEventListener('click', (e) => {
                const currency = e.currentTarget.dataset.currency;
                this.saveCurrency(currency);
                sessionStorage.setItem('currency_popup_shown', 'true');
                this.hidePopup();
            });
            
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.borderColor = '#a855f7';
                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });

        // Add to overlay and page
        overlay.appendChild(popupContent);
        document.body.appendChild(overlay);
        
        // Prevent scrolling when popup is open
        document.body.style.overflow = 'hidden';
        
        // Add fadeIn animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },

    // Hide the popup
    hidePopup: function() {
        const popup = document.getElementById('currency-popup');
        if (popup) {
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 300);
        }
        document.body.style.overflow = '';
    },

    // Public method to change currency manually
    changeCurrency: function(currencyCode) {
        return this.saveCurrency(currencyCode);
    },

    // Method to get all available currencies
    getAvailableCurrencies: function() {
        return this.currencies;
    }
};

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    window.CurrencyConfig = CurrencyConfig;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            CurrencyConfig.init();
        });
    } else {
        CurrencyConfig.init();
    }
}
