<figure class="figure m-3 text-center col-lg-5 float-start w-100-lg-down">
  <img src="/assets/img/back/controllers-uml.png" class="figure-img img-fluid" alt="Simplified UML Class Diagram for the Controllers namespace.">
  <figcaption class="figure-caption text-center">The hierarchal family tree of controllers. It's like Game of Thrones, but with less dragons and more function overloading. Rawr!</figcaption>
</figure>

<p>
  Time to lift the curtain on the next act of our website-building drama.
  With the template engine revving away, I next needed to program some friends to help me manage all the web pages I was going to make.
  Enter the controllers.
  Controllers are like stage directors, ensuring that each part of the digital play proceeds as planned.
</p>

<p>
  Let's glance at the cast of controllers, as detailed in the diagram stage-left:
  <ul>
    <li>
      We have the head honcho, the <code><a href="<?=$controllersUrl?>AbstractController.php" target="_blank" rel="noopener noreferrer">AbstractController</a></code> <?=includeIcon('box-arrow-up-right')?>, acting as the base for all other controllers.
      Picture it as the veteran stage director passing down wisdom to the newbies.
    </li>
    <li>
      Next up, we have the <code><a href="<?=$controllersUrl?>AbstractProject.php" target="_blank" rel="noopener noreferrer">AbstractProject</a></code> <?=includeIcon('box-arrow-up-right')?>, a base project controller.
      This savvy maestro provides functionalities common to all project controllers.
    </li>
    <li>
      Then we have the individual controllers for each project (currently <code><a href="<?=$controllersUrl?>Website.php" target="_blank" rel="noopener noreferrer">Website</a></code> <?=includeIcon('box-arrow-up-right')?>, <code><a href="<?=$controllersUrl?>Beetle.php" target="_blank" rel="noopener noreferrer">Beetle</a></code> <?=includeIcon('box-arrow-up-right')?>, and <code><a href="<?=$controllersUrl?>SDP.php" target="_blank" rel="noopener noreferrer">SDP</a></code> <?=includeIcon('box-arrow-up-right')?>), and each menu (currently just the <code><a href="<?=$controllersUrl?>Engineer.php">Engineer</a></code> <?=includeIcon('box-arrow-up-right')?>).
      Each one of them is a star in their own right.
    </li>
  </ul>
</p>

<p>
  Our Engineer controller takes center stage, managing all the individual pages that branch off the main menu: currently <a href="/">Home</a>, <a href="/about">About</a>, <a href="/contact">Contact</a>.
  This design was intentional, allowing for potential future expansion of the website.
  I imagined separate menus for my engineering projects, tutoring services, and even my musical exploits.
  Maybe I could add a menu for a travel blog, work 4 hours a week, and live off the passive income!
  Maybe I could automate it with ChatGPT, clock in 4 minutes per year, and invest all the profits in crypto!
  I'd never have to work again!
  ...Then I woke up and got back to work. As every stage director knows, the show must go on!
</p>