<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $email = trim(@file_get_contents('/run/secrets/ADMIN_EMAIL') ?: '');
        $password = trim(@file_get_contents('/run/secrets/ADMIN_PASSWORD') ?: '');

        if ($email === '' || $password === '') {
            $this->command->warn('ADMIN_EMAIL or ADMIN_PASSWORD secret not found, skipping admin user seed.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            ['name' => 'Admin', 'password' => $password],
        );
    }
}
