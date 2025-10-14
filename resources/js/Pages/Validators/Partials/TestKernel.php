<?php 

namespace App\Console\Commands; 
use Illuminate\Console\Command; 

class TestKernel extends Command { 
    protected $signature = 'test:kernel'; 
    protected $description = 'Check console kernel'; 

    public function handle() { 
        $kernel = app()->make(\Illuminate\Contracts\Console\Kernel::class); $this->info('Kernel: ' . get_class($kernel)); 
    } 
}