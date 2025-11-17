import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Photo } from '../types/photo';
import { usePhotoContext } from '../contexts/PhotoContext';
import { IMAGE_DIMENSIONS } from '../constants/images';
import { COLORS } from '../constants/colors';

const PhotoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getFromCache, addToCache } = usePhotoContext();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id) return;
      
      const cachedPhoto = getFromCache(id);
      if (cachedPhoto) {
        setPhoto(cachedPhoto);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://picsum.photos/id/${id}/info`);
        if (!res.ok) throw new Error('Photo not found');
        const data: Photo = await res.json();
        setPhoto(data);
        addToCache(id, data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id, getFromCache, addToCache]);

  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/60 z-50">
      <span className="inline-block w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
      <span className="mt-3 text-gray-700 font-medium text-lg animate-pulse">Loading...</span>
    </div>
  );
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
  if (!photo) return null;

  const title = 'A Moment Captured';
  const description = 'A beautiful photo from the Lorem Picsum collection, perfect for inspiration, design, or simply to enjoy the art of photography.';

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: COLORS.DETAIL_BG }}>
      <div className="w-full bg-white shadow p-8">
        <Link
          to="/photos"
          className="mb-6 inline-block text-black font-medium text-lg rounded px-4 py-3 shadow-sm rounded-lg"
          style={{ background: COLORS.HEADER_BG }}
        >
          &larr; Back to Gallery
        </Link>
        <div
          className="w-full mt-6 mb-10 bg-white flex items-center justify-center relative"
          style={{
            aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4/3',
            maxHeight: IMAGE_DIMENSIONS.DETAIL_MAX_HEIGHT,
            minHeight: '200px',
            overflow: 'hidden',
          }}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <span className="inline-block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            </div>
          )}
          <img
            src={photo.download_url}
            alt={photo.author}
            className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ maxHeight: IMAGE_DIMENSIONS.DETAIL_MAX_HEIGHT }}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-left w-full">{title}</h2>
        <div className="mb-6 w-full text-left">
          <span className="text-gray-700 text-lg">{description}</span>
        </div>
        <div className="flex items-center gap-3 mb-2 w-full">
          <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold uppercase">
            {photo.author ? photo.author[0] : '?'}
          </div>
          <span className="font-semibold text-gray-900 text-xl">{photo.author}</span>
        </div>
        <hr className="border-t border-gray-200 my-6" />
        <div className="flex flex-row gap-8 my-4">
          <div>
            <div className="text-gray-700 font-semibold text-lg">Photo ID</div>
            <div className="text-gray-800 text-base">{photo.id}</div>
          </div>
          <div>
            <div className="text-gray-700 font-semibold text-lg">Dimensions</div>
            <div className="text-gray-800 text-base">{photo.width && photo.height ? `${photo.width} x ${photo.height}` : 'Unknown'}</div>
          </div>
        </div>
        <div className="w-full flex justify-start mb-2">
          <a href={photo.download_url} target="_blank" rel="noopener noreferrer" className="text-white bg-blue-700 px-3 py-2 rounded-xl shadow hover:bg-blue-900 transition text-base">Download Photo</a>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
