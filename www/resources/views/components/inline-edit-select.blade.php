@props([
    'name',
    'action',
    'value' => null,
    'options',
])

<span data-inline-edit-display>
  {{ $slot }}
  <button type="button" class="btn btn-outline-secondary btn-sm ms-2" data-inline-edit-toggle>Edit</button>
</span>
<form method="POST" action="{{ $action }}" class="d-none align-items-center gap-2" data-inline-edit-form>
  @csrf
  @method('PUT')
  <select class="form-select form-select-sm w-auto @error($name) is-invalid @enderror" id="{{ $name }}" name="{{ $name }}">
    @foreach($options as $optionValue => $optionLabel)
      <option value="{{ $optionValue }}" @if(old($name, $value) == $optionValue) selected @endif>
        {{ $optionLabel }}
      </option>
    @endforeach
  </select>
  <button type="submit" class="btn btn-primary btn-sm">Update</button>
  <button type="button" class="btn btn-outline-secondary btn-sm" data-inline-edit-toggle>Cancel</button>
  @error($name)
    <div class="invalid-feedback">{{ $message }}</div>
  @enderror
</form>
