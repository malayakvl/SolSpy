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
        Schema::create('data.news_top_sorting', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('news_id');
            $table->string('news_type'); // 'news' or 'discord'
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['news_type', 'sort_order']);
            $table->index('news_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data.news_top_sorting');
    }
};