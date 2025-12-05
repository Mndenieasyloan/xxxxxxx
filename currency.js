<script>
(function () {
  const STORAGE_KEY = "preferred_currency";

  function applyCurrency(currency) {
    const symbol = window.CurrencyConfig[currency];
    if (!symbol) return;

    document.querySelectorAll(".price").forEach(el => {
      const text = el.textContent.trim();
      const number = text.replace(/[^\d.,]/g, "");
      el.textContent = symbol + " " + number;
    });
  }

  function showCurrencyPopup() {
    if (document.getElementById("currency-popup")) return;

    const popup = document.createElement("div");
    popup.id = "currency-popup";
    popup.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    popup.innerHTML = `
      <div style="background:#fff;padding:20px;border-radius:8px;max-width:300px;width:100%">
        <h3>Select Currency</h3>
        <select id="currency-select" style="width:100%;padding:8px">
          <option value="ZAR">ZAR (R)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
        <button id="currency-save" style="margin-top:10px;width:100%">Confirm</button>
      </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("currency-save").onclick = () => {
      const currency = document.getElementById("currency-select").value;
      localStorage.setItem(STORAGE_KEY, currency);
      applyCurrency(currency);
      popup.remove();
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const savedCurrency = localStorage.getItem(STORAGE_KEY);

    if (!savedCurrency) {
      showCurrencyPopup();
    } else {
      applyCurrency(savedCurrency);
    }
  });
})();
</script>
