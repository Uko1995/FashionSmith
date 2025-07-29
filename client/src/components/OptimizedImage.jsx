import { useState, useRef, useEffect } from "react";

const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  lazy = true,
  placeholder = "blur",
  quality = 80,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Generate responsive image URLs
  const getOptimizedSrc = (originalSrc, targetWidth) => {
    // If it's a local image, use it as-is (you can add your own optimization logic)
    if (originalSrc.startsWith("/") || originalSrc.startsWith("./")) {
      return originalSrc;
    }

    // For external images (like Unsplash), add optimization parameters
    if (originalSrc.includes("unsplash.com")) {
      const url = new URL(originalSrc);
      url.searchParams.set("w", targetWidth);
      url.searchParams.set("q", quality);
      url.searchParams.set("fm", "webp");
      url.searchParams.set("fit", "crop");
      if (height) url.searchParams.set("h", height);
      return url.toString();
    }

    return originalSrc;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!src) return "";

    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .map((size) => `${getOptimizedSrc(src, size)} ${size}w`)
      .join(", ");
  };

  // Placeholder component
  const Placeholder = () => (
    <div
      className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
      aria-label="Loading image..."
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  // Error component
  const ErrorPlaceholder = () => (
    <div
      className={`bg-gray-100 border border-gray-300 flex items-center justify-center ${className}`}
      style={{ width, height }}
      aria-label="Image failed to load"
    >
      <span className="text-gray-500 text-sm">Image unavailable</span>
    </div>
  );

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) {
    return <ErrorPlaceholder />;
  }

  return (
    <div ref={imgRef} className="relative">
      {/* Show placeholder while loading */}
      {!isLoaded && placeholder && <Placeholder />}

      {/* Actual image */}
      {isInView && (
        <img
          src={getOptimizedSrc(src, width)}
          srcSet={generateSrcSet()}
          sizes={`(max-width: 768px) 100vw, (max-width: 1024px) 50vw, ${
            width || "33vw"
          }`}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${
            !isLoaded ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
          loading={lazy ? "lazy" : "eager"}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
