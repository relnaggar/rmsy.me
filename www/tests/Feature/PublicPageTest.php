<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicPageTest extends TestCase
{
    public function test_home_page_renders(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertSee('Ramsey the Engineer');
        $response->assertSee('Ramsey the Educator');
    }

    public function test_about_page_renders(): void
    {
        $response = $this->get(route('about'));

        $response->assertStatus(200);
    }

    public function test_projects_index_renders(): void
    {
        $response = $this->get(route('projects.index'));

        $response->assertStatus(200);
        $response->assertSee('rmsy.me');
    }

    public function test_project_show_renders(): void
    {
        $response = $this->get(route('projects.show', 'rmsy.me'));

        $response->assertStatus(200);
    }

    public function test_project_show_returns_404_for_invalid_slug(): void
    {
        $response = $this->get(route('projects.show', 'nonexistent-project'));

        $response->assertStatus(404);
    }

    public function test_external_redirects(): void
    {
        $this->get('/free-meeting')->assertRedirect('https://calendly.com/relnaggar/free-meeting');
        $this->get('/github')->assertRedirect('https://github.com/relnaggar');
        $this->get('/linkedin')->assertRedirect('https://www.linkedin.com/in/relnaggar');
        $this->get('/resumes/full-stack-developer')->assertRedirect(media('/resumes/ramsey-el-naggar-full-stack-developer.pdf'));
        $this->get('/resumes/educator')->assertRedirect(media('/resumes/ramsey-el-naggar-educator.pdf'));
    }

    public function test_health_check_route_renders(): void
    {
        $this->get('/up')->assertOk();
    }

    public function test_storage_local_route_requires_signature(): void
    {
        $this->get(route('storage.local', ['path' => 'missing-test-file.txt']))
            ->assertForbidden();
    }

    public function test_storage_local_route_signed_request_returns_404_for_missing_file(): void
    {
        $url = Storage::disk('local')->temporaryUrl('missing-test-file.txt', now()->addMinutes(5));

        $this->get($url)->assertNotFound();
    }
}
