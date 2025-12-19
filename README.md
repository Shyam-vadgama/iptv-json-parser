# Open Source IPTV Backend

This repository hosts a self-updating backend for an IPTV application. It automatically parses public M3U playlists and converts them into optimized JSON APIs hosted on GitHub Pages.

## Features

- **Automated Updates:** Runs daily via GitHub Actions.
- **Optimized JSON:** Provides both full detailed JSON and minified versions.
- **Free Hosting:** Served via GitHub Pages (CDN).
- **Categorized:** Data is grouped by categories.

## API Endpoints

Once deployed to GitHub Pages, the following endpoints will be available:

- **Base URL:** `https://<your-username>.github.io/<repo-name>/`

| Endpoint | Description |
| :--- | :--- |
| `/channels.json` | Full list of channels with all metadata. |
| `/categories.json` | List of unique channel categories. |
| `/streams.min.json` | Minified list (Name, URL, Category, Logo) for fast loading. |

## JSON Schema

### Channel Object (`channels.json`)

```json
{
  "name": "Channel Name",
  "logo": "https://example.com/logo.png",
  "url": "http://stream-url.com/playlist.m3u8",
  "category": "News",
  "tvg": {
    "id": "channel-id",
    "name": "TVG Name"
  }
}
```

### Minified Object (`streams.min.json`)

To save bandwidth, keys are shortened:

- `n`: Name
- `u`: URL
- `c`: Category
- `l`: Logo

```json
{
  "n": "Channel Name",
  "u": "http://stream-url.com/playlist.m3u8",
  "c": "News",
  "l": "https://example.com/logo.png"
}
```

## Setup

1. Fork this repository.
2. Enable GitHub Actions in the "Actions" tab.
3. Go to "Settings" > "Pages".
4. Under "Build and deployment", set "Source" to "Deploy from a branch".
5. **After the first Action run**, select the `gh-pages` branch.

## Development

To run the parser locally:

```bash
npm install
node src/parser.js
```

Check the `data/` folder for output.
