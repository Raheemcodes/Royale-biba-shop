export interface Cart {
  _id: string,
  productId: {
    _id: string,
    title: string,
    imageUrl: string,
    price: number,
  },
  quantity: number,
}

// export class Cart {
//   constructor(
//     public _id: string,
//     public productId: { title: string; imageUrl: string; price: number },
//     public quantity: number,
//   ) {}
// }
