<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateBuyersTable extends AbstractMigration
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
        // CREATE TABLE buyers (
        //     id VARCHAR(100) PRIMARY KEY NOT NULL,
        //     name VARCHAR(255) NOT NULL,
        //     address1 VARCHAR(255),
        //     address2 VARCHAR(255),
        //     address3 VARCHAR(255),
        //     town_city VARCHAR(100),
        //     state_province_county VARCHAR(100),
        //     zip_postal_code VARCHAR(20),
        //     country VARCHAR(2) NOT NULL DEFAULT 'GB',
        //     extra VARCHAR(255)
        // );
        // SQL;
        $this->table('buyers', ['id' => false, 'primary_key' => ['id']])
            ->addColumn('id', 'string', ['limit' => 100, 'null' => false])
            ->addColumn('name', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('address1', 'string', ['limit' => 255])
            ->addColumn('address2', 'string', ['limit' => 255])
            ->addColumn('address3', 'string', ['limit' => 255])
            ->addColumn('town_city', 'string', ['limit' => 100])
            ->addColumn('state_province_county', 'string', ['limit' => 100])
            ->addColumn('zip_postal_code', 'string', ['limit' => 20])
            ->addColumn('country', 'string', ['limit' => 2, 'null' => false, 'default' => 'GB'])
            ->addColumn('extra', 'string', ['limit' => 255])
            ->create();
    }
}
