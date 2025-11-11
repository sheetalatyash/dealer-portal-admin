import { PaginationResponse } from './pagination-response.class';

describe('PaginationResponse', () => {
  let paginationResponse: PaginationResponse<any>;

  beforeEach(() => {
    paginationResponse = new PaginationResponse<number>({
      data: [1, 2, 3],
      totalRecords: 3,
      pageNumber: 1,
      pageSize: 3,
    });
  });

  it('should create an instance', () => {
    expect(paginationResponse).toBeTruthy();
  });

  it('should return the correct items', () => {
    // Act
    const items = paginationResponse.data;
    // Assert
    expect(items).toEqual([1, 2, 3]);
  });

  it('should return the correct totalRecords', () => {
    // Act
    const totalRecords = paginationResponse.totalRecords;
    // Assert
    expect(totalRecords).toBe(3);
  });

  it('should return the correct pageNumber', () => {
    // Act
    const pageNumber = paginationResponse.pageNumber;
    // Assert
    expect(pageNumber).toBe(1);
  });

  it('should return the correct pageSize', () => {
    // Act
    const pageSize = paginationResponse.pageSize;
    // Assert
    expect(pageSize).toBe(3);
  });

  it('should return the correct totalPages', () => {
    // Act
    const totalPages = paginationResponse.totalPages;
    // Assert
    expect(totalPages).toBe(1);
  });

  it('should map data correctly', () => {
    // Arrange
    const mapFn = (x: number) => x * 2;
    // Act
    const mappedResponse = paginationResponse.mapData(mapFn);
    // Assert
    expect(mappedResponse.data).toEqual([2, 4, 6]);
    expect(mappedResponse.totalRecords).toBe(3);
    expect(mappedResponse.pageNumber).toBe(1);
    expect(mappedResponse.pageSize).toBe(3);
  });

  it('should handle missing fields in constructor', () => {
    // Act
    const response = new PaginationResponse<number>({});
    // Assert
    expect(response.data).toEqual([]);
    expect(response.totalRecords).toBe(0);
    expect(response.pageNumber).toBe(0);
    expect(response.pageSize).toBe(1);
  });

  it('should handle undefined data in mapData', () => {
    // Arrange
    const response = new PaginationResponse<number>({});
    const mapFn = (x: number) => x * 2;
    // Act
    const mappedResponse = response.mapData(mapFn);
    // Assert
    expect(mappedResponse.data).toEqual([]);
    expect(mappedResponse.totalRecords).toBe(0);
    expect(mappedResponse.pageNumber).toBe(0);
    expect(mappedResponse.pageSize).toBe(1);
  });
});
