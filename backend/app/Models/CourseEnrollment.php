<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'full_name',
        'email',
        'phone',
        'message',
        'status',
    ];

    /**
     * @return BelongsTo<User, CourseEnrollment>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Course, CourseEnrollment>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
