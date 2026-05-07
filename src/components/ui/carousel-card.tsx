"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardData {
  id: number;
  imgUrl: string;
  title: string;
  price: string;
  location: string;
}

interface CardProps {
  data: CardData[];
  cardsPerView?: number;
}

const CarouselCard = ({ data, cardsPerView = 4 }: CardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    if (isAnimating || data.length <= cardsPerView) return;
    setIsAnimating(true);
    const nextIndex = (currentIndex + 1) % data.length;
    const el = containerRef.current;
    if (!el) return;

    el.style.transition = "transform 500ms ease";
    el.style.transform = `translateX(-${100 / cardsPerView}%)`;

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      el.style.transition = "none";
      el.style.transform = "translateX(0)";
      void el.offsetWidth;
      setIsAnimating(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isAnimating || data.length <= cardsPerView) return;
    setIsAnimating(true);
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const el = containerRef.current;
    if (!el) return;

    el.style.transition = "none";
    el.style.transform = `translateX(-${100 / cardsPerView}%)`;
    setCurrentIndex(prevIndex);
    void el.offsetWidth;
    el.style.transition = "transform 500ms ease";
    el.style.transform = "translateX(0)";

    setTimeout(() => setIsAnimating(false), 500);
  };

  const getVisibleCards = () => {
    const visible = [];
    for (let i = 0; i < cardsPerView + 1; i++) {
      visible.push(data[(currentIndex + i) % data.length]);
    }
    return visible;
  };

  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No items available</div>;
  }

  return (
    <div className="relative w-full">
      {data.length > cardsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={isAnimating}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isAnimating}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div className="overflow-hidden mx-2">
        <div
          ref={containerRef}
          className="flex"
          style={{
            width: `${((cardsPerView + 1) * 100) / cardsPerView}%`,
          }}
        >
          {getVisibleCards().map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              style={{ width: `${100 / (cardsPerView + 1)}%` }}
              className="px-2"
            >
              <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={card.imgUrl}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{card.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{card.location}</p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{card.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
