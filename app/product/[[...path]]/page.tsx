import AddReview from "@/components/product/AddReview";
import Product from "@/components/product/Product";
import AddProduct from "@/components/product/AddProduct";
import DeleteProduct from "@/components/delete/DeleteProduct";
import { getProductById } from "@/lib/actions/products";
import ReviewView from "@/components/product/Review";

export const revalidate = 1;

export default async function Page({ params }: { params: { path: string[] } }) {

  // Figure out the first and second part of the url
  const method = params.path[0];
  const id = params.path[1];

  // If the method is 'new', render the AddProduct component
  if (method === "new") {
    return <AddProduct />;
  }

  // Figure out which component to render based on the method
  if (method === "edit") {
    const product = await getProductById(parseInt(id));
    
    if (!product) {
      return <div>Product not found</div>;
    }
    return <AddProduct edit id={id} product={product} />;
  }
  if (method === "delete") {
    return <DeleteProduct id={id} />;
  }


  // Get the product by ID
  const product = await getProductById(parseInt(id));

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="pt-20 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto py-12 px-4">
      <Product product={product}/>
      <div className="flex flex-col gap-y-5">
        <span className="text-2xl font-bold h-fit">Customer Reviews</span>
        <div className="grid gap-5">
          {/*
            map over reviews and send the review
            from our database to the Review component
          */}
          {product.reviews.map((review) => (
            <ReviewView key={review.id} review={review} />
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <AddReview id={id}/>
      </div>
    </div>
  );
}
