<?php

namespace App\Http\Controllers;

use App\Services\ProjectsService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProjectsController extends Controller
{
    public function __construct(
        private ProjectsService $projectsService,
    ) {}

    public function index(): View
    {
        return view('projects.index', [
            'projects' => $this->projectsService->getProjects(),
            'mediaRoot' => '/img',
        ]);
    }

    public function show(string $slug): View
    {
        $project = $this->projectsService->getProject($slug);

        if (! $project) {
            abort(404);
        }

        // Render section content
        $sections = $project->getSections();
        foreach ($sections as $section) {
            $viewName = "projects.{$project->slug}.{$section->id}";
            if (view()->exists($viewName)) {
                $html = view($viewName, ['mediaRoot' => '/img'])->render();
                $section->setHtmlContent($html);
            }
        }

        return view('projects.show', [
            'project' => $project,
            'sections' => $sections,
            'onThisPage' => $sections,
            'mediaRoot' => '/img',
        ]);
    }
}
