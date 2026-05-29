// Reverse redirect — if a large screen lands on mobile.html, send to desktop
// To revert: comment out NEW BLOCK below, uncomment OLD BLOCK below

// NEW BLOCK
const mobileCheckRegExp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini/i;

if (mobileCheckRegExp.test(navigator.userAgent)) {
  // true for mobile device — stay here
  console.warn("mobile device");
} else {
  // false for not mobile device
  console.warn("not mobile device");
  if (window.innerWidth <= 670) {
    // small screen — stay here
    console.warn("but small size");
  } else {
    // large screen — redirect to desktop
    console.warn("redirect to desktop");
    window.location.href = siteConfig.desktopRedirect;
  }
}
// END NEW BLOCK

// OLD BLOCK (no redirect existed — uncomment to restore)
/*
*/
// END OLD BLOCK
