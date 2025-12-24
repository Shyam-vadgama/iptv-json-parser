const fs = require('fs');
const path = require('path');

// Default list of M3U URLs
const DEFAULT_M3U_URLS = [
  // Main URLs (Country & Language)
  'https://iptv-org.github.io/iptv/index.country.m3u',
  'https://iptv-org.github.io/iptv/index.language.m3u',
  
  // General & Specific Categories
  'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
  'https://apsattv.com/ssungusa.m3u',
  'https://tvpass.org/playlist/m3u',
  'https://epghub.xyz/', // Note: Might be a website, kept per request
  'https://www.apsattv.com/xumo.m3u',
  'https://www.apsattv.com/localnow.m3u',
  'https://www.apsattv.com/lg.m3u',
  'https://www.apsattv.com/rok.m3u',
  'https://www.apsattv.com/redbox.m3u',
  'https://www.apsattv.com/distro.m3u',
  'https://www.apsattv.com/xiaomi.m3u',
  'https://www.apsattv.com/tablo.m3u',
  'https://www.apsattv.com/vizio.m3u',

  // Community / Extra Links
  'http://platin4k.eu:80/get.php?username=eagleiptv&password=SsFAljPDDi&type=m3u_plus',
  'http://almanya888.com:8080/get.php?username=ufukucur&password=GAbhqErmuv&type=m3u_plus',
  'http://iptvworld.nl:2095/get.php?username=nlinenodric&password=4sR2SwYYeg&type=m3u_plus',
  'http://4kiptv.pro:15000/get.php?username=5UfQvAtjaR&password=AGbT2dW0xA&type=m3u_plus',
  'http://top.streancdn.fun:80/get.php?username=0987654321&password=1234567890&type=m3u',
  'http://vipiptv101.com:8080/get.php?username=Mustafa.Eken&password=bN29kLc5aS&type=m3u_plus',
  'http://iptv41.com:8080/get.php?username=utkubingol&password=CgvrbSmwxF&type=m3u_plus',
  'http://iptvhogar.club:25461/get.php?username=Orlando_Herrera&password=aQiWECxfFm&type=m3u_plus',
  'http://iptvhogar.club:25461/get.php?username=Yoana_Marin&password=4452053058&type=m3u_plus',
  'http://vipiptv101.com:8080/get.php?username=tahsinsalihli&password=29102019-thsin&type=m3u_plus',
  'http://m3u.iptvott.live:8080/get.php?username=iFnzn9zOnd&password=P4gsG7edtl&type=m3u',
  'http://vipiptv101.com:8080/get.php?username=ersoy.2508&password=seker.2022&type=m3u_plus',
  'http://vipiptv101.com:8080/get.php?username=gencosman&password=020919.cvf&type=m3u_plus',
  'http://saw.duplex-ott.net:2052/get.php?username=802462699227605&password=802446701881523&type=m3u_plus',
  'http://saw.duplex-ott.net:2052/get.php?username=802479429936404&password=802440660870517&type=m3u_plus',
  'http://vipuhdteam.com:8080/get.php?username=pimptv&password=3TL4ezQGmR&type=m3u_plus',
  'http://bptv.me/get.php?username=1702725pau&password=486669&type=m3u',
  'https://cdn.discordapp.com/attachments/739384288256196653/786290789428756510/clip.tv.m3u',
  'http://odenfull.co:2086/get.php?username=NATALY4334&password=20TORRE50s&type=m3u',
  'http://iptvstream.es:8080/get.php?username=julen0003&password=zUHcdLH8om&type=m3u',
  'http://topstb.com:8000/get.php?username=50656250782258&password=27115840859269&type=m3u',
  'http://formagapppppppppppppinturkey.ingiltereozel.com:8080/get.php?username=doganbey&password=doganbey2021&type=m3u',
  'http://cdn.miptv.ws:8880/get.php?username=yztbz&password=cojdzn&type=m3u',
  'http://ologyconnect1081.com:25461/get.php?username=darwin&password=1234&type=m3u',
  'http://ologyconnect1081.com:25461/get.php?username=jess&password=1234&type=m3u',
  'http://ologyconnect1081.com:25461/get.php?username=lloyd&password=1234&type=m3u',
  'http://n2086.securepoint.io:25461/get.php?username=ZudaWKj4eP&password=dQbUQHUZxL&type=m3u',
  'http://platin4k.eu:80/get.php?username=kralkerim&password=8TKLyJivVEA&type=m3u',
  'https://m3u-editor.com:443/get.php?username=kcik4t9z&password=wqwyg39s&type=m3u_plus',
  'http://asterix-iptv.club:25461/get.php?username=esoarene&password=Ct225SCUDn&type=m3u_plus',
  'http://ck40.131221.net:8080//get.php?username=USERRFYFU665&password=IyEwwRZV0A&type=m3u_plus',
  'http://ck40.131221.net:8080//get.php?username=USERFGFTSDTDG&password=GsfITKqhSQ&type=m3u_plus',
  'http://4436c57651ca.iedem.com/playlists/uplist/8ef3adafc12b5a5afd38b58d3f2e1aa9/playlist.m3u8',
  'http://stream.rediptv.tk/get.php?username=AYNqWGV9Ep&password=jvJwqhrf2R&type=m3u',
  'http://ck43.deskanet.com:8080/get.php?username=Redchh4&password=MpoxtLo3sn&type=m3u_plus',
  'http://ck43.deskanet.com:8080/get.php?username=3xfpl6DKgH&password=15BRx4XWkS&type=m3u_plus',
  'http://ipro.tv:80/get.php?username=mWYqJ61c4FI&password=eQbcjzmEIk&type=m3u',
  'http://smart.nicehotone.xyz/get.php?username=iptv011&password=9436589286&type=m3u_plus',
  'http://pprotv.com:80/get.php?username=kalid&password=kalid123&type=m3u',
  'http://gbox.goldeniptv.com:25461/get.php?username=123321&password=123321&type=m3u_plus',
  'http://fortv.cc:8080/get.php?username=jsc&password=jsc&type=m3u',
  'http://red.ipfox.org:8080/get.php?username=Karam2022&password=Karam2023&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1431&password=123456&type=m3u',
  'http://fortv.cc:8080/get.php?username=carls&password=1234&type=m3u_plus',
  'http://chimeratv.live:25461/get.php?username=amaxmovies88&password=tHubsYGxeH&type=m3u',
  'http://168.205.87.198:8555/get.php?username=5803&password=123456&type=m3u',
  'http://c.proserver.in:8080/get.php?username=vodstest&password=lw5p6ojDQq&type=m3u',
  'http://163.172.33.7:25461/get.php?username=serveramsterdam&password=2292020&type=m3u',
  'http://ccdn.so/get.php?username=vsabG&password=499AKVptc&type=m3u',
  'http://misket.tv:2020/get.php?username=anka-icin-test&password=fhoPny6SRC&type=m3u',
  'http://pablotv.us:8080/get.php?username=Abdo22&password=12341234&type=m3u_plus',
  'http://cineapp.org:8000/get.php?username=Fernando&password=Fernando&type=m3u_plus',
  'http://mains.services:2086/get.php?username=A.Jones01&password=1904550&type=m3u_plus',
  'http://tr.rchtv.com:8080/get.php?username=aslan11&password=aslan22&type=m3u_plus',
  'http://cdn.globalserver.me:8080/get.php?username=399977&password=528931&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1041&password=123456&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1057&password=123456&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1113&password=123456&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1120&password=123456&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1124&password=123456&type=m3u',
  'http://168.205.87.198:8555/get.php?username=1129&password=123456&type=m3u',
  'http://streamgo.vip:8008/get.php?username=ISABEL&password=isabel&type=m3u_plus',
  'http://live.vipserver.com.ua:80/get.php?username=ziabekibremen&password=XOfLF1tALD&type=m3u',
  'http://tuercatv2021.dynns.com:8080/get.php?username=Iptvr2022d&password=abono&type=m3u',
  'http://streamgo.vip:8008/get.php?username=User&password=user&type=m3u_plus',
  'http://portal.geniptv.com:8080/get.php?username=tolgax1x&password=JNKsdsadsa1a&type=m3u',
  'http://rctv.tech/get.php?username=EbhTbZp8Zudg&password=kQyPeRtp2jRM&type=m3u',
  'http://www.tvxclnt.com:8080/get.php?username=tretvx2022&password=QP3J8nmeTvIZp82J&type=m3u',
  'http://4k.dragonprox.live:8080/get.php?username=MYSLwbpJfB&password=WMd2PAF8Qw&type=m3u&output=mpegts',
  'http://dns.clientetv.net:8080/get.php?username=Leeoofranca&password=VSk5nNXn72xq&type=m3u',
  'http://ghewp.com/get.php?username=0077018667&password=8040849602&type=m3u',
  'http://saw.duplex-ott.net:2052/get.php?username=009727523905&password=169677264921&type=m3u_plus',
  'http://restream.skyhd-iptv.com:25461/get.php?username=8AWxutmEyj&password=dAKnp5memU&type=m3u',
  'http://saw.duplex-ott.net:2052/get.php?username=001465520525&password=001465520525&type=m3u_plus',
  'http://ghewp.com/get.php?username=70587697500732&password=18736851093397&type=m3u',
  'http://31.14.41.118:8080/get.php?username=TViBOXRU&password=DbTVQJpf1z&type=m3u'
];

const DATA_DIR = path.join(__dirname, '../data');

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
    // If a command line argument is provided, use that. Otherwise use the default list.
    const customUrl = process.argv[2];
    const targetUrls = customUrl ? [customUrl] : DEFAULT_M3U_URLS;

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