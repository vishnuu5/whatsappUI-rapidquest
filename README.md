# WhatsApp Web Clone

This project is a full-stack application that mimics the WhatsApp Web interface, displaying real-time conversations based on webhook data and allowing users to send demo messages.

## Features

- **Webhook Payload Processor**: Processes WhatsApp Business API webhook payloads (messages and status updates) and stores them in MongoDB.
- **WhatsApp Web-Like Interface**:
  - Displays a list of conversations grouped by user (`wa_id`).
  - Shows all message bubbles with date/time and status indicators (sent, delivered, read) when a chat is selected.
  - Basic user info (name and number) displayed.
  - Clean, responsive, and mobile-friendly design using Tailwind CSS.
- **Send Message (Demo)**:
  - An input box to send new messages.
  - Messages appear in the conversation UI and are saved to the database.
  - **No actual messages are sent outside the platform.**
- **Real-Time Interface**: Uses Socket.IO to simulate real-time message updates and status changes without requiring a manual refresh.

### Git Clone

```bash
https://github.com/vishnuu5/whatsappUI-rapidquest.git
```

## Tech Stack

- **Frontend**: Vite, React.js, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Socket.IO

## Setup and Installation

### 1. MongoDB Cluster Setup

- **Create a MongoDB Atlas Cluster**: If you don't have one, sign up for MongoDB Atlas and create a free tier cluster.
- **Create a Database User**: Create a database user with access to your cluster.
- **Allow Network Access**: Configure network access to allow connections from anywhere (for testing) or specific IP addresses.
- **Get Connection String**: Obtain your MongoDB connection string (URI) from the Atlas dashboard. It will look something like: `mongodb+srv://<username>:<password>@<cluster-url>/whatsapp?retryWrites=true&w=majority`.

### 2. Backend Setup

1.  **Navigate to the `backend` directory**:

```bash
    cd backend
```

2.  **Create a `.env` file**: Copy the contents of `.env.example` into a new file named `.env` in the `backend` directory.

```bash
    cp .env
```

3.  **Update `.env`**:
    - Replace `<username>`, `<password>`, and `<cluster-url>` in `MONGO_URI` with your MongoDB Atlas credentials and cluster details.
    - You can keep `PORT=5000` or change it if needed.

```bash
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster_url/whatsapp?retryWrites=true&w=majority
PORT=5000
```

4.  **Install dependencies**:

```bash
    npm install
```

5.  **Run the backend server**:

```bash
npm run dev # For development with nodemon
    # or
npm start # For production
```

    The backend server will start on the specified `PORT` (default: 5000).

### 3. Frontend Setup

1.  **Navigate to the `frontend` directory**:

```bash
    cd ../frontend
```

2.  **Create a `.env` file**: Copy the contents of `.env.example` into a new file named `.env` in the `frontend` directory.

```bash
    cp .env
```

3.  **Update `.env`**:
    - Ensure `VITE_API_BASE_URL` and `VITE_SOCKET_URL` point to your backend server's address. If running locally, these should match your backend's port.

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4.  **Install dependencies**:

```bash
    npm install
```

5.  **Run the frontend development server**:

```bash
    npm run dev
```

    The frontend application will open in your browser (usually `http://localhost:5173`).

## How to Use and Test

### 1. Access the Frontend

Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`). You will see the WhatsApp Web-like interface. Initially, the chat list will be empty.

### 2. Simulate Webhook Payloads

Since direct file reading from a Google Drive link is not possible in this environment, you will need to manually send the sample webhook payloads to your backend's webhook endpoint.

- **Endpoint**: `http://localhost:5000/api/webhook` (or your deployed backend URL)
- **Method**: `POST`
- **Content-Type**: `application/json`

You can use tools like Postman, Insomnia, `curl`, or a simple JavaScript `fetch` script to send these payloads.

**Example `curl` command for a text message payload:**

