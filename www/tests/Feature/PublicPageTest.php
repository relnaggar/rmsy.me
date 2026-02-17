<?php

namespace Tests\Feature;

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
        $this->get('/github')->assertRedirect('https://github.com/relnaggar');
        $this->get('/linkedin')->assertRedirect('https://www.linkedin.com/in/relnaggar');
    }
}
