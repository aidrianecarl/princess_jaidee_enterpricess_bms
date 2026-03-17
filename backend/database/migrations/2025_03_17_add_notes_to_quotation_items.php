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
        Schema::table('quotation_items', function (Blueprint $table) {
            // Add notes field as JSON to store all notes (sizeNotes, designNotes, teamRosterNotes, additionalNotes)
            $table->json('notes')->nullable()->after('size_specifications');
            
            // Ensure design_file_url can store multiple JSON URLs
            $table->text('design_file_url')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotation_items', function (Blueprint $table) {
            $table->dropColumn('notes');
            $table->string('design_file_url')->nullable()->change();
        });
    }
};
