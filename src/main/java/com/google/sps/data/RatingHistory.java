package com.google.sps.data;

import java.util.Date;
import java.util.List;

/** RatingHistory Class
 * This object class is used to track the history of a locations aggregate score each month
 * Used as an object in the PlaceReviews
 */
public class RatingHistory {

  private final Date start;
  private int length;
  private List<double> history;

  /** Constructor
   * Requires a start date for its constructor
   */
  public RatingHistory(Date start) {
    this.start = start;
  }

  /** Accessor Method
   * Returns the array of aggregates
   */
  public List<double> getHistory() {
    return this.history();
  }

  // TODO: Implement an updater function

}