# MediaLume

AI image generation directly inside the WordPress media library. Free, open-source, no managed account required.

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Developer Setup](#developer-setup)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [User Guide](#user-guide)
7. [Testing Procedure](#testing-procedure)

---

## Overview

MediaLume adds an **AI Generate** tab inside the WordPress media library modal. Users write a text prompt and receive a generated image that is automatically saved to the media library with the prompt pre-filled as the alt text.

**Providers:**

| Provider | API Key | Models Available |
|---|---|---|
| Pollinations.ai (no account) | None | FLUX.1 Schnell, FLUX.2 Pro |
| Pollinations.ai (linked account) | User's free Pollinations account | All models (GPT Image 2, Ideogram V3, Recraft V4.1, and more) |
| fal.ai — Bring Your Own Key | User's fal.ai key | All fal-ai/* models |

---

## Requirements

- **WordPress** 5.0 or later
- **PHP** 7.4 or later
- **Node.js** 18+ and **npm** (for building assets)
- A Pollinations developer app key (see [Developer Setup](#developer-setup)) — required for the account-linking OAuth flow

---

## Developer Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/foysalremon/media-lume.git
cd media-lume
npm install
```

### 2. Configure the Pollinations app key

MediaLume uses Pollinations' **BYOP (Bring Your Own Pollen)** commission system. When a user links their free Pollinations account through the plugin, their generations are attributed to the MediaLume app key and **you earn 0.25 pollen per image**.

**One-time setup:**

1. Go to [https://enter.pollinations.ai](https://enter.pollinations.ai) and sign in or create an account.
2. Navigate to **App Registration** in the developer/apps section.
3. Create a new app with `earningsEnabled: true`.
4. Copy your publishable app key (`pk_...`). This key is safe to embed — it is designed for client-side use.

**Add the key to your environment:**

```bash
cp .env.example .env
```

Edit `.env`:

```
MEDIALUME_POLLINATIONS_CLIENT_ID=pk_your_key_here
```

The `prebuild`/`prestart` script reads `.env` and writes the key to `includes/generated-env.php` (gitignored). The key is never committed.

> **Production deployments:** create `.env` on the server and run `npm run build`, or copy a pre-built `generated-env.php` directly via your deploy pipeline.

### 3. Build

```bash
# Development (watch mode)
npm start

# Production build
npm run build
```

Build output goes to `build/` — three entry points: `index.js` (main app), `admin.js` (settings page), `onboarding.js` (setup wizard).

### 4. Install in WordPress

Symlink or copy the plugin folder to `wp-content/plugins/media-lume/` and activate from the WordPress admin. The plugin will show the onboarding wizard on first activation.

---

## Project Structure

```
media-lume/
├── media-lume.php                  # Plugin entry point, constants, activation hook
├── includes/
│   ├── class-medialume.php         # Singleton loader
│   ├── class-medialume-admin.php   # Enqueues main app in media modal
│   ├── class-medialume-settings.php# Settings page REST routes + admin menu
│   ├── class-medialume-onboarding.php # Onboarding wizard REST routes + rendering
│   ├── class-medialume-rest.php    # /generate REST route
│   ├── class-medialume-generator.php  # Routes to correct provider
│   ├── generated-env.php           # Build-time secrets — gitignored
│   └── providers/
│       ├── class-provider-base.php     # sideload_image(), map_size(), error(), success()
│       ├── class-provider-pollinations.php # Legacy + API mode
│       └── class-provider-fal-byok.php     # fal.ai direct API
├── src/
│   ├── index.js                    # Main generator app entry (media modal)
│   ├── App.js                      # Root component — model/size/prompt state
│   ├── index.css                   # Tailwind + ml-* custom classes
│   ├── components/
│   │   ├── GenerateForm.js         # Prompt input, model picker, size picker, suggestions
│   │   ├── PreviewPanel.js         # Generated image display
│   │   └── FormControls.js         # FieldLabel, CustomDropdown, RatioCards
│   ├── admin/
│   │   ├── SettingsApp.jsx         # Settings page root — 3 tabs
│   │   ├── constants/plans.js      # GENERATE_MODELS, IMAGE_SIZES
│   │   └── tabs/
│   │       ├── AccountTab.jsx      # Plugin info
│   │       ├── ProvidersTab.jsx    # Provider selection + fal.ai key
│   │       └── AdvancedTab.jsx     # Defaults, debug mode, danger zone
│   └── onboarding/
│       ├── OnboardingApp.jsx       # Wizard shell — step routing
│       ├── components/
│       │   └── StepIndicator.jsx   # Progress dots
│       └── steps/
│           ├── Welcome.jsx
│           ├── ProviderSetup.jsx
│           ├── FirstGeneration.jsx
│           └── Complete.jsx
└── build/                          # Compiled output — gitignored except .asset.php files
```

---

## Architecture

### PHP classes

| Class | Responsibility |
|---|---|
| `MediaLume` | Singleton loader, wires all classes together |
| `MediaLume_Admin` | Enqueues `index.js` into media modal, localizes `mediaLumeData` |
| `MediaLume_Settings` | Admin menu page, settings REST routes, Pollinations OAuth routes |
| `MediaLume_Onboarding` | Wizard overlay rendering, wizard state/complete/dismiss REST routes |
| `MediaLume_REST` | `/generate` endpoint — validates request, calls generator |
| `MediaLume_Generator` | Selects provider based on `medialume_provider` option |
| `MediaLume_Provider_Base` | `sideload_image()` (downloads + saves to media library, sets alt text), `map_size()` |
| `MediaLume_Provider_Pollinations` | Legacy mode (keyless, 2 models) + API mode (linked account, all models) |
| `MediaLume_Provider_Fal_Byok` | fal.ai direct API using stored user key |

### WordPress options stored

| Option | Description |
|---|---|
| `medialume_provider` | `pollinations` or `fal` |
| `medialume_pollinations_user_key` | User's `sk_...` token after OAuth link |
| `medialume_fal_key` | User's fal.ai API key (stored encrypted) |
| `medialume_default_model` | Pre-selected model in generator |
| `medialume_default_image_size` | Pre-selected size in generator |
| `medialume_debug_mode` | `1` or `0` |
| `medialume_onboarding_status` | `pending` or `completed` |
| `medialume_onboarding_wizard_state` | Serialised wizard progress |

### Localized JS data

**`mediaLumeData`** (main app, media modal):

```js
{
  nonce, provider, pollinationsConnected,
  defaultModel, defaultImageSize, debugMode
}
```

**`mediaLumeSettings`** (settings page):

```js
{ nonce, restUrl, settings: { provider, pollinationsConnected, falApiKeySaved, falApiKeyMasked, defaultModel, defaultImageSize, debugMode } }
```

**`mediaLumeOnboarding`** (wizard):

```js
{ nonce, savedState, mediaUrl, settingsUrl }
```

### REST routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/medialume/v1/generate` | `upload_files` | Generate image |
| GET/POST | `/medialume/v1/settings` | `manage_options` | Get/save settings |
| POST | `/medialume/v1/test-connection` | `manage_options` | Test provider connectivity |
| POST | `/medialume/v1/reset-settings` | `manage_options` | Reset all options to defaults |
| POST | `/medialume/v1/pollinations/connect` | `manage_options` | Start device-code OAuth |
| POST | `/medialume/v1/pollinations/poll` | `manage_options` | Poll for OAuth approval |
| POST | `/medialume/v1/pollinations/disconnect` | `manage_options` | Remove stored token |
| POST | `/medialume/v1/onboarding/state` | `manage_options` | Persist wizard progress |
| POST | `/medialume/v1/onboarding/complete` | `manage_options` | Mark wizard complete |
| POST | `/medialume/v1/onboarding/dismiss` | `manage_options` | Dismiss wizard without completing |
| POST | `/medialume/v1/onboarding/reset` | `manage_options` | Re-arm wizard for next page load |

All routes are internal — used by the plugin's own React frontend. They are not a public developer API.

**`/generate` accepted values:**

`model`: `fal-ai/flux/schnell`, `fal-ai/flux-2-pro`, `fal-ai/ideogram/v3`, `fal-ai/recraft/v4.1/text-to-image`, `fal-ai/nano-banana-2`, `openai/gpt-image-2`

`image_size`: `square_hd`, `landscape_4_3`, `portrait_4_3`, `landscape_16_9`

---

## User Guide

### First run — Setup Wizard

On first activation MediaLume shows a 4-step setup wizard:

1. **Welcome** — overview of the plugin.
2. **Provider** — choose Pollinations.ai (no key needed) or fal.ai (enter your API key). You can change this anytime in Settings.
3. **Generate** — try a test generation in the wizard itself.
4. **Done** — links to the media library and settings page.

### Generating images

1. Open any post, page, or go to **Media → Add New** and click **Add Media**.
2. In the media modal, click the **AI Generate** tab.
3. Choose a **model** and **image size**.
4. Type a prompt or click one of the suggestion chips below the text field.
5. Click **✦ Generate Image**.
6. The image is automatically saved to your media library with the prompt set as the alt text.
7. Click **Use this image** to insert it.

### Settings page (MediaLume → Settings)

**About tab** — plugin information and quick-start steps.

**Providers tab:**
- Switch between Pollinations.ai and fal.ai.
- **Pollinations.ai:** works free out of the box (FLUX models only). Click **Link my Pollinations account** to unlock all models via a 30-second OAuth flow.
- **fal.ai:** paste your fal.ai API key from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys). Use **Test** to verify the key before saving.

**Advanced tab:**
- **Default Image Size** — pre-selects a size when the generator opens.
- **Default Generation Model** — pre-selects a model when the generator opens.
- **Debug Mode** — logs every generation request and response to the browser DevTools console (tagged `[MediaLume]`).
- **Danger Zone:**
  - **Reset All Settings** — clears all plugin options and reloads. Requires clicking twice to confirm.
  - **Re-run Setup Wizard** — re-arms the wizard so it appears on the next admin page load.

---

## Testing Procedure

This section covers every testable behaviour in the plugin. Test in order — later sections assume earlier ones passed.

---

### Environment setup

Before starting:

1. Fresh WordPress install (or a staging site with no prior MediaLume data).
2. PHP 7.4+, WordPress 5.0+.
3. An admin account with `manage_options` capability.
4. A second browser tab open to the WordPress admin — you will switch between media library and settings repeatedly.
5. Have the following ready:
   - A valid fal.ai API key from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
   - A free Pollinations account at [enter.pollinations.ai](https://enter.pollinations.ai)
   - An **invalid** fal.ai API key string (e.g. `fal_invalid_key_for_testing`) for error-path tests

---

### 1. Installation & Activation

| # | Step | Expected result |
|---|---|---|
| 1.1 | Upload and activate the plugin from **Plugins → Add New**. | No PHP errors or warnings. Plugin appears as active. |
| 1.2 | Check the WordPress admin sidebar. | **MediaLume** menu item appears with the correct logo icon. |
| 1.3 | Check the browser console on any admin page. | No JavaScript errors from the plugin. |
| 1.4 | Check the **Tools → Site Health** screen. | No critical errors introduced by the plugin. |

---

### 2. Onboarding Wizard — First Run

The wizard should appear automatically on any admin page after activation.

| # | Step | Expected result |
|---|---|---|
| 2.1 | Load any admin page after activation. | The wizard modal appears as an overlay. Background is dimmed. |
| 2.2 | Inspect the wizard header. | Shows the MediaLume logo (the correct logo, not a star or generic icon) and the text **MediaLume**. |
| 2.3 | Inspect the step indicator at the top. | Shows 4 steps labelled: **Welcome**, **Provider**, **Generate**, **Done**. |
| 2.4 | Read the Welcome step. | Title: "Welcome to Media Lume". Large MediaLume logo icon above the title (not a placeholder shape). Three bullet points present. |
| 2.5 | Click **Skip for now**. | Wizard closes. |
| 2.6 | Reload the page. | Wizard does **not** reappear. (Dismiss is persisted per user.) |
| 2.7 | Go to **MediaLume → Settings → Advanced** and click **Re-run Setup Wizard**. | Toast shows "Wizard reset". |
| 2.8 | Reload any admin page. | Wizard reappears. |
| 2.9 | On the Welcome step, click **Let's go →**. | Advances to step 2 (Provider). Step indicator shows step 1 complete (check mark), step 2 active. |

**Provider step:**

| # | Step | Expected result |
|---|---|---|
| 2.10 | Inspect the two provider cards. | Cards show **Pollinations.ai** and **fal.ai — Bring Your Own Key**. No FREE badges on either card. |
| 2.11 | Pollinations.ai card is selected by default. | Card has active/highlighted state. |
| 2.12 | Click **fal.ai** card. | Card becomes active. An API key input field appears below the cards. |
| 2.13 | Leave the key field empty and click **Continue →**. | Button remains disabled (cannot proceed without a key when fal.ai is selected). |
| 2.14 | Enter an invalid key (e.g. `fal_bad_key`) and click **Test**. | "Testing…" state shown, then an error result (auth failed / invalid key). |
| 2.15 | Click back to **Pollinations.ai** card. | Key input disappears. Continue button is enabled. |
| 2.16 | Click **← Back**. | Returns to Welcome step. |
| 2.17 | Click **Let's go →** → select **Pollinations.ai** → click **Continue →**. | Saves provider setting and advances to step 3 (Generate). |

**Generate step:**

| # | Step | Expected result |
|---|---|---|
| 2.18 | Inspect the Generate step. | Shows example prompt chips and a textarea pre-filled with the first example. A generate button (star icon) is visible. |
| 2.19 | Click a different example chip. | Textarea updates to that prompt. |
| 2.20 | Clear the textarea and click the generate button. | Button is disabled when textarea is empty (cannot click). |
| 2.21 | Enter a short prompt (e.g. "a red apple") and click generate. | Loading spinner appears. After 10–30 seconds, a generated image appears below. |
| 2.22 | Inspect the result area. | Image is displayed. Below it shows **✓ Saved to media library** (no "Save" button — it is already saved automatically). |
| 2.23 | Click **Continue →**. | Advances to step 4 (Done). |

**Done step:**

| # | Step | Expected result |
|---|---|---|
| 2.24 | Inspect the Done step. | Confetti animation plays. Title "You're all set!". Two buttons: **Open Media Library** and **Go to Settings**. |
| 2.25 | Click **Go to Settings**. | Page navigates to MediaLume settings. Wizard does **not** reappear. |
| 2.26 | Go to **Media → Library**. | The test image generated in step 2.21 is present in the library. |
| 2.27 | Click the test image in the media library. | The **Alt Text** field is pre-filled with the prompt used to generate it. |

---

### 3. Media Library — Generator Tab

| # | Step | Expected result |
|---|---|---|
| 3.1 | Go to any post and click **Add Media**, or go to **Media → Add New**. | The media modal opens. |
| 3.2 | Look for the **AI Generate** tab in the modal. | Tab is visible and clickable. |
| 3.3 | Click the **AI Generate** tab. | The generator UI appears with: Generation Model dropdown, Image Size picker, Prompt textarea with suggestion chips, and a Generate button. |
| 3.4 | Inspect the default model shown. | Matches whatever is set in **Settings → Advanced → Default Generation Model** (or FLUX.1 Schnell if none set). |
| 3.5 | Inspect the default image size selected. | Matches whatever is set in **Settings → Advanced → Default Image Size** (or Square 1:1 if none set). |

**Prompt suggestions:**

| # | Step | Expected result |
|---|---|---|
| 3.6 | Look below the textarea. | A row of suggestion chips is visible, preceded by a "Try:" label. |
| 3.7 | Click any suggestion chip. | Textarea fills with that suggestion's full text. |
| 3.8 | Click a second chip. | Textarea is replaced with the new chip's text. |
| 3.9 | Manually edit the prompt text. | Character count appears top-right of the prompt label when text is present. |

**Generation — Pollinations free (no account linked):**

| # | Step | Expected result |
|---|---|---|
| 3.10 | Ensure provider is Pollinations, no account linked. | In model list, only **FLUX.1 Schnell** and **FLUX.2 Pro** are selectable. Other models show a lock indicator. |
| 3.11 | Select FLUX.1 Schnell, choose Square size, enter a prompt, click **✦ Generate Image**. | Button shows "Generating…" and is disabled. After 10–30 seconds an image appears in the preview panel. |
| 3.12 | Inspect the preview panel image. | Image is rendered. A **Use this image** button is present. |
| 3.13 | Click **Use this image**. | Modal closes. Image is inserted into the post/page editor. |
| 3.14 | Go to **Media → Library** and find the image just generated. | Image is present. Alt text field shows the prompt. |
| 3.15 | Generate with FLUX.2 Pro model. | Succeeds similarly. Image saved to library with alt text. |

**Image size variations:**

| # | Step | Expected result |
|---|---|---|
| 3.16 | Generate with **Landscape 4:3** size selected. | Image returned is wider than tall. |
| 3.17 | Generate with **Portrait 3:4** size selected. | Image returned is taller than wide. |
| 3.18 | Generate with **Widescreen 16:9** size selected. | Image returned is widescreen ratio. |

**Error handling:**

| # | Step | Expected result |
|---|---|---|
| 3.19 | Click **✦ Generate Image** with an empty prompt. | Button is disabled — cannot be clicked. |
| 3.20 | Simulate a network failure (disable network in DevTools) and try to generate. | An error message appears in the preview panel. No crash. Network can be re-enabled and generation retried. |

---

### 4. Pollinations Account Linking

| # | Step | Expected result |
|---|---|---|
| 4.1 | Go to **MediaLume → Settings → Providers** and ensure Pollinations.ai is selected. | Provider card shows "Active" chip. Displays the "Unlock all AI models" info box with a **Link my Pollinations account →** button. |
| 4.2 | Click **Link my Pollinations account →**. | Button label changes to "Opening link…". A new browser tab opens to `enter.pollinations.ai/device`. A code box appears in the settings panel. |
| 4.3 | Inspect the code box. | Shows a user code (e.g. `ABCD-1234`) in large mono text. A "Copy" label is next to it. A "Waiting for approval" note is shown. |
| 4.4 | Click the code to copy it. | Label changes to "✓ Copied" briefly, then resets. |
| 4.5 | In the Pollinations tab, enter the code and approve. | Within 5–10 seconds the settings panel automatically updates (no page refresh needed). |
| 4.6 | Inspect the Providers tab after approval. | Shows "✓ Linked — all AI models unlocked." and an **Unlink account** button. Provider card description updates to "All AI models available." |
| 4.7 | Go to the media library generator. | All 6 models are now selectable (no lock indicators). |
| 4.8 | Generate with a model that was previously locked (e.g. Ideogram V3). | Generation succeeds. Image saved to library. |
| 4.9 | Return to Settings → Providers and click **Unlink account**. | Confirmation shown (or immediate). Provider reverts to unlinked state. |
| 4.10 | Go to the generator. | Locked models reappear. Only FLUX models available. |
| 4.11 | Re-link the account (repeat steps 4.2–4.6) and click **Save Changes**. | Account remains linked after save. |

---

### 5. fal.ai Provider

| # | Step | Expected result |
|---|---|---|
| 5.1 | Go to **Settings → Providers**, click the **fal.ai** card. | Card becomes selected/active. A fal.ai API Key field appears below. |
| 5.2 | Inspect the key field. | Shows a password input and **Set Key** button. A link to `fal.ai/dashboard/keys` is shown. |
| 5.3 | Click **Set Key** with an empty field. | Button is disabled — cannot click. |
| 5.4 | Enter a valid fal.ai API key and click **Set Key**. | Toast shows "API key staged — click Save Changes to store it." |
| 5.5 | Click **Save Changes**. | Settings save. The key field now shows a masked value (e.g. `****abcd`) with **Edit** and **Test** buttons. |
| 5.6 | Inspect the Edit and Test buttons. | Buttons are the same height as the masked key field — no size mismatch. |
| 5.7 | Click **Test**. | Button shows "Testing…" briefly, then a success toast. |
| 5.8 | Click **Edit**. | Key field returns to password input mode with a **Set Key** and **Cancel** button. |
| 5.9 | Click **Cancel**. | Returns to masked key display without saving. |
| 5.10 | Click **Edit**, enter an invalid key, click **Set Key**, then **Save Changes**, then **Test**. | Test returns an error toast (auth failed). |
| 5.11 | Re-enter a valid key, save, and go to the media library generator. | Generator shows all fal.ai models selectable (no locks). |
| 5.12 | Generate an image using the fal.ai provider. | Generation succeeds. Image saved to library with prompt as alt text. |
| 5.13 | Test each image size with fal.ai. | All four sizes (square, landscape 4:3, portrait 3:4, widescreen) generate without error. |

---

### 6. Settings — Advanced Tab

**Default Image Size:**

| # | Step | Expected result |
|---|---|---|
| 6.1 | Go to **Settings → Advanced**. | Generation Defaults section shows four size cards (1:1, 4:3, 3:4, 16:9) and a model list below. |
| 6.2 | Click **Landscape 4:3** and click **Save Changes**. | Toast "Settings saved." |
| 6.3 | Open the media library generator. | Image size picker has **Landscape 4:3** pre-selected. |
| 6.4 | Change it to **Portrait 3:4**, generate an image, then close the modal and reopen it. | Size resets to **Landscape 4:3** (the saved default). |

**Default Generation Model:**

| # | Step | Expected result |
|---|---|---|
| 6.5 | Go to **Settings → Advanced**, select **FLUX.2 Pro** as the default model, save. | Toast "Settings saved." |
| 6.6 | Open the media library generator. | Model dropdown has **FLUX.2 Pro** pre-selected. |
| 6.7 | Change the model, generate, close and reopen the modal. | Model resets to **FLUX.2 Pro** (the saved default). |
| 6.8 | Select **(Use plugin default)** as the model default, save. | Generator opens with FLUX.1 Schnell selected (first unlocked model). |

**Debug Mode:**

| # | Step | Expected result |
|---|---|---|
| 6.9 | Toggle **Debug Mode** on, click **Save Changes**. | Toast "Settings saved." |
| 6.10 | Open the media library generator and open browser DevTools console. | No `[MediaLume]` logs yet. |
| 6.11 | Generate an image. | Console shows `[MediaLume] generate request {model, prompt, image_size}` before the request, then `[MediaLume] generate response {...}` after. |
| 6.12 | Toggle **Debug Mode** off, save, and generate again. | No `[MediaLume]` logs appear in the console. |

---

### 7. Settings — Danger Zone

**Reset All Settings:**

| # | Step | Expected result |
|---|---|---|
| 7.1 | Go to **Settings → Advanced**. | "Danger Zone" section header is displayed in red. |
| 7.2 | Click **Reset Settings** once. | Button label changes to **Confirm Reset**. A warning message appears: "Click 'Confirm Reset' again to proceed. This cannot be undone." |
| 7.3 | Click away or navigate elsewhere without confirming. | No reset occurs. |
| 7.4 | Click **Reset Settings**, then **Confirm Reset**. | Page reloads. Toast: "All settings reset to defaults." All settings are now at their default values (provider: Pollinations, no linked account, no model/size defaults, debug off). |

**Re-run Setup Wizard:**

| # | Step | Expected result |
|---|---|---|
| 7.5 | Click **Re-run Setup Wizard**. | Toast: "Wizard reset. Reload any admin page to start." |
| 7.6 | Reload any admin page. | Wizard reappears from step 1. |
| 7.7 | Complete the wizard all the way through and click **Open Media Library**. | Page navigates to the media library. Wizard does **not** reappear on the media library page or any subsequent page. |

---

### 8. Settings — About Tab

| # | Step | Expected result |
|---|---|---|
| 8.1 | Go to **Settings → About**. | Tab shows plugin name, description, and quick-start instructions. |

---

### 9. Save Bar Behaviour

| # | Step | Expected result |
|---|---|---|
| 9.1 | Load the settings page. | Save bar at the bottom shows **Save Changes** button (disabled). No "unsaved changes" notice. |
| 9.2 | Change any setting (e.g. toggle debug mode). | Button becomes enabled. "You have unsaved changes" text appears. |
| 9.3 | Click **Save Changes**. | Button shows "Saving…" while in flight, then resets. Toast "Settings saved." Unsaved changes notice disappears. |
| 9.4 | Reload the page. | Changed setting persists. |

---

### 10. Cross-cutting Checks

| # | Step | Expected result |
|---|---|---|
| 10.1 | Log in as a user with only **Author** role. | Generator tab in media modal is **not** visible (or is inaccessible — `/generate` returns 403). |
| 10.2 | Log in as an **Editor**. | Generator tab is visible (Editors have `upload_files`). Settings page is not accessible (requires `manage_options`). |
| 10.3 | Activate the plugin on a site with an object cache (e.g. Redis). | Plugin functions correctly. No stale data from cache. |
| 10.4 | Switch WordPress to a non-English language. | Settings page and generator UI display in English (strings not yet translated — expected). No fatal errors. |
| 10.5 | Test with PHP error reporting enabled (`WP_DEBUG = true`). | No PHP warnings, notices, or deprecated calls from plugin files. |
| 10.6 | Check the media library after multiple generations. | All generated images are present. Each has the correct prompt in the alt text field. |
| 10.7 | Deactivate and reactivate the plugin. | All saved settings persist after reactivation. Wizard does not reappear. |