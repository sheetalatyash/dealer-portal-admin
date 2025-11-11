import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { POLARIS_NOTIFICATION_TOKEN } from '@dealer-portal/polaris-shared';
import { LoggerService } from '../_services';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(
    @Inject(POLARIS_NOTIFICATION_TOKEN) private _polarisNotificationService: { danger: (message: string) => void },
    private _loggingService: LoggerService,
  ) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Add your custom logic here before sending the request
    req = req.clone({
      withCredentials: true,
    });

    // Check if the 'Accept' header is already present. otherwise set to application/json
    if (!req.headers.has('Content-Type') && !req.headers.has('X-Skip-Content-Type')) {
      req = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
      });
    }

    // Encode query parameters safely
    //const encodedReq: HttpRequest<unknown> = this._encodeQueryParams(req);

    // Handle HTTP request and response events here
    return next.handle(req).pipe(
      map((event: HttpEvent<unknown>): HttpEvent<unknown> => {
        if (event instanceof HttpResponse) {
           // Handle additional success/failure responses here
        }

        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        this._loggingService.logError(error.message, { error });

        return throwError(() => error);
      }),
    );
  }

  /**
   * Encodes query parameters to ensure safe URLs.
   * Automatically decodes first to prevent double encoding.
   *
   * @param req Original HttpRequest
   * @returns New HttpRequest with encoded query params
   *
   * @example
   * Input: ?name=John Doe
   * Output: ?name=John%20Doe
   */
  private _encodeQueryParams(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const params: HttpParams = req.params;
    if (!params.keys().length) {
      return req;
    }

    let newParams: HttpParams = new HttpParams();

    params.keys().forEach((key: string): void => {
      const values: string[] = params.getAll(key) ?? [];
      values.forEach((value: string): void => {
        // Decode first to avoid double encoding
        const decoded: string = decodeURIComponent(value);
        const encoded: string = encodeURIComponent(decoded);

        newParams = newParams.append(key, encoded);
      });
    });

    return req.clone({ params: newParams });
  }
}
