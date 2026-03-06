@props([
    'name',
    'action',
    'value' => null,
    'maxlength' => null,
    'required' => false,
    'datalist' => [],
])

<span data-inline-edit-display>
  {{ $slot }}
  <button type="button" class="btn btn-outline-secondary btn-sm ms-2" data-inline-edit-toggle>Edit</button>
</span>
<form method="POST" action="{{ $action }}" class="d-none align-items-center gap-2" data-inline-edit-form>
  @csrf
  @method('PUT')
  <input
    type="text"
    class="form-control form-control-sm @error($name) is-invalid @enderror"
    id="{{ $name }}"
    name="{{ $name }}"
    value="{{ old($name, $value) }}"
    @if($maxlength) maxlength="{{ $maxlength }}" @endif
    @if($required) required @endif
    @if($datalist) list="{{ $name }}-list" @endif
  >
  @if($datalist)
    <datalist id="{{ $name }}-list">
      @foreach($datalist as $option)
        <option value="{{ $option }}">
      @endforeach
    </datalist>
  @endif
  <button type="submit" class="btn btn-primary btn-sm">Update</button>
  <button type="button" class="btn btn-outline-secondary btn-sm" data-inline-edit-toggle>Cancel</button>
  @error($name)
    <div class="invalid-feedback">{{ $message }}</div>
  @enderror
</form>
