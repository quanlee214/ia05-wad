import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PhotoCard from './PhotoCard';
import type { Photo } from './PhotoCard';

const PAGE_SIZE = 20;

// Grid view for displaying a paginated, infinite-scroll list of photos
const PhotoGrid: React.FC = () => {
	// State for photos, pagination, loading, error, and infinite scroll
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [initialLoaded, setInitialLoaded] = useState(false);
	const loader = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	// Restore scroll position when returning from detail page
	useEffect(() => {
		const savedScrollPosition = sessionStorage.getItem('photoGridScrollPosition');
		const savedPhotosCount = sessionStorage.getItem('photoGridPhotosCount');
		
		if (savedScrollPosition && initialLoaded && photos.length > 0) {
			// Wait until we have at least the same number of photos as before
			const targetCount = savedPhotosCount ? parseInt(savedPhotosCount) : 0;
			if (photos.length >= targetCount) {
				// Use requestAnimationFrame to ensure DOM is fully rendered
				requestAnimationFrame(() => {
					setTimeout(() => {
						window.scrollTo(0, parseInt(savedScrollPosition));
						sessionStorage.removeItem('photoGridScrollPosition');
						sessionStorage.removeItem('photoGridPhotosCount');
					}, 150);
				});
			}
		}
	}, [initialLoaded, photos.length]);

	// Fetch initial photos only once on mount
	useEffect(() => {
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
	}, []);

	// Fetch more photos when page > 1
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
	}, [page, initialLoaded]);

	// Infinite scroll: load more when loader is visible
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
		if (loader.current) observer.observe(loader.current);
		return () => {
			if (loader.current) observer.unobserve(loader.current);
		};
	}, [hasMore, loading]);


		return (
			<div className="min-h-screen bg-white pb-12 animate-gradient-x">
				<Header />
				<div className="w-full px-5">
					{/* Responsive photo grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
						{photos.map((photo) => (
							<div className="transition-transform duration-300 hover:scale-105" key={photo.id}>
								<PhotoCard 
									photo={photo} 
									onClick={() => {
										// Save scroll position and photos count before navigating
										sessionStorage.setItem('photoGridScrollPosition', window.scrollY.toString());
										sessionStorage.setItem('photoGridPhotosCount', photos.length.toString());
										navigate(`/photos/${photo.id}`);
									}} 
								/>
							</div>
						))}
					</div>
					{/* Error message */}
					{error && <div className="text-red-500 mt-8 text-center font-semibold text-lg shadow rounded-lg bg-white/80 py-2 px-4">{error}</div>}
					{/* Loading spinner: chỉ hiện khi đang load thêm trang, không hiện lần đầu */}
					{loading && page > 1 && (
						<div className="flex flex-col items-center mt-8">
							<span className="inline-block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
							<span className="mt-3 text-blue-500 font-semibold text-lg animate-pulse">Loading...</span>
						</div>
					)}
					{/* No more photos message */}
					{!hasMore && !loading && (
						<div className="text-center text-gray-500 mt-8 font-medium text-lg">No more photos to load.</div>
					)}
					{/* Loader for infinite scroll */}
					<div ref={loader} />
				</div>
			</div>
		);
	};

	export default PhotoGrid;

