=== Media Lume – AI Image Generator for Media Library ===
Contributors: foysalremon, saiful96
Tags: ai, image generator, ai image, media library, featured image
Requires at least: 5.0
Tested up to: 7.0
Stable tag: 1.0.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Free AI image generator for WordPress. Generate AI images with Flux, Ideogram, Recraft and more right inside your Media Library — no API key needed.

== Description ==

Tired of switching to a separate tool just to generate an image — then downloading it and re-uploading it to WordPress? **Media Lume** is a free AI image generator built right into your WordPress admin. Generate AI images with Flux, Ideogram, Recraft, and more, and every result lands directly in your Media Library — ready to insert into any post, set as a featured image, or use anywhere on your site. No separate app, no API key, no subscription required.

= Key features =

* **Free by default** — uses Pollinations.ai with no API key or account required for Flux models
* **More models with a free account** — link your free Pollinations account to unlock GPT Image 2, Ideogram, Recraft, and more
* **Bring your own key** — connect a fal.ai account to use your own API credits at your own rate
* **Saves to Media Library** — every generated image is added to your WordPress Media Library with proper alt text, ready to use as a featured image, post thumbnail, or anywhere in your content
* **Multiple aspect ratios** — Square HD (1024×1024), Landscape 4:3, Portrait 4:3, and Landscape 16:9
* **Guided setup wizard** — a step-by-step onboarding flow gets you generating images in under a minute
* **No subscription** — generate for free with Pollinations.ai, or pay only what you use with fal.ai

= Available AI models =

Without any account (free, limited):

* **Flux** and **Flux Pro** — fast, high-quality text-to-image generation via Pollinations.ai

With a free Pollinations.ai account linked (all models unlocked):

* **GPT Image 2** — OpenAI-powered image generation
* **Ideogram v3** — excellent for text rendered inside images
* **Recraft v4.1** — photorealistic and illustration styles
* **Nano Banana 2** — fast creative generation

With fal.ai (your own API key):

* Access every model available on fal.ai at your account's own pricing — including Flux Schnell, Flux 2 Pro, GPT Image 2, Ideogram v3, Recraft, and more

= Who can use this plugin? =

* Any user with the **upload_files** capability (Author, Editor, Administrator) can generate images
* Only **Administrators** can access plugin settings and configure providers

= Privacy =

This plugin sends your prompt and selected settings to an external API provider when you click Generate. It does not collect analytics, does not track your usage, and does not contact any external server on page load or on plugin activation. No data is transmitted unless you actively initiate image generation.

= External services =

This plugin relies on the following third-party APIs to generate images. You must review their terms before use.

**Pollinations.ai** — used as the default image provider.
When you generate an image using Pollinations.ai, your prompt and generation settings (model, image size) are sent to Pollinations servers.

* Website: https://pollinations.ai
* Terms of Service: https://pollinations.ai/terms
* Privacy Policy: https://pollinations.ai/privacy

**fal.ai** — optional, used only when you configure a fal.ai API key in Settings.
When you generate an image using fal.ai, your prompt and generation settings are sent to fal.ai servers using your API key.

* Website: https://fal.ai
* Terms of Service: https://fal.ai/terms
* Privacy Policy: https://fal.ai/privacy

No data is sent to either service unless you actively click "Generate." API keys are stored in your WordPress database and are transmitted directly to the respective provider over HTTPS. They are never shared with any other party.

= Source Code =

This plugin is open source. Full source code including all build tools and uncompiled JavaScript is available at:
https://github.com/foysalremon/media-lume

To rebuild the compiled assets from source: npm install && npm run build

== Installation ==

= Automatic installation =

1. Log in to your WordPress admin panel
2. Go to **Plugins → Add New**
3. Search for **Media Lume**
4. Click **Install Now**, then **Activate**
5. A setup wizard will appear automatically — follow the steps to choose your image provider

= Manual installation =

1. Download the plugin zip file from WordPress.org
2. Go to **Plugins → Add New → Upload Plugin**
3. Upload the zip file and click **Install Now**
4. Click **Activate Plugin**

= First steps after activation =

A guided setup wizard will appear on your first admin page load. It takes about one minute to complete. You can also skip it and go directly to **Media Lume** in the sidebar to start generating.

== Frequently Asked Questions ==

= Is this plugin really free? =

Yes. The default image provider (Pollinations.ai) is completely free and requires no account or API key to start generating images. You get access to Flux models immediately. Linking a free Pollinations.ai account (takes about 30 seconds) unlocks all remaining models. fal.ai is an optional paid provider if you prefer to use your own account.

= Do I need to create an account anywhere? =

No account is required to start. You can generate images with Pollinations.ai and the Flux model without signing up for anything. If you want access to all AI models, linking a free Pollinations.ai account is recommended. fal.ai requires a paid account with billing credits.

= Where are generated images stored? =

Generated images are downloaded from the AI provider and saved directly to your WordPress Media Library. They are stored on your own server just like any other uploaded image.

= Can I use generated images as featured images? =

Yes. Every AI image generated by Media Lume is saved to your WordPress Media Library just like any other uploaded image. To set it as a featured image, open the post editor, click the Featured Image panel, and pick it from the Media Library — no extra steps needed.

= Who can generate images? =

Any logged-in WordPress user with the `upload_files` capability. This typically includes Authors, Editors, and Administrators. Subscribers and Contributors cannot generate images.

= Who can change plugin settings? =

Only users with the `manage_options` capability, which is Administrators by default.

= Is my fal.ai API key stored securely? =

Your API key is stored in the WordPress database using `update_option()`, the same mechanism WordPress uses for all plugin settings. It is transmitted only to fal.ai over HTTPS when you generate an image, and never sent to any other party.

= Can visitors or logged-out users generate images? =

No. Image generation requires a logged-in user with appropriate capabilities. The REST API endpoint is protected by a permission check and is not accessible publicly.

= Does this plugin affect my site's front end? =

No. Media Lume is an admin-only plugin. It does not load any scripts or styles on the public-facing side of your site.

= What image sizes are supported? =

* Square HD — 1024 × 1024 px
* Landscape 4:3 — 1024 × 768 px
* Portrait 4:3 — 768 × 1024 px
* Landscape 16:9 — 1280 × 720 px

= Does uninstalling the plugin delete my generated images? =

No. Images that have already been saved to your Media Library remain there after uninstalling. Only the plugin's settings and configuration data are removed.

== Screenshots ==

1. The image generation panel — type a prompt, choose a size and model, and click Generate.
2. Generated images appear immediately and are saved directly to your Media Library.
3. Settings page — choose your image provider and configure API keys.
4. Onboarding wizard — a guided setup to get started in under a minute.

== Changelog ==

= 1.0.1 =
* Improved WordPress.org readme: updated title, tags, short description, and added featured image FAQ

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.1 =
No code changes — readme improvements only.

= 1.0.0 =
Initial release.
