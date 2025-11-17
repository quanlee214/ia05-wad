import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Photo } from '../types/photo';

interface PhotoContextType {
  photos: Photo[];
  setPhotos: (photos: Photo[] | ((prev: Photo[]) => Photo[])) => void;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
  photoCache: Map<string, Photo>;
  addToCache: (id: string, photo: Photo) => void;
  getFromCache: (id: string) => Photo | undefined;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [photoCache, setPhotoCache] = useState<Map<string, Photo>>(new Map());

  const addToCache = useCallback((id: string, photo: Photo) => {
    setPhotoCache((prev) => new Map(prev).set(id, photo));
  }, []);

  const getFromCache = useCallback((id: string) => {
    return photoCache.get(id);
  }, [photoCache]);

  return (
    <PhotoContext.Provider
      value={{
        photos,
        setPhotos,
        page,
        setPage,
        hasMore,
        setHasMore,
        scrollPosition,
        setScrollPosition,
        photoCache,
        addToCache,
        getFromCache,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotoContext = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotoContext must be used within PhotoProvider');
  }
  return context;
};
