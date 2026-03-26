import { ExternalLink, ShoppingCart, Tag } from 'lucide-react';
import { ProductResult } from '../../server/scrapers/amazon';

interface ProductCardProps {
  key?: string | number;
  product: ProductResult;
  isCheapest: boolean;
}

export function ProductCard({ product, isCheapest }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSiteColor = (site: string) => {
    switch (site.toLowerCase()) {
      case 'amazon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'flipkart':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className={`relative flex flex-col md:flex-row bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md ${
        isCheapest ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200'
      }`}
    >
      {isCheapest && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center">
          <Tag className="w-3 h-3 mr-1" />
          Best Price
        </div>
      )}

      <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center mb-4 md:mb-0 md:mr-6">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="object-contain w-full h-full p-2"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ShoppingCart className="w-12 h-12 text-gray-300" />
        )}
      </div>

      <div className="flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getSiteColor(
                product.site
              )}`}
            >
              {product.site}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-2">
            {product.title}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-500 mb-1">Current Price</p>
            <p className={`text-2xl font-bold ${isCheapest ? 'text-green-600' : 'text-gray-900'}`}>
              {formatPrice(product.price)}
            </p>
          </div>

          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            View Deal
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
