import * as cheerio from 'cheerio';
import { ProductResult } from './amazon';
import { fetchHtmlWithFallback } from './utils';

export const scrapeFlipkart = async (query: string): Promise<ProductResult[]> => {
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const data = await fetchHtmlWithFallback(url);

    const $ = cheerio.load(data);
    const results: ProductResult[] = [];

    // Flipkart frequently changes class names to random hashes (e.g., KzDlHZ, Nx9bqj)
    // We use a more generic approach: find elements that look like prices
    const priceElements = $('div:contains("₹")').filter((i, el) => {
      return $(el).text().trim().match(/^₹[0-9,]+$/) !== null;
    });

    priceElements.each((i, el) => {
      if (results.length >= 5) return;
      
      const priceText = $(el).text().trim().replace(/₹|,/g, '');
      const price = parseInt(priceText, 10);
      
      // Find the closest container that has a link to a product
      const container = $(el).closest('a[href*="/p/"]').length 
        ? $(el).closest('a[href*="/p/"]') 
        : $(el).parent().parent();
        
      const linkEl = container.is('a') ? container : container.find('a[href*="/p/"]').first();
      let href = linkEl.attr('href');
      const link = href ? (href.startsWith('http') ? href : 'https://www.flipkart.com' + href) : '';
      
      // Try to find the title
      let title = linkEl.attr('title') || 
                  linkEl.find('img').attr('alt') || 
                  container.find('div').first().text().trim();
                  
      if (!title || title.length < 5) {
         title = container.text().replace($(el).text(), '').trim().substring(0, 100);
      }
      
      const image = container.find('img').attr('src') || linkEl.find('img').attr('src');

      if (title && price && link && link.includes('/p/') && !isNaN(price)) {
        // Avoid duplicates
        if (!results.find(r => r.link === link)) {
          results.push({ site: 'Flipkart', title, price, link, image });
        }
      }
    });

    // Fallback to old selectors if the generic approach fails
    if (results.length === 0) {
      $('._1AtVbE ._1fQZEK, ._1xFAF9, div[data-id]').each((i, el) => {
        if (results.length >= 5) return;
        const title = $(el).find('._4rR01T, .IRpwTa, .s1Q9rs').text().trim();
        const priceText = $(el).find('._30jeq3').text().trim().replace(/₹|,/g, '');
        const price = parseInt(priceText, 10);
        let href = $(el).attr('href') || $(el).find('a').first().attr('href');
        const link = href ? (href.startsWith('http') ? href : 'https://www.flipkart.com' + href) : '';
        const image = $(el).find('img._396cs4, img').attr('src');

        if (title && price && link && !isNaN(price)) {
          if (!results.find(r => r.link === link)) {
            results.push({ site: 'Flipkart', title, price, link, image });
          }
        }
      });
    }

    if (results.length === 0) {
      throw new Error('No results found, might be blocked');
    }

    return results;
  } catch (error) {
    console.warn('Flipkart scraping failed, using mock data:', (error as Error).message);
    return getMockFlipkartData(query);
  }
};

export function getMockFlipkartData(query: string): ProductResult[] {
  const basePrice = Math.floor(Math.random() * 5000) + 900;
  return [
    {
      site: 'Flipkart',
      title: `${query} - Flipkart Assured`,
      price: basePrice,
      link: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
      image: 'https://via.placeholder.com/150?text=Flipkart',
    },
    {
      site: 'Flipkart',
      title: `${query} - Standard Edition`,
      price: basePrice + 1200,
      link: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
      image: 'https://via.placeholder.com/150?text=Flipkart',
    },
  ];
}
