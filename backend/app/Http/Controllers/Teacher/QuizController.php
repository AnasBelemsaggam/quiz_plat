<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;
use App\Models\QuizAssignment;
use App\Models\User;

class QuizController extends Controller
{
    public function assign(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->teacher_id === $request->user()->id || $request->user()->role === 'admin', 403);

        $data = $request->validate([
            'module_id'  => 'nullable|exists:modules,id',
            'group_id'   => 'nullable|exists:groups,id',
            'student_id' => 'nullable|exists:users,id',
        ]);

        // require at least one target
        if (empty($data['module_id']) && empty($data['group_id']) && empty($data['student_id'])) {
            return response()->json(['message' => 'You must assign to module, group, or student'], 422);
        }

        // If a student is provided, ensure it's actually a student
        if (!empty($data['student_id'])) {
            $student = User::query()->where('role', 'student')->find($data['student_id']);
            if (!$student) {
                return response()->json(['message' => 'student_id must be a student user'], 422);
            }

            // Non-admin teachers can only assign to students in their own module/group
            if ($request->user()->role !== 'admin') {
                if ($request->user()->module_id && $student->module_id != $request->user()->module_id) {
                    return response()->json(['message' => 'Student not in your module'], 403);
                }
                if ($request->user()->group_id && $student->group_id != $request->user()->group_id) {
                    return response()->json(['message' => 'Student not in your group'], 403);
                }
            }
        }

        QuizAssignment::firstOrCreate([
            'quiz_id' => $quiz->id,
            'module_id' => $data['module_id'] ?? null,
            'group_id' => $data['group_id'] ?? null,
            'student_id' => $data['student_id'] ?? null,
        ]);

        return response()->json(['message' => 'Quiz assigned successfully']);
    }

    public function index(Request $r)
    {
        $quizzes = Quiz::where('teacher_id', $r->user()->id)
            ->latest()
            ->get();

        return response()->json($quizzes);
    }

    // GET /api/teacher/students
    public function students(Request $r)
    {
        $teacher = $r->user();

        $q = User::query()->where('role', 'student');

        // Teachers only see students in their module/group.
        if ($teacher->role !== 'admin') {
            if ($teacher->module_id) {
                $q->where('module_id', $teacher->module_id);
            }
            if ($teacher->group_id) {
                $q->where('group_id', $teacher->group_id);
            }
        }

        $students = $q->orderBy('name')
            ->get(['id', 'name', 'email', 'module_id', 'group_id']);

        return response()->json($students);
    }

    // GET /api/teacher/quizzes/{quiz}/assignments
    public function assignments(Request $r, Quiz $quiz)
    {
        abort_unless($quiz->teacher_id === $r->user()->id || $r->user()->role === 'admin', 403);

        $rows = QuizAssignment::query()
            ->where('quiz_id', $quiz->id)
            ->latest('id')
            ->get();

        return response()->json($rows);
    }

    // DELETE /api/teacher/quizzes/{quiz}/assignments/{assignment}
    public function unassign(Request $r, Quiz $quiz, QuizAssignment $assignment)
    {
        abort_unless($quiz->teacher_id === $r->user()->id || $r->user()->role === 'admin', 403);

        if ((int)$assignment->quiz_id !== (int)$quiz->id) {
            return response()->json(['message' => 'Assignment does not belong to this quiz'], 422);
        }

        $assignment->delete();
        return response()->json(['deleted' => true]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1|max:300',
            'is_published' => 'sometimes|boolean',
        ]);

        $user = $r->user();

        // Teachers create quizzes only inside their own module/group.
        if (!$user->module_id || !$user->group_id) {
            return response()->json([
                'message' => 'Teacher must have module_id and group_id set before creating quizzes.',
            ], 422);
        }

        $quiz = Quiz::create([
            'title' => $data['title'],
            'duration_minutes' => $data['duration_minutes'],
            'module_id' => $user->module_id,
            'group_id' => $user->group_id,
            'is_published' => (bool)($data['is_published'] ?? false),
            'teacher_id' => $user->id,
        ]);

        return response()->json($quiz, 201);
    }

    public function show(Request $r, Quiz $quiz)
    {
        abort_unless($quiz->teacher_id === $r->user()->id || $r->user()->role === 'admin', 403);
        return response()->json($quiz->load('questions.choices'));
    }

    public function update(Request $r, Quiz $quiz)
    {
        abort_unless($quiz->teacher_id === $r->user()->id || $r->user()->role === 'admin', 403);

        $data = $r->validate([
            'title' => 'sometimes|string|max:255',
            'duration_minutes' => 'sometimes|integer|min:1|max:300',
            'is_published' => 'sometimes|boolean',
        ]);

        $quiz->update($data);
        return response()->json($quiz);
    }

    public function destroy(Request $r, Quiz $quiz)
    {
        abort_unless($quiz->teacher_id === $r->user()->id || $r->user()->role === 'admin', 403);
        $quiz->delete();
        return response()->json(['deleted' => true]);
    }

    public function addQuestion(Request $r, Quiz $quiz)
    {
        abort_unless($quiz->teacher_id === $r->user()->id || $r->user()->role === 'admin', 403);

        $data = $r->validate([
            'statement' => 'required|string',
            'points' => 'nullable|integer|min:1|max:100',
            'choices' => 'required|array|min:3|max:4',
            'choices.*.label' => 'required|string|max:255',
            'correct_index' => 'required|integer|min:0|max:3',
        ]);

        $question = $quiz->questions()->create([
            'statement' => $data['statement'],
            'points' => $data['points'] ?? 1,
        ]);

        foreach ($data['choices'] as $i => $c) {
            $question->choices()->create([
                'label' => $c['label'],
                'is_correct' => ($i === (int)$data['correct_index']),
            ]);
        }

        return response()->json($question->load('choices'), 201);
    }
}