```bash
curl -X POST \
 http://localhost:5000/api/webhook \
 -H 'Content-Type: application/json' \
 -d '{
"object": "whatsapp_business_account",
"entry": [
{
"id": "YOUR_BUSINESS_ACCOUNT_ID",
"changes": [
{
"field": "messages",
"value": {
"messaging_product": "whatsapp",
"metadata": {
"display_phone_number": "16505551111",
"phone_number_id": "YOUR_PHONE_NUMBER_ID"
},
"contacts": [
{
"profile": {
"name": "John Doe"
},
"wa_id": "1234567890"
}
],
"messages": [
{
"from": "1234567890",
"id": "wamid.HBgLMTEyMzQ1Njc4OTA1FQIAEhgUMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAB",
"timestamp": "1678886400",
"text": {
"body": "Hello from WhatsApp!"
},
"type": "text"
}
]
}
}
]
}
]
}'
```

**Example `curl` command for a status update payload (e.g., delivered):**

```bash
curl -X POST \
 http://localhost:5000/api/webhook \
 -H 'Content-Type: application/json' \
 -d '{
"object": "whatsapp_business_account",
"entry": [
{
"id": "YOUR_BUSINESS_ACCOUNT_ID",
"changes": [
{
"field": "messages",
"value": {
"messaging_product": "whatsapp",
"metadata": {
"display_phone_number": "16505551111",
"phone_number_id": "YOUR_PHONE_NUMBER_ID"
},
"statuses": [
{
"id": "wamid.HBgLMTEyMzQ1Njc4OTA1FQIAEhgUMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAB",
"status": "delivered",
"timestamp": "1678886405",
"recipient_id": "YOUR_PHONE_NUMBER_ID",
"conversation": {
"id": "a_conversation_id",
"origin": {
"type": "user_initiated"
}
},
"pricing": {
"billable": true,
"category": "utility",
"pricing_model": "per_conversation"
}
}
]
}
}
]
}
]
}'
```

As you send these payloads, you should see new conversations appear in the left sidebar and messages update in real-time in the frontend.

### 3. Send Demo Messages

1.  Click on a conversation in the left sidebar to open the chat window.
2.  Use the "Type a message" input box at the bottom.
3.  Type your message and click "Send".
4.  The message will immediately appear in the chat window (optimistic update) and be saved to your MongoDB database. Its status will initially be "sent".

## Deployment

This application can be hosted on platforms like Vercel (for frontend) and Render/Fly.io (for backend) or a single platform that supports both Node.js and React.

### Vercel Deployment (Frontend)

1.  **Build the frontend**:

```bash
    cd frontend
    npm run build
```

2.  **Deploy to Vercel**:
    - Install Vercel CLI: `npm i -g vercel`
    - Login: `vercel login`
    - Navigate to the `frontend` directory and run `vercel`.
    - During deployment, you will need to set the environment variables `VITE_API_BASE_URL` and `VITE_SOCKET_URL` to your **publicly accessible backend URL**.

### Backend Deployment (e.g., Render, Fly.io)

1.  **Choose a hosting provider** that supports Node.js applications (e.g., Render, Fly.io, Heroku).
2.  **Configure your project** to deploy the `backend` directory.
3.  **Set environment variables**: Ensure `MONGO_URI` and `PORT` are configured in your hosting provider's environment settings. The `PORT` should be set to `80` or `443` if your provider requires it, or simply use `process.env.PORT` as in `server.js`.
4.  **Expose the webhook endpoint**: Make sure your backend's `/api/webhook` endpoint is publicly accessible.

**Important**: After deploying your backend, update the `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in your Vercel frontend project's environment variables to point to your deployed backend URL. Re-deploy the frontend for changes to take effect.

## Evaluation Criteria Notes

- **UI Closeness to WhatsApp Web**: The design aims for a clean, two-pane layout with distinct message bubbles and status indicators.
- **Responsiveness**: Tailwind CSS is used to ensure the layout adapts well to different screen sizes (mobile and desktop).
- **Thoughtful Assumptions**:
  - Webhook processing assumes the structure of WhatsApp Business API payloads for messages and status updates.
  - User names are derived from `wa_id` for simplicity.
  - Outbound messages are only stored, not sent externally.
- **Well-structured Backend**: The backend follows a clear MVC-like pattern with separate files for models, controllers, routes, and utilities.
- **Real-Time Updates**: Socket.IO is integrated for instant UI updates on new messages and status changes.

---

**Note on Sample Payloads**: The provided Google Drive link for sample payloads cannot be directly accessed by the AI. Therefore, the instructions include example `curl` commands for you to manually simulate sending these payloads to your running backend. You can adapt these examples based on the actual JSON content from the zip file.
