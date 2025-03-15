"use client";

import { createReview } from "@/lib/actions/reviews";
import RatingSelect from "./Review/RatingSelect";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

export default function Component({ id }: { id: string }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsPending(true);

    try {
      const success = await createReview({
        name,
        rating,
        content: review,
        productId: parseInt(id),
        });
        if (success) {
          console.log("review created successfully")
          toast.success("Your review has been added!")
        } else {
          console.log("Failed to create a review")
          toast.error("Oops! Trouble adding your review")
        }

    } catch(error) {
      console.error("Error creating review");
    } finally {
      setIsPending(false);
    }
  };
  return (
    <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add Review</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block font-medium text-gray-700 dark:text-gray-300"
              htmlFor="name"
            >
              Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-300"
              id="name"
              placeholder="Enter your name"
              type="text"
            />
          </div>
          <div>
            <label
              className="block font-medium text-gray-700 dark:text-gray-300"
              htmlFor="rating"
            >
              Rating
            </label>
            <div className="flex items-center">
              <RatingSelect onChange={setRating} />
            </div>
          </div>
          <div>
            <label
              className="block font-medium text-gray-700 dark:text-gray-300"
              htmlFor="review"
            >
              Review
            </label>
            <textarea
              value={review}
              onChange={(event) => setReview(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-300"
              id="review"
              placeholder="Write your review"
              rows={4}
            />
          </div>
          <Button
            className="w-full bg-black hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "loading.." : "Submit Your Review"}
            <Send className="size-6 ml-2"/>
          </Button>
        </form>
      </div>
    </section>
  );
}
