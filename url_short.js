export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Ignore favicon to prevent bugs
    if (path === "/favicon.ico") {
      return new Response(null, { status: 404 });
    }

    // 2. SEO: Robots.txt (Tells Google to scan your site)
    if (path === "/robots.txt") {
      const robots = `User-agent: *\nAllow: /\nSitemap: ${url.origin}/sitemap.xml`;
      return new Response(robots, { headers: { "Content-Type": "text/plain" } });
    }

    // 3. SEO: Sitemap.xml (Maps out all your hidden SEO pages for Google)
    if (path === "/sitemap.xml") {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${url.origin}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
        <url><loc>${url.origin}/youtube-link-shortener</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
        <url><loc>${url.origin}/tiktok-link-shortener</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
        <url><loc>${url.origin}/discord-link-shortener</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
        <url><loc>${url.origin}/affiliate-link-shortener</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
      </urlset>`;
      return new Response(sitemap, { headers: { "Content-Type": "text/xml" } });
    }

    // 4. Handle the API (Generate and save short link)
    if (request.method === "POST" && path === "/api/shorten") {
      const body = await request.json();
      if (!body.url) {
        return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
      }

      // Generate random 6-character shortcode
      const slug = Math.random().toString(36).substring(2, 8);
      
      // Save to KV database
      await env.LINKS.put(slug, body.url);

      const shortUrl = `${url.origin}/${slug}`;
      return new Response(JSON.stringify({ shortUrl, slug }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 5. Handle Redirects & Programmatic SEO Pages
    if (request.method === "GET") {
      const slug = path.substring(1); // Remove the "/"

      // Check the Database FIRST to see if this is a short link someone clicked
      if (slug !== "") {
        const longUrl = await env.LINKS.get(slug);
        if (longUrl) {
          // If it exists in the database, redirect instantly!
          return Response.redirect(longUrl, 302);
        }
      }

      // If it's NOT a short link, check if it is one of our SEO Pages
      const seoPages = {
        "": "Custom",
        "youtube-link-shortener": "YouTube",
        "tiktok-link-shortener": "TikTok",
        "discord-link-shortener": "Discord",
        "affiliate-link-shortener": "Affiliate"
      };

      if (slug in seoPages) {
        const platformName = seoPages[slug];
        const html = generateHTML(platformName, url.origin, path);
        return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      // If it's not a valid shortlink and not an SEO page, return 404
      return new Response("404 - Short link not found", { status: 404 });
    }

    return new Response("Not found", { status: 404 });
  }
};

// --- THE FRONTEND HTML GENERATOR (Programmatic SEO) ---
function generateHTML(platform, origin, path) {
  // Dynamically change the text based on the URL the user visited!
  const isCustom = platform === "Custom";
  const titleText = isCustom ? "Custom" : platform;
  const h1Text = isCustom ? "Shorten URLs." : `Shorten ${platform} Links.`;
  const placeholderText = isCustom ? "Paste your long link here..." : `Paste your long ${platform} link here...`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Dynamic SEO Meta Tags -->
    <title>Free ${titleText} URL Shortener Without Signup | SnipLink</title>
    <meta name="description" content="Shorten, track, and manage your ${titleText} URLs with our free, lightning-fast URL shortener. No sign-up required.">
    <link rel="canonical" href="${origin}${path}" />

    <!-- Schema Markup for Google Rich Snippets -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "SnipLink ${isCustom ? '' : platform + ' Edition'}",
      "url": "${origin}${path}",
      "applicationCategory": "Utility",
      "operatingSystem": "All",
      "description": "A free, lightning-fast ${isCustom ? '' : platform} URL shortener with no signup required.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
    </script>

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: { extend: { boxShadow: { 'brutal': '6px 6px 0px 0px rgba(0,0,0,1)', 'brutal-hover': '2px 2px 0px 0px rgba(0,0,0,1)' } } }
        }
    </script>
</head>
<body class="bg-[#FFF4E0] text-black font-sans">
    <nav class="p-6 max-w-6xl mx-auto flex justify-between items-center">
        <a href="/" class="text-3xl font-black tracking-tighter border-2 border-black px-3 py-1 bg-[#FF90E8] shadow-brutal transform -rotate-2 hover:rotate-0 transition">
            SnipLink.
        </a>
        <a href="#features" class="font-bold border-b-2 border-black hover:text-blue-600">How it works</a>
    </nav>

    <main class="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">
            ${h1Text} <br>
            <span class="bg-[#FFC900] px-4 border-4 border-black shadow-brutal inline-block mt-2">Zero Bullshit.</span>
        </h1>
        <p class="text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto">
            Transform ugly, long links into clean, shareable URLs in one click. Free and insanely fast.
        </p>

        <div class="bg-white border-4 border-black p-8 shadow-brutal rounded-xl text-left max-w-3xl mx-auto">
            <form id="shorten-form" class="flex flex-col md:flex-row gap-4">
                <input type="url" id="longUrl" placeholder="${placeholderText}" required
                    class="flex-1 text-lg font-medium px-6 py-4 border-4 border-black outline-none focus:bg-blue-50">
                <button type="submit" 
                    class="bg-[#38DBFF] text-xl font-bold px-8 py-4 border-4 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all">
                    Snip It! ✂️
                </button>
            </form>

            <div id="result" class="hidden mt-8 p-6 bg-[#A3E635] border-4 border-black">
                <p class="font-bold text-lg mb-2">🎉 Your short link is ready!</p>
                <div class="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border-2 border-black p-4">
                    <a id="shortUrl" href="#" target="_blank" class="text-xl font-black text-black underline break-all"></a>
                    <button id="copyBtn" class="bg-black text-white font-bold px-4 py-2 hover:bg-gray-800 w-full md:w-auto">
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    </main>

    <section id="features" class="bg-[#FF90E8] border-y-4 border-black py-20 mt-12">
        <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-4xl font-black mb-12 text-center bg-white inline-block px-6 py-2 border-4 border-black shadow-brutal mx-auto flex w-max">Why use SnipLink?</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <article class="bg-white border-4 border-black p-6 shadow-brutal">
                    <div class="text-4xl mb-4">⚡</div>
                    <h3 class="text-2xl font-bold mb-2">Lightning Fast</h3>
                    <p class="font-medium text-gray-700">Powered by Cloudflare's edge network, your links redirect users globally.</p>
                </article>
                <article class="bg-white border-4 border-black p-6 shadow-brutal">
                    <div class="text-4xl mb-4">🔒</div>
                    <h3 class="text-2xl font-bold mb-2">Secure & Reliable</h3>
                    <p class="font-medium text-gray-700">No trackers, no ads. Just a 99.9% uptime guaranteed redirect tool.</p>
                </article>
                <article class="bg-white border-4 border-black p-6 shadow-brutal">
                    <div class="text-4xl mb-4">📈</div>
                    <h3 class="text-2xl font-bold mb-2">Better Click-Throughs</h3>
                    <p class="font-medium text-gray-700">Clean, concise links improve trust and get more clicks on social media.</p>
                </article>
            </div>
        </div>
    </section>

    <!-- Internal SEO Linking -->
    <footer class="bg-black text-white py-12 border-t-4 border-black">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p class="font-bold text-lg">© 2026 SnipLink. Free Utility Tool.</p>
            <div class="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-400">
                <a href="/" class="hover:text-white underline">General Shortener</a>
                <a href="/youtube-link-shortener" class="hover:text-white underline">YouTube</a>
                <a href="/tiktok-link-shortener" class="hover:text-white underline">TikTok</a>
                <a href="/discord-link-shortener" class="hover:text-white underline">Discord</a>
                <a href="/affiliate-link-shortener" class="hover:text-white underline">Affiliate Links</a>
            </div>
        </div>
    </footer>

    <script>
        document.getElementById('shorten-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const longUrl = document.getElementById('longUrl').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            submitBtn.textContent = 'Snipping...';
            
            try {
                const response = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: longUrl })
                });
                
                const data = await response.json();
                
                if (data.shortUrl) {
                    document.getElementById('result').classList.remove('hidden');
                    const shortUrlElem = document.getElementById('shortUrl');
                    shortUrlElem.href = data.shortUrl;
                    shortUrlElem.textContent = data.shortUrl;
                }
            } catch (error) {
                alert("Something went wrong.");
            } finally {
                submitBtn.textContent = 'Snip It! ✂️';
            }
        });

        document.getElementById('copyBtn').addEventListener('click', (e) => {
            const shortUrl = document.getElementById('shortUrl').textContent;
            navigator.clipboard.writeText(shortUrl);
            e.target.textContent = 'Copied! ✅';
            setTimeout(() => { e.target.textContent = 'Copy Link'; }, 2000);
        });
    </script>
</body>
</html>
  `;
}