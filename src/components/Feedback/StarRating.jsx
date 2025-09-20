// src/components/Feedback/StarRating.jsx
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ rating, setRating, isEditable = true }) {
    const [hover, setHover] = useState(null);

    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => isEditable && setRating(ratingValue)}
                            className="hidden"
                        />
                        <FaStar
                            size={24}
                            onMouseEnter={() => isEditable && setHover(ratingValue)}
                            onMouseLeave={() => isEditable && setHover(null)}
                            className={`cursor-pointer transition-colors ${
                                ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        />
                    </label>
                );
            })}
        </div>
    );
}