<figure class="figure m-3 text-center w-100">
  <img src="/assets/img/production-deployment.png" class="figure-img img-fluid" alt="TBD">
  <figcaption class="figure-caption text-center">
    TBD
  </figcaption>
</figure>

<p>
In the diagram you can see GitHub being used essentially as a backup for the source code.
Although the production server does pull from GitHub, this is only needed for the initial deployment or in case of changes to key deployment scripts.
For any other change, the sole developer (me) simply builds and tests the Docker images locally before pushing to Docker Hub.
In the hypothetical case of a team of developers, I would use a cloud-based CI service (e.g. GitHub Actions) to build and test the images from the GitHub repository instead.
Either way, the images are then pulled from Docker Hub by the production server and deployed to the production environment.
</p>

<p>
When writing Dockerfiles it's easy to get carried away and end up with bloated images.
But on the other hand, choosing the slimmest possible base image can end up being impossible to configure as desired (looking at you, Alpine Linux).
For this reason, and in the spirit of <a href="/projects/website/takeaways">getting my hands dirty</a>, I chose to write my own Dockerfiles from scratch.
This allowed me to keep the images as slim as possible while still having full control over the configuration.
The result, as you can see below, is that the total size of the images is less than 190MB -- not bad for a fully customisable LAPP stack!
</p>

<figure class="figure m-3 text-center w-100">
  <img src="/assets/img/development-deployment.png" class="figure-img img-fluid" alt="TBD">
  <figcaption class="figure-caption text-center">
    TBD
  </figcaption>
</figure>