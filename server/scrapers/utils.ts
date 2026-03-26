import axios from 'axios';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

export async function fetchHtmlWithFallback(url: string): Promise<string> {
  let lastError: any = null;

  // Strategy 1: Direct fetch with rotating User-Agents and standard headers
  for (const ua of USER_AGENTS) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 8000,
      });

      if (isValidHtml(data, url)) {
        return data;
      }
    } catch (error) {
      lastError = error;
    }
  }

  // Strategy 2: Use AllOrigins proxy as a fallback to bypass IP blocks
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&t=${Date.now()}`;
    const { data } = await axios.get(proxyUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': USER_AGENTS[0]
      }
    });

    if (isValidHtml(data, url)) {
      return data;
    }
  } catch (error) {
    lastError = error;
  }

  // Strategy 3: Use corsproxy.io as another fallback
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const { data } = await axios.get(proxyUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': USER_AGENTS[0]
      }
    });

    if (isValidHtml(data, url)) {
      return data;
    }
  } catch (error) {
    lastError = error;
  }

  throw new Error(`Failed to fetch HTML after multiple strategies. Last error: ${lastError?.message || 'Blocked'}`);
}

function isValidHtml(html: string, url: string): boolean {
  if (!html || typeof html !== 'string') return false;
  
  const lowerHtml = html.toLowerCase();
  
  // Check for common bot protection / CAPTCHA pages
  if (url.includes('amazon')) {
    if (lowerHtml.includes('api-services-support@amazon.com') || 
        lowerHtml.includes('type the characters you see in this image') ||
        lowerHtml.includes('enter the characters you see below')) {
      return false;
    }
  }
  
  if (url.includes('flipkart')) {
    if (lowerHtml.includes('verify you are a human') || 
        lowerHtml.includes('automated access') ||
        lowerHtml.includes('block-page')) {
      return false;
    }
  }

  return true;
}
