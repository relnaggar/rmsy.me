<?php

if (!function_exists('media')) {
    /**
     * Generate a URL for a media asset.
     */
    function media(string $path = ''): string
    {
        $baseUrl = rtrim(config('app.media_url', ''), '/');

        if ($path === '') {
            return $baseUrl;
        }

        return $baseUrl . '/' . ltrim($path, '/');
    }
}
