<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use App\Models\QuizAssignment;

class StudentQuizController extends Controller
{
    // GET /api/student/quizzes
    public function index(Request $request)
    {
        $student = $request->user();

        $quizzes = Quiz::query()
            ->where('is_published', true)
            ->where(function ($q) use ($student) {
                $q->whereNull('module_id')
                    ->orWhere('module_id', $student->module_id);
            })
            ->where(function ($q) use ($student) {
                $q->whereNull('group_id')
                    ->orWhere('group_id', $student->group_id);
            })
            ->latest()
            ->get();

        return response()->json($quizzes);
    }
    // POST /api/student/quizzes/{quiz}/start
    public function start(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        if ((int) $quiz->is_published !== 1) {
            return response()->json(['message' => 'Quiz not published'], 403);
        }

        $quiz->loadCount('questions');
        if ($quiz->questions_count === 0) {
            return response()->json(['message' => 'Quiz has no questions yet'], 422);
        }

        // Optional access check
        if ($user->module_id && $quiz->module_id != $user->module_id) {
            return response()->json(['message' => 'Quiz not allowed for your module'], 403);
        }
        if ($user->group_id && $quiz->group_id != $user->group_id) {
            return response()->json(['message' => 'Quiz not allowed for your group'], 403);
        }

        $existing = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->whereNull('submitted_at')
            ->latest()
            ->first();

        if ($existing) {
            $existing->load([
                'quiz:id,title,duration_minutes,module_id,group_id,is_published',
                'quiz.questions:id,quiz_id,statement,points',
                'quiz.questions.choices:id,question_id,label',
            ]);

            return response()->json($existing);
        }

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id,
            'started_at' => now(),
        ]);

        // Return the created attempt including quiz + questions + choices (without is_correct)
        $attempt->load([
            'quiz:id,title,duration_minutes,module_id,group_id,is_published',
            'quiz.questions:id,quiz_id,statement,points',
            'quiz.questions.choices:id,question_id,label',
        ]);

        return response()->json($attempt);
    }

    // POST /api/student/attempts/{attempt}/submit
    public function submit(Request $request, QuizAttempt $attempt)
    {
        $user = $request->user();

        if ($attempt->student_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($attempt->submitted_at) {
            return response()->json(['message' => 'Attempt already submitted'], 422);
        }

        $data = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.choice_id' => ['nullable', 'integer'],
        ]);

        $attempt->load(['quiz.questions.choices']);

        // Prevent duplicate rows if client retries before submitted_at is set
        $attempt->answers()->delete();

        $questions = $attempt->quiz->questions->keyBy('id');
        $maxScore = $attempt->quiz->questions->sum('points');
        $score = 0;

        foreach ($data['answers'] as $a) {
            $question = $questions->get($a['question_id']);
            if (!$question) continue;

            $choiceId = $a['choice_id'] ?? null;
            $choice = $choiceId ? $question->choices->firstWhere('id', $choiceId) : null;

            $isCorrect = $choice ? (bool) $choice->is_correct : false;
            $pointsEarned = $isCorrect ? (int) $question->points : 0;

            $attempt->answers()->create([
                'question_id' => $question->id,
                'choice_id' => $choice?->id,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
            ]);

            $score += $pointsEarned;
        }

        $attempt->update([
            'submitted_at' => now(),
            'score' => $score,
            'max_score' => $maxScore,
        ]);

        return response()->json([
            'attempt_id' => $attempt->id,
            'score' => $attempt->score,
            'max_score' => $attempt->max_score,
        ]);
    }

    // GET /api/student/attempts/{attempt}
    public function show(Request $request, QuizAttempt $attempt)
    {
        $user = $request->user();

        if ($attempt->student_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $attempt->load([
            'quiz:id,title,duration_minutes,module_id,group_id,is_published',
            'quiz.questions:id,quiz_id,statement,points',
            'quiz.questions.choices:id,question_id,label',
            'answers:id,quiz_attempt_id,question_id,choice_id,is_correct,points_earned',
        ]);

        return response()->json($attempt);
    }
}
