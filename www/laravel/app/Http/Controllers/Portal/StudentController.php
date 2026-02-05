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

    public function edit(Student $student): View
    {
        return view('portal.students.edit', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $student->update($validated);

        return redirect()->route('portal.students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function clear(): RedirectResponse
    {
        Student::truncate();

        return redirect()->route('portal.students.index')
            ->with('success', 'All students have been deleted.');
    }
}
