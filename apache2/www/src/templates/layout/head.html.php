<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="/assets/custom.bootstrap.min.css">

  <title><?=$meta['title']?> | <?php if (isset($sidebar)) { ?><?=$sidebar->getTitle()?> | <?php } ?>Ramsey El-Naggar</title>

  <?php if (isset($meta['description'])) { ?>
    <meta name="description" content="<?=$meta['description']?>">
  <?php } ?>

  <?php if (isset($meta['noindex']) && $meta['noindex']) { ?>
    <meta name="robots" content="noindex">
  <?php } ?>
</head>