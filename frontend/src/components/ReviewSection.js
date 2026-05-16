import React, { useState, useEffect } from 'react'; // Make sure useState is back in here!
import { supabase } from '../supabaseClient';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [hover, setHover] = useState(0); 
  const [rating, setRating] = useState(0); 
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

 const fetchReviews = async () => {
  if (!productId) return;

  // We add .order to show the newest reviews at the top
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId) 
    .order('id', { ascending: false });
  
  if (error) {
    console.error("Fetch Error:", error.message);
  } else {
    console.log("Fetched Reviews:", data); // Check your browser console to see if data arrives
    setReviews(data || []);
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (rating === 0) return; // Silently stop if no rating is selected

  const { error } = await supabase
    .from('reviews')
    .insert([{ 
      product_id: productId, 
      user_name: name, 
      rating: rating, 
      comment: comment 
    }]);

  if (!error) {
    // 1. Clear the form fields
    setName('');
    setComment('');
    setRating(0);
    
    // 2. Fetch fresh data immediately so the new review appears below
    await fetchReviews(); 

    // NOTE: Removed the alert() from here so the user isn't interrupted
  } else {
    console.error("Supabase Error:", error.message);
    // You might want to keep an alert for errors just for debugging, 
    // but for users, a quiet console log is smoother
  }
};
  return (
    <div className="mt-12 border-t pt-8 text-left">
      <h3 className="text-2xl font-black uppercase mb-6 italic">Customer <span className="text-mams-orange">Vibes</span></h3>
      
      <form onSubmit={handleSubmit} className="mb-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 mb-6 items-start md:items-center">
          <input 
            required 
            className="flex-1 p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-mams-orange outline-none font-bold" 
            placeholder="Your Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          
          {/* PROFESSIONAL STAR RATING UI */}
          <div className="flex gap-1 bg-gray-50 p-2 rounded-xl border">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-3xl transition-all duration-200 transform hover:scale-110 outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <span className={`${(hover || rating) >= star ? 'text-mams-orange' : 'text-gray-300'}`}>
                  {(hover || rating) >= star ? '★' : '☆'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <textarea 
          required 
          className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-mams-orange outline-none font-bold mb-4" 
          placeholder="What's the vibe of this fabric?" 
          rows="3" 
          value={comment} 
          onChange={(e) => setComment(e.target.value)} 
        />
        
        <button type="submit" className="bg-mams-dark text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-mams-orange transition shadow-lg active:scale-95">
          Post Review
        </button>
      </form>

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-400 font-bold italic">No reviews yet. Be the first to hype this drop!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black uppercase text-sm tracking-tighter">{r.user_name}</span>
                <span className="text-mams-orange">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
              </div>
              <p className="text-gray-600 font-bold text-sm leading-relaxed">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;