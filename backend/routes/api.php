<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Teacher\QuizController as TeacherQuizController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Student\StudentQuizController;


// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', fn(\Illuminate\Http\Request $r) => $r->user());


    Route::middleware('role:teacher,admin')->get('/modules', fn() => \App\Models\Module::query()->get(['id', 'name']));
    Route::middleware('role:teacher,admin')->get('/modules/{module}/groups', fn(\App\Models\Module $module) => $module->groups()->get(['id', 'name', 'module_id']));

    // Teacher routes
    Route::middleware('role:teacher,admin')
        ->prefix('teacher')
        ->group(function () {
            Route::get('/quizzes', [TeacherQuizController::class, 'index']);
            Route::post('/quizzes', [TeacherQuizController::class, 'store']);
            Route::get('/quizzes/{quiz}', [TeacherQuizController::class, 'show']);
            Route::put('/quizzes/{quiz}', [TeacherQuizController::class, 'update']);
            Route::delete('/quizzes/{quiz}', [TeacherQuizController::class, 'destroy']);
            Route::post('/quizzes/{quiz}/questions', [TeacherQuizController::class, 'addQuestion']);
            // Students lookup for assignment UI
            Route::get('/students', [TeacherQuizController::class, 'students']);

            // Quiz assignments
            Route::post('/quizzes/{quiz}/assign', [TeacherQuizController::class, 'assign']);
            Route::get('/quizzes/{quiz}/assignments', [TeacherQuizController::class, 'assignments']);
            Route::delete('/quizzes/{quiz}/assignments/{assignment}', [TeacherQuizController::class, 'unassign']);
        });

    // Admin routes
    Route::middleware('role:admin')
        ->prefix('admin')
        ->group(function () {
            Route::post('/users', [UserController::class, 'store']);

            //  NEW
            Route::get('/users', [UserController::class, 'index']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });

    Route::middleware('role:student')
        ->prefix('student')
        ->group(function () {
            Route::get('/quizzes', [StudentQuizController::class, 'index']);
            Route::post('/quizzes/{quiz}/start', [StudentQuizController::class, 'start']);
            Route::post('/attempts/{attempt}/submit', [StudentQuizController::class, 'submit']);
            Route::get('/attempts/{attempt}', [StudentQuizController::class, 'show']);
        });
});

// Simple API health check
Route::get('/ping', fn() => response()->json(['status' => 'API OK']));
Route::get('/quizzes/{quiz}/assignments', [TeacherQuizController::class, 'assignments']);
Route::delete('/quizzes/{quiz}/assignments/{assignment}', [TeacherQuizController::class, 'unassign']);
