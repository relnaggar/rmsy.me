<p>
  Alright, confession time.
  I've been a naughty little developer for this project and haven't penned a single proper test.
  Horrified gasp, right?
  Absolutely shocking behaviour.
  But before you spank my ass and banish me from the coding kingdom, give me a chance to redeem myself, at least from the DevOps perspective.
  Despite the numerous test-shaped holes, what is not lacking is the effort I excerted to painstakingly configure <strong>automated testing</strong> and set up <strong>testing frameworks</strong>.
</p>

<p>
  Here's the lowdown:
  Every time I flex my coding muscles and push to GitHub, a <code>git hook</code> prompts my <code>script/test</code> <a href="/projects/website/devops#bash">Bash script</a> to run.
  No push occurs until the script is happy, and it only gets happy if the tests pass.
  The script first unleashes PHPUnit tests on the development build (the production build is kept feather-light by skipping Composer and PHPUnit).
  Presently, there's just a cute dummy test and a connection test to the PostgreSQL database.
</p>

<p>
  But what if those cheeky unit tests pass?
  Then we roll out the big guns: end-to-end tests run on both the development and production builds.
  These tests are run by Selenium in a separate Docker container, keeping the production build devoid of any Java-induced bloat.
  The tests, penned in English-like Cucumber, are performed by Selenium controlling a virtual web browser like a skilled puppeteer.
  And for your viewing pleasure, every test comes with a <code>.mp4</code> recording!
</p>

Here's a basic test in Cucumber (yes, it looks just like English):

<p>
  <code>
    <br>
    Feature: title
    <br>
    The homepage should have a title
    <br>
    <br>
    Scenario: The page title should work
    <br>
    &nbsp;&nbsp;Given I am on the homepage
    <br>
    &nbsp;&nbsp;Then the page title should be "Home | Ramsey El&#8209;Naggar"
  </code>
</p>

And here's how it looks in action:
<figure class="figure m-3 text-center w-100">
  <img src="/assets/img/selenium.gif" class="figure-img img-fluid" alt="GIF of Selenium running an automated browser test.">
  <figcaption class="figure-caption text-center">Selenium works so you don't have to.</figcaption>
</figure>