import { queryAll } from "discourse/tests/helpers/qunit-helpers";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import Ember from "ember";
import hbs from "htmlbars-inline-precompile";

acceptance("CustomHTML template", function (needs) {
  needs.hooks.beforeEach(() => {
    Ember.TEMPLATES["top"] = hbs`<span class='top-span'>TOP</span>`;
  });
  needs.hooks.afterEach(() => {
    delete Ember.TEMPLATES["top"];
  });

  test("renders custom template", async function (assert) {
    await visit("/static/faq");
    assert.equal(
      queryAll("span.top-span").text(),
      "TOP",
      "it inserted the template"
    );
  });
});
