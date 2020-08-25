package com.google.sps.data;
import com.google.sps.data.Comment;
import com.google.sps.data.RatingHistory;
import java.util.Set;
import java.util.List;
import java.util.Collections;
import java.util.HashSet;
import java.util.ArrayList;

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
  private Set<String> reviewers;
  private String currUser;

   /**
    * Constructor
    * This is the minimal, and avoided, constructor that makes an object without reviews.
    */
  public PlaceReviews(String place_id) {
    this.place_id = place_id;
    this.reviews = new ArrayList<Comment>();
    this.reviewers = new HashSet<>();
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
    this.reviewers = new HashSet<>();
    this.currUser = null;
  }

  /* Keeps track of who is currently logged in */
  public void setCurrentUser(String person){
    this.currUser = person;
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
   *                        Collections.sort(this.reviews, Comment.ORDER_BY_AUTHOR);
   */
  private Comment getPrevReview(String author) {
    for (Comment cur : this.reviews) {
      if (cur.getAuthor() == author) {
        return cur;
      }
    }
    return this.reviews.get(0);
  }

  /**
   * Public sorting method
   * Sorts the internal Comment list by their voter rating, recency,
   * or "relevancy" where "relevancy" is defined as the scores
   * they gave a location weighted by their recency.
   */
  public void sortReviews(String sortType) {
    if (sortType.equals("highest-rated")) {
      Collections.sort(this.reviews, Comment.ORDER_BY_SCORE);
    } else if(sortType.equals("recent")) {
      Collections.sort(this.reviews, Comment.ORDER_BY_DATE);
    } else {
      Collections.sort(this.reviews, Comment.ORDER_BY_DATE);
      List<Comment> weightedSorting = new ArrayList<Comment>(this.reviews);
      for(int i = 0; i < this.reviews.size(); i++) {
        weightedSorting.get(i).setWeightedRating(this.reviews.get(i).getRating() * (this.reviews.size() - i));
      }
      Collections.sort(weightedSorting, Comment.ORDER_BY_WEIGHTED_RATING);
      this.reviews.clear();
      this.reviews.addAll(weightedSorting);
    }
  }

  /** 
   * Updater method
   * This adds a rating to a given PlaceReviews aggregate rating
   * This does not permit a rating outside of [0, 5]
   */
  public void setRating(double rating) {
    if (rating > 5) {
      setRating(5);
    } else if (rating < 0) {
      setRating(0);
    } else {
      this.rating += (rating);
    }
  }

  /* Adds the author of the review to the reviews set.*/
  public void addReviewer(String author){
    reviewers.add(author);
  }

  /**
   * Checks if author has posted at this location before
   * @return if the user has posted a review before for this location
   */
  public boolean reviewedBy(String person) {
    return reviewers.contains(person);
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