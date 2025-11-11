import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CoreApiService } from '../../_apis/core/core.api.service';
import { CoreDataOptions } from '../../_apis/core/core.service.api.types';
import { CoreData } from './_classes/core-data.class';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private _repository: CoreApiService) {}

  public getCoreData$(options?: CoreDataOptions): Observable<CoreData> {
    return this._repository.getCoreData$(options).pipe(map((response) => new CoreData(response.data)));
  }
}
