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
        Schema::table('data.news', function (Blueprint $table) {
            // Remove old columns
            $table->dropColumn(['is_published', 'author', 'view_count']);
            
            // Add new columns
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index()->after('slug');
            $table->integer('views_count')->default(0)->after('image_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.news', function (Blueprint $table) {
            // Restore old columns
            $table->dropColumn(['status', 'views_count']);
            $table->boolean('is_published')->default(false)->index()->after('slug');
            $table->string('author')->nullable()->after('image_url');
            $table->integer('view_count')->default(0)->after('author');
        });
    }
};
