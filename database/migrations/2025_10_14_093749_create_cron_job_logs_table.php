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
        Schema::create('cron_job_logs', function (Blueprint $table) {
            $table->id();
            $table->string('command_name');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->boolean('success')->default(false);
            $table->text('output')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['command_name', 'completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cron_job_logs');
    }
};