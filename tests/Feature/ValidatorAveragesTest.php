<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\ValidatorAveragesService;

class ValidatorAveragesTest extends TestCase
{
    /**
     * Test that the validator averages service can be instantiated
     *
     * @return void
     */
    public function test_validator_averages_service_can_be_instantiated()
    {
        $service = new ValidatorAveragesService();
        $this->assertInstanceOf(ValidatorAveragesService::class, $service);
    }
    
    /**
     * Test that the getValidatorAverages method returns correct data structure
     *
     * @return void
     */
    public function test_get_validator_averages_returns_correct_structure()
    {
        $service = new ValidatorAveragesService();
        $result = $service->getValidatorAverages('A23LfQn6khffj2hGhGfXr6P52W2pxrVcCaHVQLYQgiX2', 10);
        
        // Check that result is an array
        $this->assertIsArray($result);
        
        // If there are results, check the structure
        if (!empty($result)) {
            $item = $result[0];
            $this->assertArrayHasKey('epoch', $item);
            $this->assertArrayHasKey('avg_uptime', $item);
            $this->assertArrayHasKey('avg_root_slot', $item);
            $this->assertArrayHasKey('avg_stake', $item);
            $this->assertArrayHasKey('avg_commission', $item);
            
            // Check that values are numeric
            $this->assertIsNumeric($item['epoch']);
            $this->assertIsNumeric($item['avg_uptime']);
            $this->assertIsNumeric($item['avg_root_slot']);
            $this->assertIsNumeric($item['avg_stake']);
            $this->assertIsNumeric($item['avg_commission']);
        }
    }
    
    /**
     * Test that the getOverallValidatorAverages method returns correct data structure
     *
     * @return void
     */
    public function test_get_overall_validator_averages_returns_correct_structure()
    {
        $service = new ValidatorAveragesService();
        $result = $service->getOverallValidatorAverages('A23LfQn6khffj2hGhGfXr6P52W2pxrVcCaHVQLYQgiX2', 10);
        
        // Check that result is an array
        $this->assertIsArray($result);
        
        // Check the structure
        $this->assertArrayHasKey('overall_avg_uptime', $result);
        $this->assertArrayHasKey('overall_avg_root_slot', $result);
        $this->assertArrayHasKey('overall_avg_stake', $result);
        $this->assertArrayHasKey('overall_avg_commission', $result);
        
        // Check that values are numeric
        $this->assertIsNumeric($result['overall_avg_uptime']);
        $this->assertIsNumeric($result['overall_avg_root_slot']);
        $this->assertIsNumeric($result['overall_avg_stake']);
        $this->assertIsNumeric($result['overall_avg_commission']);
    }
}