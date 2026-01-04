name: Kick Auto Logger

on:
  schedule:
    - cron: '*/30 * * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-logs:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'

      - name: Install Dependencies
        # هنا قمنا بتغيير المكتبة إلى curl_cffi
        run: |
          pip install curl_cffi

      - name: Run Scraper
        run: python update_data.py

      - name: Commit and Push
        run: |
          git config --local user.email "actions@github.com"
          git config --local user.name "GitHub Actions"
          git add streams.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "Auto Update [skip ci]" && git push)
