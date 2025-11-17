import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PhotoCard from './PhotoCard';
import type { Photo } from '../types/photo';
import { usePhotoContext } from '../contexts/PhotoContext';
import { PAGE_SIZE } from '../constants/images';

const PhotoGrid: React.FC = () => {
	const { photos, setPhotos, page, setPage, hasMore, setHasMore, scrollPosition, setScrollPosition } = usePhotoContext();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [initialLoaded, setInitialLoaded] = useState(photos.length > 0);
	const loader = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (photos.length > 0) return;
		(async () => {
			try {
				const res = await fetch(`https://picsum.photos/v2/list?page=1&limit=${PAGE_SIZE}`);
				if (!res.ok) throw new Error('Failed to fetch photos');
				const data: Photo[] = await res.json();
				setPhotos(data);
				setHasMore(data.length === PAGE_SIZE);
			} catch (err: any) {
				setError(err.message || 'Unknown error');
			} finally {
				setInitialLoaded(true);
			}
		})();
	}, [photos.length, setPhotos, setHasMore]);

	useEffect(() => {
		if (page === 1 || !initialLoaded) return;
		const fetchMore = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${PAGE_SIZE}`);
				if (!res.ok) throw new Error('Failed to fetch photos');
				const data: Photo[] = await res.json();
				setPhotos((prev) => {
					const existingIds = new Set(prev.map((p) => p.id));
					const newPhotos = data.filter((photo) => !existingIds.has(photo.id));
					return [...prev, ...newPhotos];
				});
				setHasMore(data.length === PAGE_SIZE);
			} catch (err: any) {
				setError(err.message || 'Unknown error');
			} finally {
				setLoading(false);
			}
		};
		fetchMore();
	}, [page, initialLoaded, setPhotos, setHasMore]);

	useEffect(() => {
		if (scrollPosition > 0 && photos.length > 0) {
			window.scrollTo(0, scrollPosition);
		}
	}, [scrollPosition, photos.length]);

	useEffect(() => {
		const handleScroll = () => {
			setScrollPosition(window.scrollY);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [setScrollPosition]);

	useEffect(() => {
		if (!hasMore || loading) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setPage((prev) => prev + 1);
				}
			},
			{ threshold: 1 }
		);
		const currentLoader = loader.current;
		if (currentLoader) observer.observe(currentLoader);
		return () => {
			if (currentLoader) observer.unobserve(currentLoader);
		};
	}, [hasMore, loading, setPage]);


		return (
			<div className="min-h-screen bg-white pb-12 animate-gradient-x">
				<Header />
				<div className="w-full px-5">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
						{photos.map((photo) => (
							<div className="transition-transform duration-300 hover:scale-105" key={photo.id}>
								<PhotoCard photo={photo} onClick={() => navigate(`/photos/${photo.id}`)} />
							</div>
						))}
					</div>
					{error && <div className="text-red-500 mt-8 text-center font-semibold text-lg shadow rounded-lg bg-white/80 py-2 px-4">{error}</div>}
					{loading && page > 1 && (
						<div className="flex flex-col items-center mt-8">
							<span className="inline-block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
							<span className="mt-3 text-blue-500 font-semibold text-lg animate-pulse">Loading...</span>
						</div>
					)}
					{!hasMore && !loading && (
						<div className="text-center text-gray-500 mt-8 font-medium text-lg">No more photos to load.</div>
					)}
					<div ref={loader} />
				</div>
			</div>
		);
	};

	export default PhotoGrid;

