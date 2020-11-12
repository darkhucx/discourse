import { queryAll } from "discourse/tests/helpers/qunit-helpers";
import { click, visit, settled } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";

async function catchAbortedTransition() {
  try {
    await visit("/u/eviltrout/summary");
  } catch (e) {
    if (e.message !== "TransitionAborted") {
      throw e;
    }
  }
  await settled();
}

acceptance("Enforce Second Factor", function (needs) {
  needs.user();
  needs.pretender((server, helper) => {
    server.post("/u/second_factors.json", () => {
      return helper.response({
        success: "OK",
        password_required: "true",
      });
    });
  });

  test("as an admin", async function (assert) {
    await visit("/u/eviltrout/preferences/second-factor");
    this.siteSettings.enforce_second_factor = "staff";

    await catchAbortedTransition();

    assert.equal(
      queryAll(".control-label").text(),
      "Password",
      "it will not transition from second-factor preferences"
    );

    await click("#toggle-hamburger-menu");
    await click("a.admin-link");

    assert.equal(
      queryAll(".control-label").text(),
      "Password",
      "it stays at second-factor preferences"
    );
  });

  test("as a user", async function (assert) {
    updateCurrentUser({ moderator: false, admin: false });

    await visit("/u/eviltrout/preferences/second-factor");
    this.siteSettings.enforce_second_factor = "all";

    await catchAbortedTransition();

    assert.equal(
      queryAll(".control-label").text(),
      "Password",
      "it will not transition from second-factor preferences"
    );

    await click("#toggle-hamburger-menu");
    await click("a.about-link");

    assert.equal(
      queryAll(".control-label").text(),
      "Password",
      "it stays at second-factor preferences"
    );
  });

  test("as an anonymous user", async function (assert) {
    updateCurrentUser({ moderator: false, admin: false, is_anonymous: true });

    await visit("/u/eviltrout/preferences/second-factor");
    this.siteSettings.enforce_second_factor = "all";
    this.siteSettings.allow_anonymous_posting = true;

    await catchAbortedTransition();

    assert.notEqual(
      queryAll(".control-label").text(),
      "Password",
      "it will transition from second-factor preferences"
    );

    await click("#toggle-hamburger-menu");
    await click("a.about-link");

    assert.notEqual(
      queryAll(".control-label").text(),
      "Password",
      "it is possible to navigate to other pages"
    );
  });
});
