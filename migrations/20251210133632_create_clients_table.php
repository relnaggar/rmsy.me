<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateClientsTable extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        // <<<SQL
        // CREATE TABLE clients (
        //     id INT PRIMARY KEY AUTO_INCREMENT,
        //     name VARCHAR(255) NOT NULL,
        // );
        // SQL;
        $this->table('clients')
            ->addColumn('name', 'string', ['limit' => 255, 'null' => false])
            ->create();
    }
}
