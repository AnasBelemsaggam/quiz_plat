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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->unsignedInteger('duration_minutes')->default(10);

            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();

            // The teacher who created the quiz
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();

            $table->boolean('is_published')->default(false);

            $table->timestamps();

            // Helpful indexes
            $table->index(['module_id', 'group_id', 'is_published']);
            $table->index(['teacher_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
