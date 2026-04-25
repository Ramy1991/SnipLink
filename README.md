# ✂️ SnipLink - Serverless URL Shortener

![UI Preview](https://img.shields.io/badge/UI-Neobrutalism-FF90E8?style=for-the-badge&logoColor=black)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![SEO Optimized](https://img.shields.io/badge/SEO-Optimized-A3E635?style=for-the-badge)

SnipLink is a lightning-fast, zero-cost, serverless URL shortener built completely on **Cloudflare Workers** and **Cloudflare KV**. It features a trendy Neobrutalist UI and is highly optimized for Google Search out-of-the-box.

## ✨ Features

- **🚀 Lightning Fast:** Runs entirely on Cloudflare's Edge Network (0ms cold starts).
- **💾 Serverless DB:** Uses Cloudflare KV for instant read/write link routing.
- **🎨 Neobrutalist UI:** Trendy, bold, and high-converting single-page design built with TailwindCSS.
- **🤖 Programmatic SEO Engine:** Automatically generates targeted landing pages for specific search queries (e.g., `/youtube-link-shortener`, `/discord-link-shortener`).
- **🗺️ Built-in SEO Files:** Automatically generates `sitemap.xml` and `robots.txt` dynamically.
- **💰 100% Free to Host:** Easily fits within Cloudflare's generous free tier (100,000 requests/day).

## 🛠️ Tech Stack

- **Backend:** Cloudflare Workers (JavaScript)
- **Database:** Cloudflare KV
- **Frontend:** Vanilla HTML/JS inside the Worker
- **Styling:** Tailwind CSS (via CDN)

## 🌐 The Programmatic SEO Advantage

Unlike normal URL shorteners that just have one homepage, SnipLink listens to the URL path and dynamically rebuilds the HTML to target long-tail keywords. 

Try visiting:
* `/` -> General Shortener
* `/youtube-link-shortener` -> Changes H1, Title, and Meta descriptions for YouTube keyword targeting.
* `/tiktok-link-shortener` -> Optimized for TikTok.
* `/sitemap.xml` -> Automatically maps these pages out for Google.

## 🚀 How to Deploy (No Terminal Required)

You can deploy this entire application straight from the Cloudflare website in about 3 minutes.

### 1. Create the Database
1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** -> **KV**.
3. Click **Create a namespace**, name it exactly `LINKS`, and click Add.

### 2. Create the Worker
1. Navigate back to **Workers & Pages**.
2. Click **Create** -> **Worker**.
3. Name your worker (e.g., `snip-link`) and click **Deploy**.

### 3. Connect the Database
1. Go to your newly created worker's page and click the **Settings** tab.
2. Go to **Bindings** -> **Add Binding** -> **KV Namespace**.
3. Set the Variable Name to `LINKS` and select your `LINKS` database from the dropdown. 
4. Click **Deploy/Save**.

### 4. Paste the Code
1. Go to the **Overview** tab of your worker.
2. Click **Edit Code** in the top right corner.
3. Delete all the default code in `worker.js`.
4. Copy the code from this repository and paste it into the editor.
5. Click **Deploy**.

Your URL shortener is now live on the internet! 🎉

## 🔗 Custom Domain
To make your shortener look professional, buy a short domain (like `snip.link`) and attach it to your worker via the **Custom Domains** tab in your Cloudflare Worker settings.

## 📜 License

MIT License - feel free to use, modify, and build upon this project!
