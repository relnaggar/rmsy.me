<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateLessonsTable extends AbstractMigration
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
        // CREATE TABLE lessons (
        //     id INT PRIMARY KEY AUTO_INCREMENT,
        //     description VARCHAR(255) NOT NULL DEFAULT 'Online computer science classes',
        //     datetime DATETIME NOT NULL,
        //     duration_minutes INT NOT NULL DEFAULT 55,
        //     repeat_weeks INT NOT NULL DEFAULT 0,
        //     price_gbp_pence INT NOT NULL,
        //     paid TINYINT(1) NOT NULL DEFAULT 0,
        //     student_id INT,
        //     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
        //     client_id INT,
        //     FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
        //     buyer_id VARCHAR(100),
        //     FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        // );
        // SQL;
        $this->table('lessons')
            ->addColumn('description', 'string', ['limit' => 255, 'null' => false, 'default' => 'Online computer science classes'])
            ->addColumn('datetime', 'datetime', ['null' => false])
            ->addColumn('duration_minutes', 'integer', ['null' => false, 'default' => 55])
            ->addColumn('repeat_weeks', 'integer', ['null' => false, 'default' => 0])
            ->addColumn('price_gbp_pence', 'integer', ['null' => false])
            ->addColumn('paid', 'boolean', ['null' => false, 'default' => false])
            ->addColumn('student_id', 'integer', ['null' => true])
            ->addForeignKey('student_id', 'students', 'id', ['delete'=> 'NO_ACTION', 'update'=> 'NO_ACTION'])
            ->addColumn('client_id', 'integer', ['null' => true])
            ->addForeignKey('client_id', 'clients', 'id', ['delete'=> 'NO_ACTION', 'update'=> 'NO_ACTION'])
            ->addColumn('buyer_id', 'string', ['limit' => 100, 'null' => true])
            ->addForeignKey('buyer_id', 'buyers', 'id', ['delete'=> 'NO_ACTION', 'update'=> 'NO_ACTION'])
            ->create();
    }
}
