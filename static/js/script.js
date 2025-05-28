document.addEventListener('DOMContentLoaded', () => {
    const cryptoListContainer = document.getElementById('cryptoList');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const searchInput = document.getElementById('cryptoSearch');
    const searchButton = document.getElementById('searchButton');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    function showErrorMessage(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    window.hideErrorMessage = function() {
        errorMessage.classList.add('hidden');
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return 'N/A';
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    }

    function createCryptoCard(crypto) {
        const card = document.createElement('div');
        card.classList.add('crypto-card');
        card.setAttribute('data-id', crypto.id);

        const priceChangeClass = crypto.price_change_percentage_24h >= 0 ? 'positive-change' : 'negative-change';
        const priceChangeSign = crypto.price_change_percentage_24h >= 0 ? '+' : '';

        card.innerHTML = `
            <div class="crypto-card-content">
                <img src="${crypto.image}" alt="${crypto.name} logo" class="crypto-image" onerror="this.onerror=null;this.src='https://placehold.co/60x60/3498db/ffffff?text=${crypto.symbol.toUpperCase().substring(0,2)}';">
                <h2 class="crypto-name">${crypto.name}</h2>
                <p class="crypto-symbol">${crypto.symbol}</p>
                <p class="crypto-price">$${formatNumber(crypto.current_price)}</p>
                <p class="crypto-change ${priceChangeClass}">
                    ${priceChangeSign}${formatNumber(crypto.price_change_percentage_24h)}% (24h)
                </p>
                <p class="crypto-market-cap">Mkt Cap: $${formatNumber(crypto.market_cap)}</p>
                <p class="crypto-rank">Rank: #${crypto.market_cap_rank}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `/coin/${crypto.id}`;
        });

        return card;
    }

    async function fetchAndDisplayCryptos() {
        loadingSpinner.classList.remove('hidden');
        cryptoListContainer.innerHTML = '';
        hideErrorMessage();

        try {
            const response = await fetch('/api/cryptos?per_page=100');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const cryptos = await response.json();

            if (cryptos.length === 0) {
                showErrorMessage("No cryptocurrencies found.");
                return;
            }

            cryptos.forEach(crypto => {
                const card = createCryptoCard(crypto);
                cryptoListContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching cryptocurrencies:', error);
            showErrorMessage(`Failed to load cryptocurrencies: ${error.message}`);
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }

    async function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) {
            fetchAndDisplayCryptos();
            return;
        }

        loadingSpinner.classList.remove('hidden');
        cryptoListContainer.innerHTML = '';
        hideErrorMessage();

        try {
            const response = await fetch(`/api/search_crypto?id=${searchTerm}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const crypto = await response.json();

            if (crypto) {
                const card = createCryptoCard(crypto);
                cryptoListContainer.appendChild(card);
            } else {
                showErrorMessage("Cryptocurrency not found. Try a different name or symbol.");
            }

        } catch (error) {
            console.error('Error during search:', error);
            showErrorMessage(`Search failed: ${error.message}`);
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    fetchAndDisplayCryptos();
});
