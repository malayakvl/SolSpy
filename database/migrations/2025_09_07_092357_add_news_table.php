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
        // Create news table
        Schema::create('data.news', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique()->index();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->string('image_url')->nullable();
            $table->integer('views_count')->default(0);
            $table->timestamps();
        });

        // Create news translations table for multilingual content
        Schema::create('data.news_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('news_id')->constrained('data.news')->onDelete('cascade');
            $table->string('language', 5)->index(); // e.g., 'en', 'uk', 'ru'
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->json('meta_tags')->nullable(); // SEO meta tags
            $table->timestamps();
            
            // Ensure unique combination of news_id and language
            $table->unique(['news_id', 'language']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data.news_translations');
        Schema::dropIfExists('data.news');
    }
};
