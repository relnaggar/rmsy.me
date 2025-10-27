<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateUsersTable extends AbstractMigration
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
        // CREATE TABLE users (
        //     id INT PRIMARY KEY AUTO_INCREMENT,
        //     email VARCHAR(254) NOT NULL UNIQUE,
        //     password_hash VARCHAR(64) NOT NULL,
        //     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        //     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        // );
        // SQL;
        $this->table('users')
            ->addColumn('email', 'string', ['limit' => 254, 'null' => false])
            ->addColumn('password_hash', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addColumn('updated_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addIndex(['email'], ['unique' => true])
            ->create();
    }
}
