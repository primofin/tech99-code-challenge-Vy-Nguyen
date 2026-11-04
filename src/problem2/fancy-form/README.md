# Fancy Form

Currency swap form built with Vite, React and TypeScript.

## Run

```
npm install
npm run dev
```

Build for production with `npm run build`.

## How it works

- Prices come from `https://interview.switcheo.com/prices.json`. The API has several entries per currency, so the newest one is used.
- Token icons come from the Switcheo token-icons repo. If an icon is missing it is hidden.
- The receive amount is calculated from the price ratio of the two tokens and updates as you type.
- The confirm button is disabled until the amount is greater than 0 and two different tokens are selected.
- Confirming shows a loading state for 1.5 seconds and then a success message, since there is no backend.

## Structure

```
src/
  api/prices.ts            fetch and clean up the prices
  hooks/usePrices.ts       loading and error state for the prices
  components/SwapForm.tsx  the form
  components/TokenSelect.tsx  token dropdown with icon
  utils/format.ts          number formatting and input cleanup
```
