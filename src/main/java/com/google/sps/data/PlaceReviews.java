package com.google.sps.data;

import java.util.ArrayList;
import java.util.HashSet;
import com.google.sps.data.Comment;
import com.google.sps.data.RatingHistory;
import java.util.Collections;
import java.util.List;

/** 
 * PlaceReviews object class
 * The PlaceReviews object, used as the master object detailing a locations reviews and ratings
 * Uses implementations of smaller Comment and RatingHistory class.
 * Does not permit multiple reviews by one author for a given location.
 * Attempts to avoid PlaceReviews objects without any ratings or reviews.
 */
public class PlaceReviews {

  private final String place_id;
  private List<Comment> reviews;
  private double rating;

   /**
    * Constructor
    * This is the minimal, and avoided, constructor that makes an object without reviews.
    */
  public PlaceReviews(String place_id) {
    this.place_id = place_id;
    this.reviews = new ArrayList<Comment>();
  }

  /** 
   * Constructor
   * This constructor provides an initial rating and review.
   */
  public PlaceReviews(String place_id, Comment firstReview, double initialRating) {
    this.reviews = new ArrayList<Comment>();
    this.place_id = place_id;
    this.reviews.add(firstReview);
    this.rating = initialRating;
  }

  /** 
   * Updater method
   * Adds a review to the existing PlaceReviews list of reviews
   */
  public void addReview(Comment review) {
    if (this.reviewedBy(review.getAuthor())) {
      replaceReview(review);
    } else {
      this.reviews.add(review);
    }
  }

  /**
   * Updater method
   * Replaces previous review with the new review for a given author
   */
   private void replaceReview(Comment review) {
    Comment prevReview = getPrevReview(review.getAuthor());
    prevReview.updateComment(review);
   } 

  /**
   * Accessor Method
   * Searches the existing Array of comments to find the other by the same author
   * Assumes that there was a previous post by author
   * @return Comment the previous comment
   *                  TODO: Implement with Binary Search
   */
   private Comment getPrevReview(String author) {
    Collections.sort(this.reviews, Comment.ORDER_BY_AUTHOR);
     for (Comment cur : this.reviews) {
       if (cur.getAuthor() == author) {
         return cur;
       }
     }
     return this.reviews.get(0);
   }

  /** 
   * Updater method
   * This adds a rating to a given PlaceReviews aggregate rating
   * This does not permit a rating outside of [0, 10]
   */
  public void addRating(double rating) {
    if (rating > 10) {
      addRating(10);
    } else if (rating < 0) {
      addRating(0);
    } else {
      this.rating += (rating);
    }
  }

  /**
   * Checks if author has posted at this location before
   * @return if the user has posted a review before for this location
   */
  public boolean reviewedBy(String person) {
    // TODO: Use datastore querying to search for this
    return true;
  }

  /**
   * Accessor method
   * Returns the id of the location
   */
  public String getID() {
    return this.place_id;
  }

  public List<Comment> getReviews(){
    return this.reviews;   
  }
}