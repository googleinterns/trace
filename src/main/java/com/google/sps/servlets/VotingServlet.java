package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.PlaceReviews;
import com.google.sps.data.Comment;
import com.google.sps.data.RatingHistory;
import java.util.*;
import java.io.IOException;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Servlet that updates votes on reviews.*/
@WebServlet("/vote")
public class VotingServlet extends HttpServlet {
  /** 
   * Retrieves "Review" entity using comment_id and updates the datastore with the new voting values.
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    UserService userService = UserServiceFactory.getUserService();
    Long comment_id = Long.parseLong(request.getParameter("comment_id"));
    String upvotes = request.getParameter("up");
    String downvotes = request.getParameter("down");

    // Gets the review itself from Datastore
    Entity review = retrieveReview(comment_id, datastore);
    
    // Gets the review/voter pairs from Datastore. 
    Filter reviewFilter = new FilterPredicate("review_id", FilterOperator.EQUAL, comment_id);
    Filter voterFilter = new FilterPredicate("voter", FilterOperator.EQUAL, userService.getCurrentUser().getEmail());
    Filter combinedFilter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(reviewFilter, voterFilter));
    Query query = new Query("voter-review").setFilter(combinedFilter);

    PreparedQuery results = datastore.prepare(query);

    // Checks if a review exists, and if the current user has already voted on it. 
    // Also makes sure that input is not malicious.
    if(review != null && isNumeric(upvotes) && isNumeric(downvotes)) {

      String vote = "negative";
      // Check if the number of upvotes as changed, if so, the vote was positive.
      if (!upvotes.equals(review.getProperty("positive"))){
        vote = "positive";
      }
      
      // Updates the review's vote count
      review.setProperty("positive", upvotes);
      review.setProperty("negative", downvotes);
      datastore.put(review);

      // Adds the new review voter-pair
      Entity voterReview = new Entity("voter-review");
      // Checks to see if we can adjust an old voter-review pair
      if (results.countEntities() > 0){
        voterReview = results.asSingleEntity();
      } 
      voterReview.setProperty("voter", userService.getCurrentUser().getEmail());
      voterReview.setProperty("review_id", comment_id);
      voterReview.setProperty("vote", vote);
      datastore.put(voterReview);
    }
  }

  /** 
    * Creates key to query datastore for a specific review.
    */
  private Entity retrieveReview(Long id, DatastoreService datastore) {
    Key commentKey = KeyFactory.createKey("Review", id);
    Entity review = null;
    try {
      review = datastore.get(commentKey);
    } catch (Exception e) {
      System.out.println("No matching entity found.");
    }
    return review;
  }

  /** Check if a given string can be converted to a number 
   * @param String takes a string to check 
   * @return true if the String is a number.
   */
  public static boolean isNumeric(String str) {
    if (str == null) {
      return false;
    }
    try {
      int i = Integer.parseInt(str);
    } catch (NumberFormatException err) {
      return false;
    }
    return true;
  }
}