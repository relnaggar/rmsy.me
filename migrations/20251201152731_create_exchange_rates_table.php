<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateExchangeRatesTable extends AbstractMigration
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
        // CREATE TABLE exchange_rates (
        //     date DATE PRIMARY KEY NOT NULL,
        //     gbpeur DECIMAL(6, 5), -- Example rate: 0.87540
        // );
        // SQL;

        $this->table('exchange_rates', ['id' => false, 'primary_key' => ['date']])
            ->addColumn('date', 'date', ['null' => false])
            ->addColumn('gbpeur', 'decimal', ['precision' => 6, 'scale' => 5])
            ->create();
    }
}
