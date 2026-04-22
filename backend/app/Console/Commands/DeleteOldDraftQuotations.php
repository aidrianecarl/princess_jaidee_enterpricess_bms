<?php

namespace App\Console\Commands;

use App\Models\Quotation;
use Illuminate\Console\Command;
use Carbon\Carbon;

class DeleteOldDraftQuotations extends Command
{
    protected $signature = 'quotations:delete-old-drafts';
    protected $description = 'Automatically soft delete draft quotations older than 30 days';

    public function handle()
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        
        // Soft delete draft quotations older than 30 days
        $deleted = Quotation::where('status', 'draft')
            ->where('created_at', '<', $thirtyDaysAgo)
            ->delete();
        
        $this->info("Successfully soft deleted {$deleted} draft quotations older than 30 days");
        
        return Command::SUCCESS;
    }
}
