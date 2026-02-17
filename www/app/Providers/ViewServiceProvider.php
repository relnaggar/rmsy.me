<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\NavService;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ViewServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(NavService::class);
    }

    public function boot(): void
    {
        View::composer('*', function ($view) {
            $navService = app(NavService::class);
            $currentUrl = request()->url();

            $view->with('menuNav', $navService->getNavForPath($currentUrl));
            $view->with('sidebarNav', $navService->getSidebarNav($currentUrl));
        });
    }
}
