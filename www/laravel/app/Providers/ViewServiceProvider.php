<?php

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
            $currentPath = request()->getPathInfo();

            $view->with('menuNav', $navService->getNavForPath($currentPath));
            $view->with('sidebarNav', $navService->getSidebarNav($currentPath));
        });
    }
}
