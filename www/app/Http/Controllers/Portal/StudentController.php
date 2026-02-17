<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
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

    public function show(Student $student): View
    {
        $student->load(['lessons' => fn ($q) => $q->with(['client', 'buyer', 'payments'])->orderBy('datetime')]);

        return view('portal.students.show', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
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
