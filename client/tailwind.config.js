/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        whatsappGreen: "#075E54",
        whatsappLightGreen: "#128C7E",
        whatsappBubbleGreen: "#DCF8C6",
        whatsappBubbleGray: "#E0E0E0",
        whatsappBackground: "#ECE5DD",
        whatsappText: "#4A4A4A",
        whatsappStatusSent: "#88929C",
        whatsappStatusDelivered: "#4FC3F7",
        whatsappStatusRead: "#00E676",
      },
    },
  },
  plugins: [],
};
