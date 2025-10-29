<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreatePaymentsTable extends AbstractMigration
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
        // CREATE TABLE payments (
        //     id VARCHAR(40) PRIMARY KEY,
        //     datetime DATETIME NOT NULL,
        //     amount INT NOT NULL,
        //     currency VARCHAR(3) NOT NULL,
        //     payment_reference VARCHAR(150) NOT NULL,
        //     payer_id VARCHAR(100) NOT NULL,
        //     FOREIGN KEY (payer_id) REFERENCES payers(id)
        // );
        // SQL;

        $this->table('payments', ['id' => false, 'primary_key' => ['id']])
            ->addColumn('id', 'string', ['limit' => 40, 'null' => false])
            ->addColumn('datetime', 'datetime', ['null' => false])
            ->addColumn('amount', 'integer', ['null' => false])
            ->addColumn('currency', 'string', ['limit' => 3, 'null' => false])
            ->addColumn('payment_reference', 'string', ['limit' => 150, 'null' => false])
            ->addColumn('payer_id', 'string', ['limit' => 100, 'null' => false])
            ->create();
    }
}
