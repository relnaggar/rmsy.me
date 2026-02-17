<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WiseDeposit;
use App\Services\ProjectsService;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;
use NumberFormatter;

class SiteController extends Controller
{
    public function __construct(
        private ProjectsService $projectsService,
    ) {}

    public function index(): View
    {
        // calculate the number of years tutoring
        $currentDate = new DateTime;
        $tutoringStartDate = new DateTime('2019-01-01');
        $numberOfYearsTutoring = $currentDate->diff($tutoringStartDate)->y;
        $formatter = new NumberFormatter('en', NumberFormatter::SPELLOUT);
        $numberOfYearsTutoringAsWord = ucfirst(
            $formatter->format($numberOfYearsTutoring)
        );

        // define the roles data
        $freeMeetingCallToAction = [
            'href' => url('/free-meeting'),
            'external' => true,
            'text' => 'Book a free meeting',
            'btn-type' => 'cta',
        ];
        $roles = [
            [
                'header' => 'Ramsey the Engineer',
                'content' => <<<'HTML'
                I'm a software engineer, specialising in
                <strong>full-stack web application development</strong>.
                That means I can take your wildest web dreams and turn them into
                reality, quickly.
                HTML,
                'callsToAction' => [
                    [
                        // 'href' => '/services/engineer',
                        'href' => route('projects.index'),
                        'external' => false,
                        // 'text' => 'Learn more about my engineering services',
                        'text' => 'Learn more about my engineering projects',
                        'btn-type' => 'primary',
                    ],
                    [
                        'href' => url('/resumes/full-stack-developer'),
                        'external' => true,
                        'text' => 'View my full stack developer resume',
                        'btn-type' => 'success',
                    ],
                    $freeMeetingCallToAction,
                ],
                'icon' => 'terminal-fill',
            ], [
                'header' => 'Ramsey the Educator',
                'content' => <<<'HTML'
                As an educator, I love to
                <strong>share my knowledge and passion for programming</strong>.
                From beginner to code conjurer, I can help boost your confidence
                and results.
                HTML,
                'callsToAction' => [
                    [
                        // 'href' => '/services/educator',
                        // 'external' => false,
                        'href' => 'https://www.mytutor.co.uk/tutors/24851/',
                        'external' => true,
                        'text' => 'Learn more about my educational services',
                        'btn-type' => 'primary',
                    ],
                    [
                        'href' => url('/resumes/educator'),
                        'external' => true,
                        'text' => 'View my educator resume',
                        'btn-type' => 'success',
                    ],
                    $freeMeetingCallToAction,
                ],
                'icon' => 'mortarboard-fill',
            ],
        ];

        return view('site.index', [
            'featuredProjects' => $this->projectsService->getFeaturedProjects(),
            'roles' => $roles,
            'numberOfYearsTutoringAsWord' => $numberOfYearsTutoringAsWord,
        ]);
    }

    public function about(): View
    {
        $aboutFile = resource_path('views/site/about.blade.php');
        $lastModified = filemtime($aboutFile);
        $lastModifiedDateFormatted = date('F Y', $lastModified);

        return view('site.about', [
            'lastModifiedDateFormatted' => $lastModifiedDateFormatted,
        ]);
    }

    public function wiseDeposit(Request $request): Response
    {
        if ($request->header('x-test-notification') === 'true') {
            return response('', 200);
        }

        $data = $request->json('data');

        if ($data) {
            WiseDeposit::create([
                'amount_cents' => (int) round($data['amount'] * 100),
                'currency' => $data['currency'],
                'occurred_at' => $data['occurred_at'],
            ]);
        }

        return response('', 200);
    }
}
