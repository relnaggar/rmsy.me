@extends('layouts.app')

@section('title', 'Lesson')
@section('heading', 'Lesson')

@section('content')
<table class="table table-bordered mb-4">
  <col style="width: 1%">
  <tr>
    <th class="text-nowrap">ID</th>
    <td>{{ $lesson->id }}</td>
  </tr>
  <tr>
    <th class="text-nowrap">Date/Time</th>
    <td>{{ $lesson->getFormattedDatetime() }}-{{ $lesson->datetime->copy()->addMinutes($lesson->duration_minutes)->format('H:i') }}</td>
  </tr>
  <tr>
    <th>Duration</th>
    <td>{{ $lesson->duration_minutes }} min</td>
  </tr>
  <tr>
    <th>Repeat</th>
    <td>{{ $lesson->repeat_weeks }} week{{ $lesson->repeat_weeks !== 1 ? 's' : '' }}</td>
  </tr>
  <tr>
    <th>Price</th>
    <td>
      <x-inline-edit-text name="price_gbp" :action="route('portal.lessons.update', $lesson)" :value="penceToPounds($lesson->price_gbp_pence)" required>
        &pound;{{ $lesson->getFormattedPrice() }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th>Student</th>
    <td>
      <x-inline-edit-select name="student_id" :action="route('portal.lessons.update', $lesson)" :value="$lesson->student_id" :options="$students">
        @if($lesson->student)
          <a href="{{ route('portal.students.show', $lesson->student) }}">{{ $lesson->student->name }}</a>
        @else
          <span class="text-muted">-</span>
        @endif
      </x-inline-edit-select>
    </td>
  </tr>
  <tr>
    <th>Client</th>
    <td>
      <x-inline-edit-select name="client_id" :action="route('portal.lessons.update', $lesson)" :value="$lesson->client_id" :options="$clients">
        @if($lesson->client)
          <a href="{{ route('portal.clients.show', $lesson->client) }}">{{ $lesson->client->name }}</a>
        @else
          <span class="text-muted">-</span>
        @endif
      </x-inline-edit-select>
    </td>
  </tr>
  <tr>
    <th>Buyer</th>
    <td>
      <x-inline-edit-select name="buyer_id" :action="route('portal.lessons.update', $lesson)" :value="$lesson->buyer_id" :options="$buyers">
        @if($lesson->buyer)
          <a href="{{ route('portal.buyers.show', $lesson->buyer) }}">{{ $lesson->buyer->name }}</a>
        @else
          <span class="text-muted">-</span>
        @endif
      </x-inline-edit-select>
    </td>
  </tr>
  <tr>
    <th>Paid</th>
    <td><x-paid-status :lesson="$lesson" /></td>
  </tr>
  <tr>
    <th>Complete</th>
    <td>
      <x-inline-edit-select name="complete" :action="route('portal.lessons.update', $lesson)" :value="$lesson->complete ? '1' : '0'" :options="$completeOptions">
        {{ $lesson->complete ? 'Yes' : 'No' }}
      </x-inline-edit-select>
    </td>
  </tr>
  <tr>
    <th>Actions</th>
    <td>
      <form action="{{ route('portal.lessons.destroy', $lesson) }}" method="POST" class="d-inline"
            data-confirm="Are you sure you want to delete this lesson?">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-danger btn-sm">Delete Lesson</button>
      </form>
      @if($lesson->student)
        <form action="{{ route('portal.lessons.applyToStudent', $lesson) }}" method="POST" class="d-inline"
              data-confirm="Are you sure you want to apply this lesson's settings to all lessons for {{ $lesson->student->name }}?">
          @csrf
          <button type="submit" class="btn btn-outline-primary btn-sm">Update All for {{ $lesson->student->name }}</button>
        </form>
        <form action="{{ route('portal.lessons.applyToStudent', $lesson) }}" method="POST" class="d-inline"
              data-confirm="Are you sure you want to apply this lesson's settings to all unmatched lessons for {{ $lesson->student->name }}?">
          @csrf
          <input type="hidden" name="unmatched_only" value="1">
          <button type="submit" class="btn btn-outline-primary btn-sm">Update Unmatched for {{ $lesson->student->name }}</button>
        </form>
      @endif
    </td>
  </tr>
</table>
@endsection
