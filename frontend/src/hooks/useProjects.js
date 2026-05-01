import { useState, useEffect, useCallback, useRef } from 'react';
import api from './useApi';

// ── Module-level in-memory cache ──────────────────────────────────────────────
// Survives component re-mounts and prevents double-fetching when navigating
// between pages that both need the project list.
const CACHE_TTL_MS = 60 * 1000; // 1 minute
const moduleCache = {
    data: null,
    timestamp: 0,
    promise: null, // deduplicates concurrent fetches
};

function isCacheValid() {
    return moduleCache.data !== null && Date.now() - moduleCache.timestamp < CACHE_TTL_MS;
}

/**
 * useProjects — fetch and cache the projects list at module level.
 *
 * Usage:
 *   const { projects, loading, error, refetch } = useProjects({ status: 'ongoing' });
 */
export function useProjects({ status } = {}) {
    const [projects, setProjects] = useState(isCacheValid() ? moduleCache.data : []);
    const [loading, setLoading] = useState(!isCacheValid());
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const fetchProjects = useCallback(async (force = false) => {
        if (!force && isCacheValid()) {
            setProjects(moduleCache.data);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Deduplicate: if a fetch is already in flight, wait for it
            if (!moduleCache.promise) {
                moduleCache.promise = api.get('/projects').then((r) => {
                    moduleCache.data = r.data;
                    moduleCache.timestamp = Date.now();
                    moduleCache.promise = null;
                    return r.data;
                }).catch((err) => {
                    moduleCache.promise = null;
                    throw err;
                });
            }

            const data = await moduleCache.promise;
            if (mountedRef.current) setProjects(data);
        } catch (err) {
            if (mountedRef.current) {
                setError(err.response?.data?.message || 'Failed to load projects');
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchProjects();
        return () => { mountedRef.current = false; };
    }, [fetchProjects]);

    // Apply status filter locally — no extra API call needed
    const filtered = status
        ? projects.filter((p) => p.status === status)
        : projects;

    return {
        projects: filtered,
        allProjects: projects,
        loading,
        error,
        refetch: () => fetchProjects(true), // force bypasses cache
    };
}

/**
 * Manually clear the module-level cache (call after admin creates/updates a project).
 */
export function clearProjectsCache() {
    moduleCache.data = null;
    moduleCache.timestamp = 0;
}
