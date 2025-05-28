from flask import Flask, render_template, jsonify, request, abort
import requests
import json

app = Flask(__name__)

COINGECKO_API_BASE_URL = "https://api.coingecko.com/api/v3"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/cryptos')
def get_cryptos():
    vs_currency = request.args.get('vs_currency', 'usd')
    per_page = request.args.get('per_page', 100)
    page = request.args.get('page', 1)

    url = f"{COINGECKO_API_BASE_URL}/coins/markets"
    params = {
        "vs_currency": vs_currency,
        "order": "market_cap_desc",
        "per_page": per_page,
        "page": page,
        "sparkline": "false"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from CoinGecko API: {e}")
        return jsonify({"error": "Could not fetch cryptocurrency data. Please try again later."}), 500

@app.route('/api/search_crypto')
def search_crypto():
    coin_id = request.args.get('id')
    if not coin_id:
        return jsonify({"error": "Coin ID is required."}), 400

    url = f"{COINGECKO_API_BASE_URL}/coins/markets"
    params = {
        "vs_currency": "usd",
        "ids": coin_id,
        "sparkline": "false"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        if data:
            return jsonify(data[0])
        else:
            return jsonify({"error": "Cryptocurrency not found."}), 404
    except requests.exceptions.RequestException as e:
        print(f"Error searching for crypto: {e}")
        return jsonify({"error": "Could not search for cryptocurrency. Please try again later."}), 500

@app.route('/coin/<string:coin_id>')
def coin_details(coin_id):
    # Fetch detailed coin info
    coin_info_url = f"{COINGECKO_API_BASE_URL}/coins/{coin_id}"
    try:
        coin_info_response = requests.get(coin_info_url)
        coin_info_response.raise_for_status()
        coin_data = coin_info_response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching coin details for {coin_id}: {e}")
        abort(404) # Abort with 404 if coin not found or API error

    # Fetch historical market data for graph (e.g., 7 days)
    market_chart_url = f"{COINGECKO_API_BASE_URL}/coins/{coin_id}/market_chart"
    market_chart_params = {
        "vs_currency": "usd",
        "days": "7", # Last 7 days of data
        "interval": "daily" # Daily interval
    }
    try:
        market_chart_response = requests.get(market_chart_url, params=market_chart_params)
        market_chart_response.raise_for_status()
        market_data = market_chart_response.json()
        prices = market_data.get('prices', [])
        # Format prices for Chart.js: [[timestamp, price], ...] -> {labels: [], data: []}
        chart_labels = [price[0] for price in prices] # Timestamps
        chart_data = [price[1] for price in prices] # Prices
    except requests.exceptions.RequestException as e:
        print(f"Error fetching market chart for {coin_id}: {e}")
        chart_labels = []
        chart_data = []

    return render_template('coin_details.html', coin=coin_data, chart_labels=json.dumps(chart_labels), chart_data=json.dumps(chart_data))

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
