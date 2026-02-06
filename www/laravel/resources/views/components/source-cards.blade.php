@props(['sources'])

<div class="row">
  @foreach($sources as $source)
    <div class="col-md-6 mb-3">
      <div class="card flex-column equal-height">
        <div class="card-header">
          <div class="mb-0 h6">{{ $source->title }}</div>
        </div>
        <div class="card-body">
          <i class="bi bi-{{ $source->icon }}"></i>
          &nbsp;
          <x-external-link href="{{ $source->href }}">{{ $source->html }}</x-external-link>
        </div>
      </div>
    </div>
  @endforeach
</div>
