# CardPilot | Credit Card Strategy Dashboard

A local browser app to optimize which credit card to use for each spending category, estimate points/value, and track annual-fee deadlines.

## Included cards

- American Express Gold
- American Express Platinum
- Bilt Palladium
- Citi Strada Elite
- Capital One Venture X
- Chase Sapphire Preferred
- Chase Ink Business Cash
- Chase Ink Business Unlimited
- Chase Ink Business Preferred
- Chase Ink Business Premier

## Features

- Monthly spend inputs by category
- Best card recommendation per category
- Card performance table with:
  - Monthly points
  - Annual points
  - Estimated annual value (based on your cents-per-point setting)
  - Annual fee
  - Net annual value
- Annual fee tracker with:
  - Card enable/disable toggle
  - Editable annual fee amount
  - Due date input
  - Automatic warning when due in 30 days or less
- Citi Strada Elite dining supports a Fri/Sat 6x boost using a configurable weekend dining percentage in Settings.
- Summary cards for key metrics:
  - Monthly spend
  - Optimized monthly points
  - Optimized annual value
  - Best single-card net annual value

## Data storage

All data is stored in your browser `localStorage`:

- Spend profile
- Annual fee dates and amounts
- Active/inactive card toggles
- Point value setting

## Run locally

Open `/Users/jonasasberg/Desktop/Codex/index.html` in your browser.

No build step is required.

## Notes

Reward multipliers are baseline assumptions and may differ from issuer-specific rules, caps, offers, and portal requirements.
