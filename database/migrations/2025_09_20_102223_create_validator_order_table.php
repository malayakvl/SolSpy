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
        Schema::create('data.validator_order', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('validator_id');
            $table->integer('sort_order');
            $table->string('list_type')->default('top'); // Type of list (top, all, etc.)
            $table->timestamps();
            
            // Foreign key constraint for PostgreSQL with schema
            $table->foreign('validator_id')->references('id')->on('data.validators')->onDelete('cascade');
            
            // Index for faster queries
            $table->index(['list_type', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data.validator_order');
    }
};