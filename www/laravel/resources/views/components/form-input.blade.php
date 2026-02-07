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
    'invalidFeedback' => null,
    'formText' => null,
    'honeypot' => false,
    'autocomplete' => null,
])

<div class="mb-3 {{ $honeypot ? 'subject' : '' }}">
    <label for="{{ $name }}" class="col-form-label">{{ $label }}</label>

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
            @if($autocomplete) autocomplete="{{ $autocomplete }}" @endif
            @if($honeypot) tabindex="-1" aria-hidden="true" @endif
        >{{ old($name, $value) }}</textarea>
    @elseif($type === 'select')
        <select
            class="form-select @error($name) is-invalid @enderror"
            id="{{ $name }}"
            name="{{ $name }}"
            @if($required) required @endif
            @if($readonly) disabled @endif
            @if($autocomplete) autocomplete="{{ $autocomplete }}" @endif
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
            @if($autocomplete) autocomplete="{{ $autocomplete }}" @endif
            @if($honeypot) tabindex="-1" aria-hidden="true" @endif
        >
    @endif

    @if($invalidFeedback)
        <div class="invalid-feedback">{{ $invalidFeedback }}</div>
    @else
        @error($name)
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    @endif
    @if($formText)
        <div class="form-text">{{ $formText }}</div>
    @endif
</div>
