export class Product {
  constructor(
    public _id: string,
    public title: string,
    public price: number,
    public imageUrl: string,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
