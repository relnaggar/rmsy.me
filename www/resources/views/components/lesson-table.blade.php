@props([
    'lessons',
    'filterAction',
    'buyerOptions' => [],
    'studentOptions' => [],
    'clientOptions' => [],
    'completeFilter' => 'all',
    'paidFilter' => 'all',
    'buyerFilter' => '',
    'studentFilter' => '',
    'clientFilter' => '',
    'startDateFilter' => '',
    'endDateFilter' => '',
])

<form method="GET" action="{{ $filterAction }}" class="row g-2 align-items-end mb-3">
  <div class="col-auto">
    <label for="lesson_filter_start" class="form-label mb-0">From</label>
    <input type="date" id="lesson_filter_start" name="start_date" class="form-control" value="{{ $startDateFilter }}" data-auto-submit>
  </div>
  <div class="col-auto d-flex align-items-end">
    <button type="button" class="btn btn-sm btn-outline-secondary" title="Copy From date to To date" data-copy-date-from="lesson_filter_start" data-copy-date-to="lesson_filter_end">&rarr;</button>
  </div>
  <div class="col-auto">
    <label for="lesson_filter_end" class="form-label mb-0">To</label>
    <input type="date" id="lesson_filter_end" name="end_date" class="form-control" value="{{ $endDateFilter }}" data-auto-submit>
  </div>
  @foreach([
      ['id' => 'lesson_filter_student', 'name' => 'student_id', 'label' => 'Student', 'options' => $studentOptions, 'filter' => $studentFilter],
      ['id' => 'lesson_filter_client',  'name' => 'client_id',  'label' => 'Client',  'options' => $clientOptions,  'filter' => $clientFilter],
      ['id' => 'lesson_filter_buyer',   'name' => 'buyer_id',   'label' => 'Buyer',   'options' => $buyerOptions,   'filter' => $buyerFilter],
  ] as $dropdown)
    <div class="col-auto">
      <label for="{{ $dropdown['id'] }}" class="form-label mb-0">{{ $dropdown['label'] }}</label>
      @if(count($dropdown['options']) === 0)
        <select id="{{ $dropdown['id'] }}" name="{{ $dropdown['name'] }}" class="form-select" disabled>
          <option>- None -</option>
        </select>
      @else
        <select id="{{ $dropdown['id'] }}" name="{{ $dropdown['name'] }}" class="form-select"
                @if(count($dropdown['options']) > 1) data-auto-submit @endif>
          @foreach($dropdown['options'] as $value => $label)
            <option value="{{ $value }}" @selected($dropdown['filter'] === (string) $value)>{{ $label }}</option>
          @endforeach
        </select>
      @endif
    </div>
  @endforeach
  <div class="col-auto">
    <label for="lesson_filter_paid" class="form-label mb-0">Paid</label>
    <select id="lesson_filter_paid" name="paid" class="form-select" data-auto-submit>
      <option value="all" @selected($paidFilter === 'all')>- All -</option>
      <option value="unpaid" @selected($paidFilter === 'unpaid')>Unpaid</option>
      <option value="paid" @selected($paidFilter === 'paid')>Paid</option>
    </select>
  </div>
  <div class="col-auto">
    <label for="lesson_filter_complete" class="form-label mb-0">Complete</label>
    <select id="lesson_filter_complete" name="complete" class="form-select" data-auto-submit>
      <option value="all" @selected($completeFilter === 'all')>- All -</option>
      <option value="incomplete" @selected($completeFilter === 'incomplete')>Incomplete</option>
      <option value="complete" @selected($completeFilter === 'complete')>Complete</option>
    </select>
  </div>
</form>

<form method="POST" action="{{ route('portal.lessons.markCompleteBulk') }}">
  @csrf
  @if($lessons->isNotEmpty())
    <div class="mb-2">
      <button type="submit" class="btn btn-success btn-sm"
              data-confirm="Mark selected lessons as complete?"
              data-requires-selection>Mark as Complete</button>
      <button type="submit" formaction="{{ route('portal.lessons.deleteBulk') }}" class="btn btn-danger btn-sm"
              data-confirm="Delete selected lessons?"
              data-requires-selection>Delete</button>
    </div>
  @endif
  <table class="table table-striped">
    <thead>
      <tr>
        <th><input type="checkbox" data-select-all></th>
        <th>ID</th>
        <th>Date/Time</th>
        <th>Repeat (Weeks)</th>
        <th>Student</th>
        <th>Client</th>
        <th>Buyer</th>
        <th>Price</th>
        <th>Paid</th>
        <th>Complete</th>
      </tr>
    </thead>
    <tbody>
      @forelse($lessons as $lesson)
        <tr>
          <td><input type="checkbox" name="lesson_ids[]" value="{{ $lesson->id }}"></td>
          <td><a href="{{ route('portal.lessons.show', $lesson) }}">{{ $lesson->id }}</a></td>
          <td>{{ $lesson->getFormattedDatetime() }}-{{ $lesson->datetime->copy()->addMinutes($lesson->duration_minutes)->format('H:i') }}</td>
          <td>{{ $lesson->repeat_weeks }}</td>
          <td>
            @if($lesson->student)
              <a href="{{ route('portal.students.show', $lesson->student) }}">{{ $lesson->student->name }}</a>
            @else
              -
            @endif
          </td>
          <td>
            @if($lesson->client)
              <a href="{{ route('portal.clients.show', $lesson->client) }}">{{ $lesson->client->name }}</a>
            @else
              -
            @endif
          </td>
          <td>
            @if($lesson->buyer)
              <a href="{{ route('portal.buyers.show', $lesson->buyer) }}">{{ $lesson->buyer->name }}</a>
            @else
              -
            @endif
          </td>
          <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
          <td><x-paid-status :lesson="$lesson" /></td>
          <td>{{ $lesson->complete ? 'Yes' : 'No' }}</td>
        </tr>
      @empty
        <tr>
          <td colspan="10" class="text-center">No lessons found.</td>
        </tr>
      @endforelse
    </tbody>
  </table>
</form>
