<?php

if (! function_exists('formatCurrency')) {
    function formatCurrency(int $amountInCents, string $currency): string
    {
        $formattedAmount = number_format($amountInCents / 100, 2, '.', ',');

        return match ($currency) {
            'GBP' => 'GBP £'.$formattedAmount,
            'EUR' => 'EUR €'.$formattedAmount,
            default => throw new InvalidArgumentException('Unsupported currency: '.$currency),
        };
    }
}

if (! function_exists('penceToPounds')) {
    function penceToPounds(int $pence): string
    {
        return number_format($pence / 100, 2);
    }
}

if (! function_exists('poundsToPence')) {
    function poundsToPence(float $pounds): int
    {
        return (int) round($pounds * 100);
    }
}

if (! function_exists('media')) {
    /**
     * Generate a URL for a media asset.
     */
    function media(string $path = ''): string
    {
        $baseUrl = rtrim(config('app.media_url', ''), '/');

        if ($path === '') {
            return $baseUrl;
        }

        return $baseUrl.'/'.ltrim($path, '/');
    }
}
