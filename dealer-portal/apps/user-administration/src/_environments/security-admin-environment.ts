import { Environment } from '@dealer-portal/polaris-core';

export interface SecurityAdminEnvironment extends Environment {
  trainingContent: {
    securityAdmin: {
      videoUrl: string;
      articleUrl: string;
      articleUrlFrench: string;
    };
  };
}
