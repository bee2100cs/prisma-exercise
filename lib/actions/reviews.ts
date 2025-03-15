'use server'

import { unstable_cache as cache, revalidateTag } from "next/cache";

import { prisma } from "../prisma";
import { toast } from "sonner";


export interface createReviewInput {
    name: string,
    content: string,
    rating: number,
    productId: number,

}
export async function createReview(input: createReviewInput) {
    try {
        const newReview = await prisma.review.create({
            data: {
                name: input.name,
                content: input.content,
                rating: input.rating,
                product: {
                    connect: {
                        id: input.productId
                    },
                },
            },
        });
        revalidateTag("Product")
        return true;
    } catch (error) {
        console.error("Error creating review", error);
        toast.error("Error create review")
        return false;
    }


}