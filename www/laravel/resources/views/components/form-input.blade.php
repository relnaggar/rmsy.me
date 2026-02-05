@props([
    'name',
    'label',
    'type' => 'text',
    'value' => null,
    'required' => false,
    'readonly' => false,
    'maxlength' => null,
    'rows' => null,
    'options' => null,
    'placeholder' => null,
])

<div class="mb-3">
    <label for="{{ $name }}" class="form-label">{{ $label }}</label>

    @if($type === 'textarea')
        <textarea
            class="form-control @error($name) is-invalid @enderror"
            id="{{ $name }}"
            name="{{ $name }}"
            @if($required) required @endif
            @if($readonly) readonly @endif
            @if($maxlength) maxlength="{{ $maxlength }}" @endif
            @if($rows) rows="{{ $rows }}" @endif
            @if($placeholder) placeholder="{{ $placeholder }}" @endif
        >{{ old($name, $value) }}</textarea>
    @elseif($type === 'select')
        <select
            class="form-select @error($name) is-invalid @enderror"
            id="{{ $name }}"
            name="{{ $name }}"
            @if($required) required @endif
            @if($readonly) disabled @endif
        >
            @foreach($options as $optionValue => $optionLabel)
                <option value="{{ $optionValue }}" @if(old($name, $value) == $optionValue) selected @endif>
                    {{ $optionLabel }}
                </option>
            @endforeach
        </select>
    @else
        <input
            type="{{ $type }}"
            class="form-control @error($name) is-invalid @enderror"
            id="{{ $name }}"
            name="{{ $name }}"
            value="{{ old($name, $value) }}"
            @if($required) required @endif
            @if($readonly) readonly @endif
            @if($maxlength) maxlength="{{ $maxlength }}" @endif
            @if($placeholder) placeholder="{{ $placeholder }}" @endif
        >
    @endif

    @error($name)
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>
