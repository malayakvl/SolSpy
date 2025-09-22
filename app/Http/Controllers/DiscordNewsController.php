<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DiscordNews;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DiscordNewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $news = DiscordNews::orderBy('sort_order')->get();
        return response()->json($news);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'url' => 'nullable|url',
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'image_url' => 'nullable|url',
            'is_top' => 'nullable|boolean',
        ]);

        $news = DiscordNews::create($request->all());

        return response()->json($news, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(DiscordNews $discordNews)
    {
        return response()->json($discordNews);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DiscordNews $discordNews)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'url' => 'nullable|url',
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'image_url' => 'nullable|url',
            'is_top' => 'nullable|boolean',
        ]);

        $discordNews->update($request->all());

        return response()->json($discordNews);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DiscordNews $discordNews)
    {
        $discordNews->delete();

        return response()->json(null, 204);
    }

    /**
     * Update the order of news items
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'newsIds' => 'required|array',
            'newsIds.*' => 'integer|exists:data.discord_news,id',
        ]);

        $newsIds = $request->input('newsIds');

        // Use a transaction to ensure data consistency
        DB::transaction(function () use ($newsIds) {
            // Update sort_order for each news item
            foreach ($newsIds as $index => $newsId) {
                DiscordNews::where('id', $newsId)->update(['sort_order' => $index]);
            }
        });

        return response()->json(['message' => 'Order updated successfully']);
    }

    /**
     * Get the order of news items
     */
    public function getOrder()
    {
        $orderRecords = DiscordNews::orderBy('sort_order')
            ->get(['id', 'sort_order']);

        return response()->json($orderRecords);
    }

    /**
     * Toggle the is_top status of news items
     */
    public function toggleTop(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:data.discord_news,id',
        ]);

        $ids = $request->input('ids');

        // Toggle is_top status for news items
        DiscordNews::whereIn('id', $ids)->update([
            'is_top' => DB::raw('NOT is_top')
        ]);

        return response()->json(['message' => 'Top status updated successfully']);
    }

    /**
     * Get top news items
     */
    public function getTop()
    {
        $topNews = DiscordNews::where('is_top', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($topNews);
    }
}