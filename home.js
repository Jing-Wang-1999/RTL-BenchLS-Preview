"use strict";

// Keep previously shared case links working after introducing the homepage.
const oldRoute = window.location.hash.slice(1);
if (oldRoute.startsWith("task=") || oldRoute === "guide") {
  const reviewUrl = new URL("./review.html", window.location.href);
  reviewUrl.hash = oldRoute;
  window.location.replace(reviewUrl.href);
}
