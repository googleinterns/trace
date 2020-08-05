package com.google.sps.data;

import java.util.ArrayList;
import java.com.sps.data.Comment;
import java.com.sps.data.RatingHistory;

public class PlaceReviews {

  private final int placeID;
  private ArrayList<Comment> reviews;
  private double rating;
  private int entries = 0;
  private RatingHistory history;

  public PlaceReviews(int placeID) {
    this.placeID = placeID;
  }

  public PlaceReviews(int placeID, Comment firstReview, double initialRating) {
    this.placeID = placeID;
    this.reviews.append(firstReview);
    this.rating = initialRating;
    this.entries++;
  }

  public addReview(Comment review) {
    this.reviews.append(review);
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