import React, { useState } from 'react';
import { AssistanceRequest } from '../../types';
import { Check, Star, ThumbsUp, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  request: AssistanceRequest | null;
  onSubmit: (rating: number, review: string) => void;
  onSkip: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  request,
  onSubmit,
  onSkip,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen || !request) return null;

  const quickTags = [
    'Fast Arrival',
    'Polite & Professional',
    'Expert Diagnostics',
    'Fair Pricing',
    'Clean Work',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagText = selectedTags.length ? `[${selectedTags.join(', ')}] ` : '';
    onSubmit(rating, `${tagText}${review}`.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        id="service-rating-modal"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp text-center"
      >
        {/* Header */}
        <div className="bg-[#0B1F4B] p-6 text-white relative">
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-3 right-3 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-[#00C2FF] uppercase block">
            Rate Your Assistance Experience
          </span>
          <h3 className="text-xl font-bold font-heading mt-1">HOW WAS YOUR SERVICE?</h3>
          <p className="text-xs text-slate-300 mt-1">
            With {request.mechanicShopName} ({request.mechanicOwnerName})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Interactive Star Selection */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled = (hoverRating || rating) >= starVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-700">
            {rating === 5 && 'Outstanding service! Saved the day.'}
            {rating === 4 && 'Great service, quick and reliable.'}
            {rating === 3 && 'Average experience, got the job done.'}
            {rating === 2 && 'Below expectations.'}
            {rating === 1 && 'Unsatisfactory experience.'}
          </div>

          {/* Quick compliment tags */}
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-slate-500 uppercase block text-center">
              What went well?
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-[#0B1F4B] text-[#00C2FF] border-[#0B1F4B] font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Textbox */}
          <div>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write an optional review for the mechanic community..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF] placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onSkip}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              SKIP
            </button>
            <button
              type="submit"
              id="submit-rating-btn"
              className="py-2.5 px-4 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span>SUBMIT RATING</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
