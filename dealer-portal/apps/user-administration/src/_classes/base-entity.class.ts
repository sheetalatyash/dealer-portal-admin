
/**
 * A base class representing an entity with an id and name.
 * This class can be extended to create specific entity classes.
 */
export class BaseEntity {
  [key: string]: string;

  /**
   * The unique identifier of the entity.
   */
  public id: string = '';

  /**
   * The name of the entity.
   */
  public name: string = '';

  /**
   * Constructs a new instance of the BaseEntity class.
   *
   * @param data - An optional object containing initial values for the entity properties.
   *               If not provided, default values will be used.
   */
  constructor(data: Partial<BaseEntity> = {}) {
    Object.assign(this, data);
  }
}
