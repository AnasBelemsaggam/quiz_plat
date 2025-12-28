<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\Choice;

class AttemptAnswer extends Model
{
    protected $fillable = [
        'quiz_attempt_id',
        'question_id',
        'choice_id',
        'is_correct',
        'points_earned',
    ];

    public function attempt()
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function choice()
    {
        return $this->belongsTo(Choice::class);
    }
}
