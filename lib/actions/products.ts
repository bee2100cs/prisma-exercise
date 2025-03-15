"use server"

import page from "@/app/page";
import Product from "@/components/product/Product";
// import our generated Prisma Client
import { prisma } from "@/lib/prisma";
import { Image } from "@prisma/client";
import { unstable_cache as cache, revalidateTag } from "next/cache";

interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

export async function createProduct(product: CreateProductInput) {
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: {
          create: product.images?.map((url) => ({ url })),
        },
      },
    });
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Error creating product");
  }
}

async function _getProductById(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        reviews: true,
      }
    })
    return product;
  } catch (error) {
    return null;
  }
}

export const getProductById = cache(_getProductById, ["getProductById"], {
  tags: ["Product"],
  revalidate: 60,
});

export async function updateProduct(id: number, product: CreateProductInput) {
  try {
    const updateProduct = await prisma.product.update({
      // Where statement, just like reading a record
      where: { id },
      // Data object is the exact same as 'create'.
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: {
          // Delete previous images and create new ones
          deleteMany: {},
          create: product.images?.map((url) => ({ url })),
        },
      },
    });
    // Mark the data as stale, and refresh it from the database
    revalidateTag("Product");
    return updateProduct;

  } catch (error) {
    return null;
  }
}

export async function deleteProduct(id: number,) {
  try {
    await prisma.product.delete({
      where: { id: id },
    })
    revalidateTag("Product");
    return true;
  } catch (error) {
    return false;
  }
}

export async function getProducts({
  page = 1,
  name,
  minPrice,
  category,
}: {
  page?: number,
  name?: string,
  minPrice?: string,
  category?: string,
}) {
  // Implement pagination using skip & take
  const resultsPerPage = 5;
  const skip = (page - 1) * resultsPerPage;
  const filterCategory = category !== "all";
  try {
    const allProducts = await prisma.product.findMany({
      // Fetch data from linked tables
      include: {
        images: true,
        reviews: true,
      },
      // Dynamically build the where object
      where: {
        name: {
          contains: name,
          mode: "insensitive"
        },
        // Dynamically add category filter with the spread operator
        ...(filterCategory && { category }),

        // Min price filter using the gte filter to check if the price filed
        //is greater than or equal to the minPrice filter
        // {similar to WHERE price>= minPrice in SQL}
        ...(minPrice && {
          price: {
            gte: parseInt(minPrice), //Price must be >= the minPrice
          },
        }),
      },
      // Implement pagination
      skip,
      take: resultsPerPage,
    });

    const products = allProducts.map((product) => ({
      ...product,
      rating:
        Math.floor(
          product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        ) || 0,
      image: product.images[0]?.url,
    }));

    return products;
  } catch (error) {
    return [];
  }
}