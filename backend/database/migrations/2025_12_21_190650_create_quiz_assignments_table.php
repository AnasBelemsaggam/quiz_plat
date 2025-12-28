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
        Schema::create('quiz_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();

            // Assign to module/group (optional)
            $table->foreignId('module_id')->nullable()->constrained('modules')->nullOnDelete();
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete();

            // Assign to single student (optional)
            $table->foreignId('student_id')->nullable()->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            // Avoid duplicates
            $table->unique(['quiz_id', 'module_id', 'group_id', 'student_id'], 'quiz_assign_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_assignments');
    }
};
