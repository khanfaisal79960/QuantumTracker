document.addEventListener('DOMContentLoaded', () => {
    if (chartLabels && chartData && chartLabels.length > 0 && chartData.length > 0) {
        const ctx = document.getElementById('priceChart').getContext('2d');

        const formattedLabels = chartLabels.map(timestamp => {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [{
                    label: 'Price (USD)',
                    data: chartData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#8e44ad',
                    pointBorderColor: '#8e44ad'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Set to false when using a responsive container
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(74, 74, 110, 0.3)',
                            borderColor: 'var(--border-color)'
                        },
                        ticks: {
                            color: 'var(--text-dark)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(74, 74, 110, 0.3)',
                            borderColor: 'var(--border-color)'
                        },
                        ticks: {
                            color: 'var(--text-dark)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text-light)'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(42, 42, 74, 0.9)',
                        titleColor: 'var(--accent-blue)',
                        bodyColor: 'var(--text-light)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += '$' + context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    } else {
        const graphSection = document.querySelector('.coin-graph-section');
        if (graphSection) {
            graphSection.innerHTML = '<p style="text-align: center; color: var(--text-dark);">Historical price data not available for this coin.</p>';
        }
    }

    function formatNumberForDetails(num) {
        if (num === null || num === undefined) return 'N/A';
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    }

    const currentPriceSpan = document.getElementById('currentPrice');
    const marketCapSpan = document.getElementById('marketCap');

    if (currentPriceSpan) {
        currentPriceSpan.textContent = formatNumberForDetails(parseFloat(currentPriceSpan.textContent.replace(/,/g, '')));
    }
    if (marketCapSpan) {
        marketCapSpan.textContent = formatNumberForDetails(parseFloat(marketCapSpan.textContent.replace(/,/g, '')));
    }
});
