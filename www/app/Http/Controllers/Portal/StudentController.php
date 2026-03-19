<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Client;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class StudentController extends Controller
{
    public function index(): View
    {
        return view('portal.students.index', [
            'students' => Student::orderBy('name')->get(),
        ]);
    }

    public function show(Request $request, Student $student): View
    {
        [$startDate, $endDate] = $this->lessonDateDefaults(
            $request,
            $student->lessons()->min('datetime'),
            $student->lessons()->max('datetime'),
        );
        $clientFilter = (string) $request->query('client_id', '');
        $buyerFilter = (string) $request->query('buyer_id', '');
        $statusFilters = $this->readLessonStatusFilters($request);

        $lessonsQuery = $student->lessons()
            ->with(['client', 'buyer', 'payments'])
            ->orderBy('datetime', 'desc');

        if ($clientFilter !== '') {
            $lessonsQuery->where('client_id', (int) $clientFilter);
        }
        if ($buyerFilter !== '') {
            $lessonsQuery->where('buyer_id', $buyerFilter);
        }
        $this->applyLessonDateFilters($lessonsQuery, $startDate, $endDate);
        $this->applyLessonStatusFilters($lessonsQuery, $statusFilters);

        $sources = Student::where('source', '!=', '')
            ->distinct()
            ->orderBy('source')
            ->pluck('source');

        return view('portal.students.show', [
            'student' => $student,
            'sources' => $sources,
            'lessons' => $lessonsQuery->get(),
            'startDateFilter' => $startDate,
            'endDateFilter' => $endDate,
            'clientFilter' => $clientFilter,
            'buyerFilter' => $buyerFilter,
            'studentFilter' => (string) $student->id,
            'completeFilter' => $statusFilters['complete'],
            'paidFilter' => $statusFilters['paid'],
            'clientOptions' => self::withAllOption(
                Client::whereIn('id', $student->lessons()->whereNotNull('client_id')->distinct()->pluck('client_id'))
                    ->orderBy('name')->pluck('name', 'id')->toArray()
            ),
            'buyerOptions' => self::withAllOption(
                Buyer::whereIn('id', $student->lessons()->whereNotNull('buyer_id')->distinct()->pluck('buyer_id'))
                    ->orderBy('name')->pluck('name', 'id')->toArray()
            ),
            'studentOptions' => [$student->id => $student->name],
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'source' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $student->update($validated);

        return redirect()->route('portal.students.show', $student)
            ->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();

        return redirect()->route('portal.students.index')
            ->with('success', 'Student deleted successfully.');
    }
}
