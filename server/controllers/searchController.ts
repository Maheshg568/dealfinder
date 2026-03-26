import { Request, Response } from 'express';
import { scrapeAmazon, getMockAmazonData } from '../scrapers/amazon';
import { scrapeFlipkart, getMockFlipkartData } from '../scrapers/flipkart';

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const offline = req.query.offline === 'true';

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let allResults = [];

    if (offline) {
      // Use mock data immediately
      const amazonResults = getMockAmazonData(query);
      const flipkartResults = getMockFlipkartData(query);
      allResults = [...amazonResults, ...flipkartResults];
    } else {
      // Run scrapers in parallel
      const [amazonResults, flipkartResults] = await Promise.all([
        scrapeAmazon(query),
        scrapeFlipkart(query),
      ]);
      allResults = [...amazonResults, ...flipkartResults];
    }

    // Sort by price (low to high)
    allResults.sort((a, b) => a.price - b.price);

    res.json(allResults);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
};
