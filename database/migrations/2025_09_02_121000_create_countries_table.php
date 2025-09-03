<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only create table if it doesn't exist (CREATE TABLE IF NOT EXISTS equivalent)
        if (!Schema::hasTable('data.countries')) {
            Schema::create('data.countries', function (Blueprint $table) {
                $table->serial('id')->primary(); // serial primary key
                $table->string('iso', 5)->nullable(false); // varchar(5) not null
                $table->string('name', 255)->nullable(false); // varchar(255) not null
                $table->string('nicename', 255)->nullable(false); // varchar(255) not null
                $table->string('iso3', 10)->nullable(); // varchar(10)
                $table->integer('numcode')->nullable(); // integer
                $table->string('phonecode', 10)->nullable(); // varchar(10)
                $table->timestamp('created_at')->nullable(false)->useCurrent(); // timestamp default CURRENT_TIMESTAMP not null
                $table->timestamp('updated_at')->nullable(false)->useCurrent(); // timestamp default CURRENT_TIMESTAMP not null
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data.countries');
    }
};