@props([
    'title',
    'action',
    'confirmMessage',
    'buttonLabel',
    'fields',
    'hiddenFields' => [],
])

<div class="card mt-3">
  <div class="card-body">
    <h5 class="card-title">{{ $title }}</h5>
    <form action="{{ $action }}" method="POST"
          data-confirm="{{ $confirmMessage }}">
      @csrf
      @foreach($hiddenFields as $hiddenName => $hiddenValue)
        <input type="hidden" name="{{ $hiddenName }}" value="{{ $hiddenValue }}">
      @endforeach
      <div class="row g-3 align-items-end">
        @foreach($fields as $field)
          <div class="col-auto">
            <x-form-input name="{{ $field['name'] }}" label="{{ $field['label'] }}" type="select" :options="$field['options']" required />
          </div>
        @endforeach
        <div class="col-auto">
          <button type="submit" class="btn btn-warning">{{ $buttonLabel }}</button>
        </div>
      </div>
    </form>
  </div>
</div>
