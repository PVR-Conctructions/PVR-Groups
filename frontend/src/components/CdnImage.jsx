import React, { useState } from 'react';

const FALLBACK = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=60';

/**
 * CdnImage — drop-in <img> replacement for Bunny CDN images.
 *
 * Features:
 *  - loading="lazy" by default (eager for above-the-fold via prop)
 *  - decoding="async" always
 *  - Graceful fallback on error
 *  - Fade-in on load
 *  - Accepts all standard <img> props
 *
 * Usage:
 *   <CdnImage src={project.images[0]} alt="project" className="w-full h-48 object-cover" />
 */
const CdnImage = ({
    src,
    alt = '',
    className = '',
    loading = 'lazy',
    priority = false,
    fallback = FALLBACK,
    onLoad,
    onError,
    style = {},
    ...rest
}) => {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    const imgSrc = errored ? fallback : (src || fallback);
    const loadAttr = priority ? 'eager' : loading;

    return (
        <img
            src={imgSrc}
            alt={alt}
            loading={loadAttr}
            decoding="async"
            fetchpriority={priority ? 'high' : 'auto'}
            className={className}
            style={{
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
                ...style,
            }}
            onLoad={(e) => {
                setLoaded(true);
                onLoad?.(e);
            }}
            onError={(e) => {
                if (!errored) setErrored(true);
                onError?.(e);
            }}
            draggable={false}
            {...rest}
        />
    );
};

export default CdnImage;
