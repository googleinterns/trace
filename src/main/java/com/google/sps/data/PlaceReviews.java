package com.google.sps.data;

import java.util.ArrayList;
import java.util.HashSet;
import java.com.sps.data.Comment;
import java.com.sps.data.RatingHistory;

public class PlaceReviews {

  private final int placeID;
  private ArrayList<Comment> reviews;
  private HashSet<String> reviewers;
  private double rating;
  private RatingHistory history;

  public PlaceReviews(int placeID) {
    this.placeID = placeID;
  }

  public PlaceReviews(int placeID, Comment firstReview, double initialRating) {
    this.placeID = placeID;
    this.reviews.append(firstReview);
    this.rating = initialRating;
    this.reviewers.add(firstReview.getAuthor());
  }

  public addReview(Comment review) {
    if (!reviewers.contains(review.getAuthor())) {
      this.reviews.append(review);
    }
  }

  public addRating(double rating) {
    if (rating > 10) {
      addRating(10);
    } else if (rating < 0) {
      addRating(0);
    } else {
      this.rating += (rating / entries);
    }
  }

}