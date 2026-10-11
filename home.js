"use strict";

// Keep previously shared case links working after introducing the homepage.
const oldRoute = window.location.hash.slice(1);
if (oldRoute.startsWith("task=") || oldRoute === "guide") {
  const reviewUrl = new URL("./review.html", window.location.href);
  reviewUrl.hash = oldRoute;
  window.location.replace(reviewUrl.href);
}

window.RTLBenchLSData = {
  register(key, snapshot) {
    if (key !== "evaluation-status.json") return;
    const counts = snapshot.formal_artifacts;
    document.getElementById("qualified-count").textContent = counts.dual_packages.toLocaleString();
    document.getElementById("incomplete-count").textContent = counts.incomplete.toLocaleString();
    document.getElementById("testbench-count").textContent = snapshot.families.testbench.toLocaleString();
    document.getElementById("verification-date").textContent = snapshot.validated_at.slice(0, 10);
  },
};

const statusScript = document.createElement("script");
const interfaceVersion = new URL(document.currentScript.src).searchParams.get("v") || "current";
statusScript.src = `./viewer-data/evaluation-status.js?v=${interfaceVersion}`;
statusScript.onerror = () => {
  document.getElementById("verification-date").textContent = "Snapshot unavailable; see repository coverage";
};
document.head.append(statusScript);
