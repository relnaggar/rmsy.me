@props([
    'name',
    'action',
    'value' => false,
])

<span data-inline-edit-display>
  {{ $value ? 'Yes' : 'No' }}
  <button type="button" class="btn btn-outline-secondary btn-sm ms-2" data-inline-edit-toggle>Edit</button>
</span>
<form method="POST" action="{{ $action }}" class="d-none align-items-center gap-2" data-inline-edit-form>
  @csrf
  @method('PUT')
  <input type="hidden" name="{{ $name }}" value="0">
  <div class="form-check form-check-inline mb-0">
    <input
      type="checkbox"
      class="form-check-input @error($name) is-invalid @enderror"
      id="{{ $name }}"
      name="{{ $name }}"
      value="1"
      {{ old($name, $value) ? 'checked' : '' }}
    >
    <label class="form-check-label" for="{{ $name }}">Yes</label>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Update</button>
  <button type="button" class="btn btn-outline-secondary btn-sm" data-inline-edit-toggle>Cancel</button>
  @error($name)
    <div class="invalid-feedback">{{ $message }}</div>
  @enderror
</form>
