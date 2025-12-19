const fs = require('fs');
const path = require('path');

const M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';
const DATA_DIR = path.join(__dirname, '../data');

async function fetchPlaylist() {
  console.log('Fetching playlist...');
  const response = await fetch(M3U_URL);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
  return await response.text();
}

function parseM3U(content) {
  console.log('Parsing M3U content...');
  const lines = content.split('\n');
  const channels = [];
  let currentChannel = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Parse metadata
      currentChannel = {
        name: null,
        logo: null,
        url: null,
        category: null,
        languages: [],
        country: null,
        tvg: { id: null, name: null, url: null }
      };

      // Extract properties
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      if (tvgIdMatch) currentChannel.tvg.id = tvgIdMatch[1];

      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      if (tvgNameMatch) currentChannel.tvg.name = tvgNameMatch[1];

      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      if (tvgLogoMatch) currentChannel.logo = tvgLogoMatch[1];

      const groupMatch = line.match(/group-title="([^"]*)"/);
      if (groupMatch) currentChannel.category = groupMatch[1];
      
      // Attempt to extract name (everything after the last comma)
      const nameParts = line.split(',');
      if (nameParts.length > 1) {
        currentChannel.name = nameParts[nameParts.length - 1].trim();
      }
      
    } else if (!line.startsWith('#')) {
      // It's a URL
      if (currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = null; // Reset
      }
    }
  }
  return channels;
}

function processData(channels) {
  console.log(`Processed ${channels.length} channels.`);

  // 1. Categories List
  const categories = [...new Set(channels.map(c => c.category).filter(Boolean))].sort();

  // 2. Simplified Streams (lighter payload)
  const streams = channels.map(c => ({
    n: c.name,
    u: c.url,
    c: c.category,
    l: c.logo
  }));

  return { channels, categories, streams };
}

async function main() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const rawM3U = await fetchPlaylist();
    const channels = parseM3U(rawM3U);
    const { categories, streams } = processData(channels);

    // Write Files
    console.log('Writing files...');
    fs.writeFileSync(path.join(DATA_DIR, 'channels.json'), JSON.stringify(channels, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'streams.min.json'), JSON.stringify(streams));

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
