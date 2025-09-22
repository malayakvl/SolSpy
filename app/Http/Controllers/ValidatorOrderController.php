<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ValidatorOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ValidatorOrderController extends Controller
{
    /**
     * Update the order of validators
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateOrder(Request $request)
    {
        // Custom validation for validator IDs to check they exist in the data.validators table
        // $validator->after(function ($validator) use ($request) {
        //     $validatorIds = $request->input('validatorIds');
        //     foreach ($validatorIds as $index => $validatorId) {
        //         if (!DB::table('data.validators')->where('id', $validatorId)->exists()) {
        //             $validator->errors()->add("validatorIds.$index", "The selected validator ID is invalid.");
        //         }
        //     }
        // });
        
        // if ($validator->fails()) {
        //     return response()->json(['errors' => $validator->errors()], 422);
        // }
        
        // $validatorIds = $request->input('validatorIds');
        // $listType = $request->input('listType', 'top');
        
        // // Log the incoming data for debugging
        // Log::info('Updating validator order', [
        //     'validatorIds' => $validatorIds,
        //     'listType' => $listType
        // ]);
        
        // Use a transaction to ensure data consistency
        $validatorIds = $request->input('validatorIds');
        $listType = $request->input('listType', 'top');
        DB::transaction(function () use ($validatorIds, $listType) {
            // Update sort_order for each validator
            foreach ($validatorIds as $index => $validatorId) {
                ValidatorOrder::updateOrCreate(
                    [
                        'validator_id' => $validatorId,
                        'list_type' => $listType
                    ],
                    [
                        'sort_order' => $index
                    ]
                );
            }
        });
        
        return response()->json(['message' => 'Order updated successfully']);
    }
    
    /**
     * Get the order of validators for a specific list type
     *
     * @param  string  $listType
     * @return \Illuminate\Http\Response
     */
    public function getOrder($listType = 'top')
    {
        $orderRecords = ValidatorOrder::where('list_type', $listType)
            ->orderBy('sort_order')
            ->get(['validator_id', 'sort_order']);
            
        return response()->json($orderRecords);
    }
}