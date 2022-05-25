import { CapabilityId, Product } from "@octocloud/types";
import { ProductValidator } from "./../validators/backendValidator/ProductValidator";
import { ProductService } from "./../services/ProductService";

interface IProductController {
  getProducts(capabilities: CapabilityId[]): Product[];
  getProduct(id: string, capabilities: CapabilityId[]): Product;
}

export class ProductController implements IProductController {
  private productService = new ProductService();
  public getProducts = (capabilities: CapabilityId[]): Product[] => {
    return this.productService
      .getProducts()
      .map((model) => model.toPOJO({ useCapabilities: true, capabilities }));
  };
  public getProduct = (id: string, capabilities: CapabilityId[]): Product => {
    const product = this.productService
      .getProduct(id)
      .toPOJO({ useCapabilities: true, capabilities });

    new ProductValidator("", capabilities).validate(product);
    return product;
  };
}
