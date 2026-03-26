/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { Spinner } from './components/Spinner';
import { ProductResult } from '../server/scrapers/amazon';
import { ShoppingBag, AlertCircle, Settings, Sparkles, X, WifiOff, Key } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [apiKey, setApiKey] = useState('AIzaSyDdi1px15fjZf84lbQKXrxuzPD5U_4YGoo');

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);
    setAiRecommendation(null);
    setAiError(null);
    setCurrentQuery(query);

    try {
      const response = await axios.get<ProductResult[]>(`/api/search?q=${encodeURIComponent(query)}&offline=${isOfflineMode}`);
      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch product data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiRecommendation(null);
    setAiError(null);

    try {
      if (!results || results.length === 0) {
        throw new Error('No results to analyze');
      }

      const keyToUse = apiKey.trim() || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        throw new Error('Gemini API key is missing. Please provide one in settings.');
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });

      const prompt = `I searched for "${currentQuery}". Here are the price comparison results across different platforms:
      ${JSON.stringify(results, null, 2)}

      Please analyze these results and tell me which one is the best deal and why. Consider the price difference, the platform, and any potential red flags (like a price being suspiciously low). Give a concise, helpful recommendation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      setAiRecommendation(response.text || 'No recommendation generated.');
    } catch (err: any) {
      console.error('Analyze error:', err);
      setAiError(err.message || 'Failed to analyze results. Check your API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cheapestPrice = results.length > 0 ? Math.min(...results.map((r) => r.price)) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center text-blue-600">
            <ShoppingBag className="w-6 h-6 mr-2" />
            <span className="text-xl font-bold tracking-tight">DealFinder</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </h2>

            <div className="space-y-6">
              {/* Offline Mode Toggle */}
              <div className="flex items-start justify-between">
                <div>
                  <label className="font-medium text-gray-900 flex items-center">
                    <WifiOff className="w-4 h-4 mr-2" />
                    Offline Mode (Mock Data)
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Use mock data instead of live scraping. Useful if scrapers are blocked.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isOfflineMode}
                    onChange={(e) => setIsOfflineMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* API Key Input */}
              <div>
                <label className="font-medium text-gray-900 flex items-center mb-2">
                  <Key className="w-4 h-4 mr-2" />
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AI Studio default key used if empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Required for AI recommendations if the server default key is missing.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Find the best deals across the web
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search once and compare prices from Amazon, Flipkart, and more to make sure you're getting the best price.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Results Area */}
        <div className="mt-8">
          {isLoading && <Spinner />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && !error && hasSearched && results.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search terms or checking for typos.</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-6">
              
              {/* AI Recommendation Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center">
                    <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-bold text-indigo-900">Deal Analysis</h3>
                  </div>
                  {!aiRecommendation && !isAnalyzing && (
                    <button
                      onClick={handleAnalyze}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Analyze Results
                    </button>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="flex items-center text-indigo-600 py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                    <span className="font-medium">Thinking deeply about these deals...</span>
                  </div>
                )}

                {aiError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                    {aiError}
                  </div>
                )}

                {aiRecommendation && (
                  <div className="prose prose-indigo prose-sm max-w-none bg-white/60 p-4 rounded-lg border border-indigo-50">
                    <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Found {results.length} results
                </h2>
                <div className="text-sm text-gray-500">
                  Sorted by price: Low to High
                </div>
              </div>
              
              <div className="grid gap-6">
                {results.map((product, index) => (
                  <ProductCard
                    key={`${product.site}-${index}`}
                    product={product}
                    isCheapest={product.price === cheapestPrice}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
