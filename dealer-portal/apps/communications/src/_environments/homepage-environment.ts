import { Environment } from '@dealer-portal/polaris-core';

export interface HomepageEnvironment extends Environment {
  trainingContent: {
    homepageAndNavigation: {
      videoUrl: string;
      articleUrl: string;
      articleUrlFrench: string;
    };
    securityAdmin: {
      videoUrl: string;
      articleUrl: string;
      articleUrlFrench: string;
    };
  };
}
