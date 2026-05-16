import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <span className="bg-[#ff4d4d] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">-33%</span>
          <span className="bg-[#10b981] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">New</span>
        </div>

        {/* Wishlist Icon */}
        <button className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-mams-orange hover:text-white transition-colors">
          <HeartIcon className="h-4 w-4" />
        </button>

        <img 
          src={product.image_url} 
          // FIXED: We now pass this specific product as a single-item array, and use its exact price!
          onClick={() => navigate('/payment', { 
            state: { 
              items: [{ ...product, quantity: 1 }], 
              total: product.price 
            } 
          })}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer" 
          alt={product.name} 
        />
      </div>

      {/* Details Container */}
      <div className="p-5 text-left">
        <h3 className="text-sm font-bold text-gray-700 line-clamp-1 mb-2 group-hover:text-mams-orange transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-mams-orange font-black text-lg">Rs. {product.price}.00</span>
          <span className="text-gray-400 text-xs line-through font-medium">Rs. 1,499.00</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;