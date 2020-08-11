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
    String upVotes = request.getParameter("up");
    String downVotes = request.getParameter("down");

    Entity review = retrieveReview(comment_id, datastore);
    if(review != null) {
      review.setProperty("positive", upVotes);
      review.setProperty("negative", downVotes);
      datastore.put(review);
    }

    // Set response and return JSON.
    response.setContentType("text/json;");
    response.getWriter().println("Your vote has been cast!");
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
}