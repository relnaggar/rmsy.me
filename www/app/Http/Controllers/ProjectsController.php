<?php

namespace App\Http\Controllers;

use App\Services\ProjectsService;
use Illuminate\View\View;

class ProjectsController extends Controller
{
    public function __construct(
        private ProjectsService $projectsService,
    ) {}

    public function index(): View
    {
        $projects = $this->projectsService->getProjects();

        $preloadImages = array_slice(
            array_map(fn ($project) => $project->thumbnail, $projects),
            0,
            2,
        );

        return view('projects.index', [
            'projects' => $projects,
            'preloadImages' => $preloadImages,
        ]);
    }

    public function show(string $slug): View
    {
        $project = $this->projectsService->getProject($slug);

        if (! $project) {
            abort(404);
        }

        $sections = $project->getSections();
        foreach ($sections as $section) {
            $viewName = "projects.{$project->slug}.{$section->id}";
            if (view()->exists($viewName)) {
                $section->setHtmlContent(view($viewName, [
                    'sources' => $project->sources,
                ])->render());
            }
        }

        return view('projects.show', [
            'project' => $project,
            'sections' => $sections,
            'onThisPage' => $sections,
            'preloadImage' => $project->preloadImage,
        ]);
    }
}
