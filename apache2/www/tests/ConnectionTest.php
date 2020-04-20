<?php declare(strict_types=1);
use PHPUnit\Framework\TestCase;

final class ConnectionTest extends TestCase
{
    public function testCanConnectToDatabase(): void
    {
        new PDO('pgsql:host=postgres;dbname=postgres', 'postgres', rtrim(file_get_contents('/run/secrets/PGPASSWORD')));
        $this->assertTrue(true);
    }
}
