<p>
  In a quest to squeeze out every drop of efficiency possible during development, testing, staging, and deployment, I whipped up a tantalizing array of Bash scripts to automate our favorite tasks.
  Feel free to explore this joyful jar of code goodies in the <a href="https://github.com/relnaggar/rmsy.me/tree/master/script" target="_blank"><code>script</code></a> <?=includeIcon('box-arrow-up-right')?> directory, or let your curiosity be quenched by the README file waiting for you in the project's <a href="/projects/website/#source">source code</a>.
</p>

<p>  
  Ever watched a virtuoso chef effortlessly chop, slice, and dice ingredients at record speed?
  That was my inspiration while using <a href="https://github.com/github/scripts-to-rule-them-all" target="_blank">this guide</a> <?=includeIcon('box-arrow-up-right')?> to design my scripts.
  I also followed the <a href="https://google.github.io/styleguide/shellguide.html" target="_blank">Google Shell Style Guide</a> <?=includeIcon('box-arrow-up-right')?> to ensure the scripts are as palatable and digestible as a gourmet meal.
  So, let's have a quick gander at some of the Bash hits on the menu:
</p>

<dl>
  <dt><code>script/bootstrap</code></dt>
  <dd>
    The magic spell that downloads and installs all the ingredients required to cook up the project.
    In other words, it's the incantation to summon <a href="/projects/website/devops#docker">Docker</a>.
  </dd>
  <dt><code>script/setup</code></dt>
  <dd>
    Sets up the project for the first time.
    Think of it as your personal sous chef, configuring Docker, and generating development secrets so that HTTPS works flawlessly, even on localhost.
  </dd>
  <dt><code>script/server</code></dt>
  <dd>
    Our trusty kitchen hand, ready to build and start the application.
    Choose your own adventure: development, staging, or production mode.
  </dd>
  <dt><code>script/test</code></dt>
  <dd>
    The meticulous food critic, ready to put the project through a rigorous <a href="/projects/website/devops#testing">taste test</a>.
    Choices include: bite-sized unit tests on the development build or the full dining experience with end-to-end tests on the production build.
  </dd>
  <dt><code>script/console</code></dt>
  <dd>
    The door to the inner sanctum of your chosen Docker container, where you can perform your commands directly.
    There's an option to enter as the root user, so tread with caution.
  </dd>
  <dt><code>script/status</code></dt>
  <dd>
    The all-seeing eye that displays the status of all Docker images and containers, including their port mappings and the lively processes buzzing inside each container.
  </dd>
  <dt><code>script/logs</code></dt>
  <dd>
    Your private detective, revealing the log files for all Docker containers.
    This script is invaluable when the server crashes mid-development, often a result of a playful wrestle with the Apache <code>.conf</code> files.
  </dd>
</dl>