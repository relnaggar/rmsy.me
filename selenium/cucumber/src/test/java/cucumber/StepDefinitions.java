package cucumber;

import org.openqa.selenium.WebDriver;

import io.cucumber.java.en.*;

import static org.junit.Assert.*;

public class StepDefinitions {

  private Hooks hooks;

  public StepDefinitions(Hooks hooks) {
    this.hooks = hooks;
  }

  @Given("I am on the homepage")
  public void I_visit_homepage() {
    WebDriver driver = hooks.getDriver();
    String baseUrl = hooks.getBaseUrl();
    driver.get(baseUrl);
  }

  @Then("the page title should be {string}")
  public void checkTitle(String expectedTitle) {
    WebDriver driver = hooks.getDriver();
    assertEquals(driver.getTitle(), expectedTitle);
  }
}
