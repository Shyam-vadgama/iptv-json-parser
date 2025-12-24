const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SOURCES_FILE = path.join(DATA_DIR, 'sources.csv');

function getSourceUrls() {
  if (!fs.existsSync(SOURCES_FILE)) {
    console.warn('sources.csv not found, returning empty list.');
    return [];
  }
  
  try {
    const content = fs.readFileSync(SOURCES_FILE, 'utf-8');
    const lines = content.split('\n');
    const urls = [];
    
    // Skip header row if it exists and looks like 'url'
    let startIndex = 0;
    if (lines.length > 0 && lines[0].trim().toLowerCase() === 'url') {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) {
        urls.push(line);
      }
    }
    return urls;
  } catch (error) {
    console.error('Error reading sources.csv:', error);
    return [];
  }
}

async function fetchPlaylist(url) {
  console.log(`Fetching playlist from: ${url}`);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) }); // 10s timeout
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    return await response.text();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
}

function parseM3U(content) {
  if (!content) return [];
  // Basic check if it looks like M3U
  if (!content.includes('#EXTM3U') && !content.includes('#EXTINF')) {
     // Some simple lists might just be URLs, but strict M3U requires header usually. 
     // We'll be lenient and check for lines looking like URLs if no header.
  }

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
      if (currentChannel && currentChannel.name) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = {}; // Reset, but keep object structure implicitly for next
      }
    }
  }
  return channels;
}

function processData(channels) {
  console.log(`Processing ${channels.length} total channels...`);

  // Deduplicate by URL
  const uniqueChannels = [];
  const urlSet = new Set();
  
  for (const channel of channels) {
      if (channel.url && !urlSet.has(channel.url)) {
          urlSet.add(channel.url);
          uniqueChannels.push(channel);
      }
  }

  console.log(`Unique channels after deduplication: ${uniqueChannels.length}`);

  // 1. Categories List
  const categories = [...new Set(uniqueChannels.map(c => c.category).filter(Boolean))].sort();

  // 2. Simplified Streams (lighter payload)
  const streams = uniqueChannels.map(c => ({
    n: c.name,
    u: c.url,
    c: c.category,
    l: c.logo
  }));

  return { channels: uniqueChannels, categories, streams };
}

async function main() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Determine URLs to use
    // If a command line argument is provided, use that. Otherwise read from CSV.
    const customUrl = process.argv[2];
    let targetUrls = [];

    if (customUrl) {
      targetUrls = [customUrl];
    } else {
      targetUrls = getSourceUrls();
    }

    console.log(`Starting fetch for ${targetUrls.length} source(s)...`);

    let allChannels = [];

    for (const url of targetUrls) {
        const rawM3U = await fetchPlaylist(url);
        if (rawM3U) {
            const channels = parseM3U(rawM3U);
            console.log(`Parsed ${channels.length} channels from ${url}`);
            allChannels = allChannels.concat(channels);
        }
    }

    if (allChannels.length === 0) {
        console.warn('No channels found from any source.');
    }

    const { channels, categories, streams } = processData(allChannels);

    // Write Files
    console.log('Writing files...');
    fs.writeFileSync(path.join(DATA_DIR, 'channels.json'), JSON.stringify(channels, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'streams.min.json'), JSON.stringify(streams));

    console.log('Done!');
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
}

main();