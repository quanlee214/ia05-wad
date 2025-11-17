import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import type { Photo } from '../types/photo';
import { IMAGE_DIMENSIONS } from '../constants/images';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="relative group bg-white shadow-lg hover:shadow-2xl cursor-pointer overflow-hidden transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col"
      onClick={onClick}
      style={{ aspectRatio: IMAGE_DIMENSIONS.CARD_ASPECT_RATIO }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="flex-4 flex-shrink-0 h-4/5 relative">
        <img
          src={`https://picsum.photos/id/${photo.id}/${IMAGE_DIMENSIONS.THUMBNAIL_WIDTH}/${IMAGE_DIMENSIONS.THUMBNAIL_HEIGHT}`}
          alt={photo.author}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <Eye className="h-12 w-12 text-white drop-shadow-lg" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
      </div>
      <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 px-4 py-1 z-20 bg-white/90 shadow-md h-1/5">
        <span className="text-gray-900 text-lg truncate" title={photo.author}>{photo.author}</span>
        <span className="text-gray-900 text-lg rounded-2xl bg-gray-200 px-3 py-0.5 ml-2 border border-gray-200">#{photo.id}</span>
      </div>
    </div>
  );
};

export default PhotoCard;
