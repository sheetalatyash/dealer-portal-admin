import { PathLocationStrategy } from '@angular/common';

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalPrepareExternalUrl = PathLocationStrategy.prototype.prepareExternalUrl;

PathLocationStrategy.prototype.prepareExternalUrl = function (internal) {
  let url = '';

  if (originalPrepareExternalUrl) {
    url = originalPrepareExternalUrl.call(this, internal);
  }

  if (url === '') {
    return url;
  }

  if (url.endsWith('.html')) {
    return url;
  }

  return url.addTrailingSlash();
};
